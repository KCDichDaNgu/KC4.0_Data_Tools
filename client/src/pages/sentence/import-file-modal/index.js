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
import assignmentAPI from '../../../api/assignment';

import { LANGS, STATUS_CODES } from '../../../constants';

import { useForm } from 'antd/lib/form/Form';

import { isAdmin, isReviewer } from '../../../utils/auth';
import DataFieldSelect from '../../../components/data-field-select';

const ImportFileModal = (props) => {

    const {
        isModalImportVisible,
        setIsModalImportVisible,
        reloadSentenceData,
        reloadSentencePaginationParams,
        currentFilter
    } = props;
    
    const { t } = useTranslation(['common']);

    const [langList2, setLangList2] = useState([]);

    const [uploadingFile, setUploadingFile] = useState(false);

    const initialValues = {
        dataFieldId: '',
        lang1: 'vi',
        lang2: '', 
        fileList: []
    }

    const [form] = useForm()

    const rules = {
        dataFieldId: [
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

    const [files, setFiles] = useState([])

    useEffect(() => {
        const fetchData = async () => {

            if (isAdmin()) {
                setLangList2(LANGS.filter(e => (e.value != 'vi')))
            } else if (isReviewer()) {
                let result = await assignmentAPI.owner()

                let langs = []
    
                if (result.code == STATUS_CODES.success) {
                    for (const langPair of result.data.lang_scope) {
                        langs.push({
                            value: langPair.lang2,
                            label: langPair.lang2
                        })
                    }
                }

                setLangList2(langs)
            }
        }
        
        fetchData()
    }, [])

    const submitImportFile = async () => {

        try {
            await form.validateFields();

            let _formData = form.getFieldsValue();

            if (isReviewer()) {
                _formData.lang2 = langList2[0].value;
            }
            
            if (files.length == 0) {
                message.error(t('formMessages.errors.filesFieldCannotBeEmpty'))
                return;
            }

            setUploadingFile(true);

            let successModalContents = [];
            let total = {
                nData: 0,
                nSuccess: 0,
                nErrorHashExists: 0
            };

            for (const f of files) {
                
                try {
                    let result = await paraSentenceAPI.importFromFile({
                        dataFieldId: _formData.dataFieldId,
                        lang1: 'vi',
                        lang2: _formData.lang2,
                        file: f.originFileObj
                    })
                    
                    if (result.data.code == STATUS_CODES.success) {
                        successModalContents.push({
                            ...result.data.data, name: f.name
                        });

                        total.nData += result.data.data.nData;
                        total.nSuccess += result.data.data.nSuccess;
                        total.nErrorHashExists += result.data.data.nErrorHashExists;        
                    }
                } catch(err) {
                    createImportErrorModal(
                        `${f.name} ${t('sentencePage.uploadFailed')}`, 
                        t('sentencePage.pleaseCheckYourFile')
                    )
                }
            }
            
            if (successModalContents.length > 0) {
                successModalContents.push({
                    ...total, name: t('total')
                });

                createImportSuccessModal('', successModalContents);
                form.resetFields();
                setFiles(initialValues.fileList);
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

    const createImportSuccessModal = (title, contents) => {
        Modal.success({
            title: title,
            content: contents.map(({ name, nSuccess, nData, nErrorHashExists }, index) => (
                <React.Fragment key={ name }>
                    <p>
                        { 
                            name === t('total')
                            ? <b>{ name }</b>
                            : `${ index + 1 }. ${ t('file') } ${ name }` 
                        }
                    </p>
                    <p>
                        - { t('sentencePage.imported') } { nSuccess }/{ nData } { t('sentencePage.pairParaSentences') }.
                    </p>
                    <p>
                        - { nErrorHashExists }/{ nData } { t('sentencePage.duplicatedRecords') }.
                    </p>
                </React.Fragment>
            )),
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
                title={ t('sentencePage.addDataFromFields') } 
                visible={ isModalImportVisible } 
                onCancel={ () => setIsModalImportVisible(false)}
                cancelText={ t('cancel') }
                okText={ t('submit') }
                onOk={ () => submitImportFile() }
                bodyStyle={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>

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
                            { isAdmin() ?
                                <Col xs={ 24 }>
                                    <div style={{ 
                                        fontSize: '20px',
                                        fontWeight: 500
                                    }}>
                                        { t('secondLanguage') }
                                    </div>
                                    
                                    <Form.Item
                                        name='lang2'
                                        rules={ rules.lang2 }>
                                        <Select
                                            showSearch
                                            style={{
                                                width: '100%',
                                            }}
                                            options={ 
                                                langList2.map(e => ({
                                                    value: e.value, 
                                                    label: t(`Language.${e.label}`)
                                                })
                                            )}>
                                        </Select>
                                    </Form.Item>
                                </Col> : null
                            }

                            <Col xs={ 24 }>
                                <div 
                                    style={{ 
                                        fontSize: '20px',
                                        fontWeight: 500
                                    }}>
                                    { t('dataField') }
                                </div>

                                <Form.Item
                                    name='dataFieldId'
                                    rules={ rules.dataFieldId }>
                                    <DataFieldSelect
                                        setSelectedDataFieldId={ dataFieldId => form.setFieldsValue({dataFieldId: dataFieldId})}>
                                    </DataFieldSelect>
                                </Form.Item>
                            </Col>
                        </Row>


                        <Form.Item>
                            <Upload
                                directory
                                beforeUpload={ file => {
                                    return false;
                                }}
                                // fileList={ form.getFieldValue('fileList') }
                                fileList={ files }
                                name='file'
                                headers={{
                                    authorization: 'authorization-text',
                                }}
                                showUploadList={ true }
                                onChange={ ({ fileList }) => {
                                    setFiles(fileList);
                                }}>
                                <Button 
                                    icon={ <UploadOutlined /> }
                                    style={{display: "flex", alignItems: "center", fontSize: "15px"}}
                                >
                                    { t('chooseDirectory') }
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
