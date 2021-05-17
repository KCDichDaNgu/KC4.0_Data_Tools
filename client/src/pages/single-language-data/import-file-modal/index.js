import './style.module.scss';

import {
    Input,
    Button,
    Select,
    Upload,
    message,
    Spin,
    Row,
    Col,
    Modal,
    Form
} from "antd";

import { UploadOutlined } from '@ant-design/icons';

import React, { useEffect, useState, useRef } from 'react';

import { useTranslation } from 'react-i18next';

import singleSentenceAPI from "../../../api/single-language-data";
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
        currentFilter,
        toast
    } = props;
    
    const { t } = useTranslation(['common']);

    const [langList, setLangList] = useState([]);

    const [uploadingFile, setUploadingFile] = useState(false);

    const initialValues = {
        dataFieldId: '',
        lang: 'vi',
        source: 'Crawler',
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
        lang: [
            {
                required: true,
                message: t('fieldRequired'),
            }
        ],
        source: [
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
                setLangList(LANGS)
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

                setLangList(langs)
            }
        }
        
        fetchData()
    }, [])

    const submitImportFile = async () => {

        try {
            await form.validateFields();

            let _formData = form.getFieldsValue();
            
            if (files.length == 0) {
                message.error(t('formMessages.errors.filesFieldCannotBeEmpty'))
                return;
            }

            setUploadingFile(true);

            let result = await singleSentenceAPI.upload({
                dataFieldId: _formData.dataFieldId,
                lang: _formData.lang,
                source: _formData.source,
                files: files
            })
            if (result.data.code == STATUS_CODES.success) {
                toast.success(t(`singleLanguageDataPage.${result.data.message}`), {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                })
                // reload new results
                singleSentenceAPI.get(currentFilter).then((res) => {
                    reloadSentenceData(res.data.data.single_sentences);
                    reloadSentencePaginationParams(res.data.data.pagination);
                });
                closeModal()
            } else {
                toast.error(t(`singleLanguageDataPage.${result.data.message}`), {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                })
            }      

        } catch(err) {
            toast.error(t(`singleLanguageDataPage.${result.data.message}`), {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
            })
        }

        setUploadingFile(false);
    }

    const closeModal = () => {
        setIsModalImportVisible(false); 
        form.setFieldsValue(initialValues); 
        setFiles([]);
    }

    return (
        <React.Fragment>

            <Modal 
                title={ t('sentencePage.addDataFromFields') } 
                visible={ isModalImportVisible } 
                onCancel={ () => closeModal()}
                cancelText={ t('cancel') }
                okText={ t('submit') }
                destroyOnClose={true}
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
                                        { t('language') }
                                    </div>
                                    
                                    <Form.Item
                                        name='lang'
                                        rules={ rules.lang }>
                                        <Select
                                            showSearch
                                            style={{
                                                width: '100%',
                                            }}
                                            options={ 
                                                langList.map(e => ({
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
                                    { t('singleLanguageDataPage.source') }
                                </div>

                                <Form.Item
                                    name='source'
                                    rules={ rules.source }>
                                    <Input
                                        onChange={ e => { form.setFieldsValue({source: e.target.value}) }}>
                                    </Input>
                                </Form.Item>
                            </Col>

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
                                beforeUpload={ file => {
                                    return false;
                                }}
                                // fileList={ form.getFieldValue('fileList') }
                                fileList={ files }
                                name='file'
                                headers={{
                                    authorization: 'authorization-text',
                                }}
                                multiple={true}
                                showUploadList={ true }
                                onChange={ ({ fileList }) => {
                                    setFiles(fileList);
                                }}>
                                <Button 
                                    icon={ <UploadOutlined /> }
                                    style={{display: "flex", alignItems: "center", fontSize: "15px"}}
                                >
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
