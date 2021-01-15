import './style.module.scss';

import {
    Input,
    Table,
    Button,
    Select,
    Upload,
    message,
    Spin,
    Tooltip,
    Radio,
    Card,
    Row,
    Col,
    Modal,
    Form
} from "antd";

import { UploadOutlined } from '@ant-design/icons';

import React, { useEffect, useState, useRef } from 'react';

import { useTranslation } from 'react-i18next';

import paraSentenceAPI from "../../../api/para-sentence";

import { LANGS, STATUS_CODES } from '../../../constants';

import dataFieldAPI from '../../../api/admin/data-field';
import { useForm } from 'antd/lib/form/Form';

const ImportFileModal = (props) => {

    const {
        isModalImportVisible,
        setIsModalImportVisible,
        reloadSentenceData,
        reloadSentencePaginationParams,
        currentFilter
    } = props;
    
    const { t } = useTranslation(['common']);

    const [importStatus, setImportStatus] = useState({})

    const [uploadingFile, setUploadingFile] = useState(false);

    const [searchInput, setSearchInput] = useState('');

    const initialValues = {
        dataFieldId: '',
        lang1: '',
        lang2: '', 
        fileList: []
    }

    const [form] = useForm()

    const [dataFieldList, setDataFieldList] = useState({
        items: [],
        total: 0,
        page: 1,
        perPage: 5,
    });
    
    const [dataFieldPagination, setDataFieldPagination] = useState({
        pagination__page: 1,
        pagination__perPage: 5
    })

    const rules = {
        dataFieldId: [
            {
                required: true,
                message: t('fieldRequired'),
            }
        ],
        lang1: [
            {
                required: true,
                message: t('fieldRequired'),
            }
        ],
        lang2: [
            {
                required: true,
                message: t('fieldRequired'),
            }
        ],
        fileList: [
            {
                required: true,
                message: t('fieldRequired'),
            }
        ]
    };

    const searchDataField = async () => {

        let data = {
            name: searchInput || '',
            ...dataFieldPagination
        };

        let result = await dataFieldAPI.search(data);
        
        setDataFieldList({
            items: result.data.items,
            total: result.data.total,
            page: result.data.page,
            perPage: result.data.perPage,
        });
        
        setDataFieldPagination({
            pagination__page: result.data.page,
            pagination__perPage: result.data.perPage,
        })
    };

    useEffect(() => {
        searchDataField();
    }, [ dataFieldPagination.pagination__page, dataFieldPagination.pagination__perPage ]);

    const submitImportFile = async () => {

        setUploadingFile(true);

        try {
            await form.validateFields();

            let _formData = form.getFieldsValue();
            
            for (const f of _formData.fileList.fileList) {
                
                try {
                    let result = await paraSentenceAPI.importFromFile({
                        dataFieldId: _formData.dataFieldId,
                        lang1: _formData.lang1,
                        lang2: _formData.lang2,
                        file: f
                    })

                    if (result.code == STATUS_CODES.success) {
                        createImportSuccessModal('', result.data)
                    }
                } catch(err) {
                    createImportErrorModal(
                        `${f.name} ${t('sentencePage.uploadFailed')}`, 
                        t('sentencePage.pleaseCheckYourFile')
                    )
                }
            }
            
        } catch(err) {

        }

        setUploadingFile(false);

        // reload new results
        paraSentenceAPI.getSentences(currentFilter).then((res) => {
            reloadSentenceData(res.data.data.para_sentences);
            reloadSentencePaginationParams(res.data.data.pagination);
        });
    }

    const createImportSuccessModal = (title, importStatus) => {
        Modal.success({
            title: title,
            content: (
                <>
                    <p>
                        - { t('sentencePage.imported') } { importStatus.nSuccess }/{ importStatus.nData } { t('sentencePage.pairParaSentences') }.
                    </p>
                    <p>
                        - { importStatus.nErrorHashExists }/{ importStatus.nData } { t('sentencePage.duplicatedRecords') }.
                    </p>
                </>
            ),
            onOk() {},
        });
    }

    const createImportErrorModal = (title, content) => {
        Modal.error({
            title: title,
            content: content,
            onOk() {},
        });
    }

    return (
        <React.Fragment>

            <Modal 
                title={ t('sentencePage.resultUpdateData') } 
                visible={ isModalImportVisible } 
                onCancel={ () => setIsModalImportVisible(false)}
                cancelText={ t('cancel') }
                okText={ t('submit') }
                onOk={ () => submitImportFile() }>

                <>
                    <Form
                        initialValues={ initialValues }
                        form={ form }>
                        {
                            uploadingFile ? (
                                <Spin />
                            ) : ''
                        }

                        <Row gutter={{ xs: 0, sm: 0, md: 24, lg: 32 }}>
                            <Col xs={ 24 } md={ 12 }>
                                <div 
                                    style={{ 
                                        marginBottom: "10px",
                                        fontSize: '20px',
                                        fontWeight: 500
                                    }}>
                                    { t('lang') } 1
                                </div>

                                <Form.Item
                                    name='lang1'
                                    rules={ rules.dataFieldId }>
                                    <Select
                                        options={ LANGS.map(e => ({value: e.value, label: t(`Language.${e.value}`)})) }>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col xs={ 24 } md={ 12 }>
                                <div 
                                    style={{ 
                                        marginBottom: "10px",
                                        fontSize: '20px',
                                        fontWeight: 500
                                    }}>
                                    { t('lang') } 2
                                </div>

                                <Form.Item
                                    name='lang2'
                                    rules={ rules.lang1 }
                                    options={ LANGS.map(e => ({value: e.value, label: t(`Language.${e.value}`)})) }>
                                    <Select
                                        options={ LANGS.map(e => ({value: e.value, label: t(`Language.${e.value}`)})) }>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col xs={ 24 }>
                                <div 
                                    style={{ 
                                        marginBottom: "10px",
                                        fontSize: '20px',
                                        fontWeight: 500
                                    }}>
                                    { t('dataField') }
                                </div>

                                <Form.Item
                                    name='dataFieldId'
                                    rules={ rules.lang2 }>
                                    <Select
                                        options={ dataFieldList.items.map(df => ({
                                            value: df.id,
                                            label: df.name
                                        }))}>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>


                        <Form.Item
                            name='fileList'
                            rules={ rules.fileList }>
                            <Upload
                                // beforeUpload={ file => {

                                //     // form.setFieldsValue({ fileList: [...form.getFieldsValue()['fileList'], file] })

                                //     return false;
                                // }}
                                onChange={ () => {
                                    
                                }}
                                // fileList={ form.getFieldValue('fileList') }
                                name='file'
                                headers={{
                                    authorization: 'authorization-text',
                                }}
                                showUploadList={ true }>
                                <Button icon={ <UploadOutlined /> }>
                                    { t('chooseFile') }
                                </Button>
                            </Upload>
                        </Form.Item>
                    </Form>
                </>
            </Modal>
        </React.Fragment>
    );
};

export default ImportFileModal;
