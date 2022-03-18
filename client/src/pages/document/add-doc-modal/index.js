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

import React, { useEffect, useState, useRef } from 'react';

import { useTranslation } from 'react-i18next';

import documentAPI from '../../../api/document';
import sentAlignAPI from '../../../api/sent-align';
import assignmentAPI from '../../../api/assignment';
import paraSentenceAPI from '../../../api/para-sentence';
import langDetectorAPI from '../../../api/language_detector';

import { LANGS, STATUS_CODES } from '../../../constants';

import { useForm } from 'antd/lib/form/Form';
import DataFieldSelect from '../../../components/data-field-select';

import { isAdmin, isReviewer, isEditor } from '../../../utils/auth';
import { useSetState } from 'react-use';
import UploadButton from '../../../components/upload-file-button'

const alignmentTypes = {
    fromNewPairs: 'fromNewPairs',
    fromSavedPairs: 'fromSavedPairs'
}

const AddingDocModal = (props) => {

    const {
        isAddingModalVisible,
        setIsAddingModalVisible,
        reloadDocumentData,
        reloadDocumentPaginationParams,
        chosenDocForAlignment,
        alignmentType,
        currentFilter
    } = props;
    
    const { t } = useTranslation(['common']);

    const [langList2, setLangList2] = useState([]);

    const [submittingStatus, setSubmittingStatus] = useState(false);

    const [detectingLanguage, setDetectingLanguage] = useState(false);

    const initialValues = {
        dataFieldId: '',
        text1: 'Đến với Mộc Châu , du khách được hoà mình vào không gian văn hoá mang đậm nét độc đáo của đồng bào các dân tộc Thái , Mông trên miền thảo nguyên xanh.',
        text2: 'មកដល់ Moc Chau អ្នកទេសចរបានសម្របខ្លួនចូលក្នុងលំហវប្បធម៌ ដែលមានលក្ខណៈពិសេសរបស់ជនជាតិភាគជាតិថៃ និង Mong នៅលើវាលស្មៅពណ៌ខៀវស្រងាត់។',
        lang1: 'vi',
        lang2: ''
    }

    const [form] = useForm()
    const [formData, setFormData] = useState(initialValues)

    const rules = {
        dataFieldId: [
            {
                required: true,
                message: t('fieldRequired'),
            }
        ],
        text1: [
            {
                required: true,
                message: t('fieldRequired'),
            }
        ],
        text2: [
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
        ]
    };

    const dataFieldSelectRef = useRef();

    useEffect(() => {
        
        const fetchData = async () => {

            if (isAdmin()) {
                setLangList2(LANGS.filter(e => (e.value != 'vi')))
            } else if (isReviewer() || isEditor()) {
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

                form.setFieldsValue({ lang2: langs[0].value });

                setFormData({
                    ...formData,
                    lang2: langs[0].value
                })
            }
        }
        
        fetchData()
    }, [])

    useEffect(() => {

        if (alignmentType == alignmentTypes.fromNewPairs) {
            form.setFieldsValue({
                text1: '',
                text2: '',
                lang2: null,
                dataFieldId: null
            });
            try {
                dataFieldSelectRef.current.setPreSelectedDataField(null, null);
            } catch {}
            // dataFieldSelectRef.current.setPreSelectedDataField(null, null);
        } 
        
        if (alignmentType == alignmentTypes.fromSavedPairs) {
            form.setFieldsValue({
                text1: chosenDocForAlignment.newest_para_document['text1'].content,
                text2: chosenDocForAlignment.newest_para_document['text2'].content
            })
        }

    }, [alignmentType, chosenDocForAlignment])

    const submitDocPair = async () => {

        await form.validateFields()

        let _formData = form.getFieldsValue();

        if (!isAdmin()) {
            _formData.lang2 = langList2[0].value;
        }

        setSubmittingStatus(true);
            
        try {
            let result = await sentAlignAPI.create({
                lang1: 'vi',
                lang2: _formData.lang2,
                text1: _formData.text1,
                text2: _formData.text2
            })

            if (result.code == STATUS_CODES.success || result.isvalid) {
            
                let data = result.data ?? result.sentences;

                data = data.filter(e => e.source !== null && e.source !== undefined);

                createSentAlignSuccessModal(
                    `${t('total')} ${data.length} ${t('sentencePair')}`,
                    data.map(e => ({
                        ...e, 
                        text1: e.source, 
                        text2: e.target
                    })),
                    {
                        lang1: 'vi',
                        lang2: _formData.lang2,
                        dataFieldId: _formData.dataFieldId,
                        docText1: _formData.text1,
                        docText2: _formData.text2
                    }
                )
            }

        } catch(err) {
            createImportErrorModal(
                t('senAlignFail'), 
                t('pleaseTryAgainNextTime')
            )
        }

        setSubmittingStatus(false);
    }

    const createSentAlignSuccessModal = (title, sentPairs, metaData) => {
        Modal.confirm({
            title: <div style={{ paddingLeft: '12px' }}>{ title }</div>,
            visible: isAddingModalVisible,
            width: 1000,
            icon: '',
            bodyStyle: { paddingRight: 0 },
            content: (
                <>
                    <Row
                        style={{ width: '100%', paddingLeft: '12px' }} 
                        gutter={{ xs: 0, sm: 0, md: 24, lg: 32 }}>

                        <Col xs={ 0 } md={ 11 }>
                            <div style={{ fontWeight: 700 }}>
                                { t(`Language.${metaData.lang1}`) }
                            </div>
                        </Col>

                        <Col xs={ 0 } md={ 11 }>
                            <div style={{ fontWeight: 700 }}>
                                { t(`Language.${metaData.lang2}`) }
                            </div>
                        </Col>

                        <Col xs={ 0 } md={ 2 }>
                            <div style={{ fontWeight: 700, minWidth: '50px' }}>
                                { t(`score`) }
                            </div>
                        </Col>
                    </Row>

                    {
                        sentPairs.map((sentencePair, index) => (
                            <Row
                                key={ index }
                                style={{
                                    padding: '12px',
                                    width: '100%',
                                    backgroundColor: index % 2 == 0 ? 'white' : '#f2f2f2'
                                }} 
                                gutter={{ xs: 0, sm: 0, md: 24, lg: 32 }}>
                                
                                <Col xs={ 24 } md={ 11 }>
                                    <Row>
                                        <Col xs={ 24 } md={ 0 }>
                                            <div style={{ fontWeight: 700 }}>
                                                { t(`Language.${metaData.lang1}`) }
                                            </div>
                                        </Col>
                                        <Col span={ 24 }>
                                            { sentencePair.text1 }
                                        </Col>
                                    </Row>
                                </Col>

                                <Col xs={ 24 } md={ 11 }>
                                    <Row>
                                        <Col xs={ 24 } md={ 0 }>
                                            <div style={{ fontWeight: 700 }}>
                                                { t(`Language.${metaData.lang2}`) }
                                            </div>
                                        </Col>
                                        <Col span={ 24 }>
                                            { sentencePair.text2 }
                                        </Col>
                                    </Row>
                                </Col>

                                <Col xs={ 24 } md={ 2 }>
                                    <Row>
                                        <Col xs={ 24 } md={ 0 }>
                                            <div style={{ fontWeight: 700 }}>
                                                { `${t(`score`)}: ${Number(sentencePair.score).toFixed(2)}` }
                                            </div>
                                        </Col>
                                        <Col xs={ 0 } md={ 24 }>
                                            <div style={{ fontWeight: 700 }}>
                                                { Number(sentencePair.score).toFixed(2) }
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>

                            </Row>
                        ))
                    }
                </>
            ),
            onCancel() { setIsAddingModalVisible(false) },
            cancelText: t('cancel'),
            okText: t('submit'),
            onOk: async (close) => { 

                let para_document_id = null;

                if (alignmentType == alignmentTypes.fromNewPairs) {

                    try {

                        let result1 = await documentAPI.create({
                            text1: metaData.docText1,
                            text2: metaData.docText2,
                            lang1: metaData.lang1,
                            lang2: metaData.lang2,
                            dataFieldId: metaData.dataFieldId
                        })
                        
                        if (result1.code == STATUS_CODES.success) {    
                            Modal.success({
                                title: t('result'),
                                content: t('docPairsCreatedSuccessfully'),
                                onOk() {},
                            });

                            para_document_id = result1.data.id;
                        } else {
                            if (result1.message == 'docExisted') {
                                Modal.info({
                                    title: t('result'),
                                    content: t('docPairsExisted'),
                                    onOk() {},
                                });
                            }
                        }
                        
                    } catch(err) {
                        Modal.error({
                            title: `${t('error')}!`,
                            content: t('pleaseTryAgainNextTime'),
                            onOk() {},
                        });
                    }
                } else {
                    para_document_id = chosenDocForAlignment.id
                }

                if (para_document_id) {
                    try {

                        let _data = {
                            lang1: metaData.lang1,
                            lang2: metaData.lang2,
                            pairs: sentPairs,
                            dataFieldId: metaData.dataFieldId,
                            paraDocumentId: para_document_id
                        };
                    
                        let result2 = await paraSentenceAPI.importByUser(_data)
                        
                        if (result2.data.code == STATUS_CODES.success) {    
    
                            let importStatus = result2.data.data;
    
                            Modal.success({
                                title: t('result'),
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
                    } catch(err) {
                        Modal.error({
                            title: `${t('error')}!`,
                            content: t('pleaseTryAgainNextTime'),
                            onOk() {},
                        });
                    }
    
                    // reload new results
                    let res1 = await documentAPI.getDocuments(currentFilter)
                    
                    reloadDocumentData(res1.data.data.para_documents);
                    reloadDocumentPaginationParams(res1.data.data.pagination);
                }
            },
        });
    }

    const disableContentEditing = () => {
        return alignmentType == alignmentTypes.fromSavedPairs;
    }

    const createImportErrorModal = (title, content) => {
        Modal.error({
            title: title,
            content: content,
            onOk() {},
        });
    }

    const createDetectLanguageModal = () => {
        let _formData = form.getFieldsValue();
        if (!isAdmin()) {
            _formData.lang2 = langList2[0].value;
        }

        const langList = LANGS.map((lang) => lang.value);

        setDetectingLanguage(true);

        let lang1 = 'cant_detect';
        let lang2 = 'cant_detect';
        let lang1Valid = false;
        let lang2Valid = false;

        langDetectorAPI.detectLanguage(_formData.text1).then(res => {

            if (res.data.data.status === true && langList.includes(res.data.data.lang)) {
                lang1 = res.data.data.lang;
            }

            langDetectorAPI.detectLanguage(_formData.text2).then(res => {
                if (res.data.data.status === true && langList.includes(res.data.data.lang)) {
                    lang2 = res.data.data.lang;
                }

                if (lang1 == 'vi') lang1Valid = true;
                if (lang2 == _formData.lang2) lang2Valid = true;

                setDetectingLanguage(false);

                let text1Display;
                if (lang1 === 'cant_detect') {
                    text1Display = t(`Language.${lang1}`);
                } else {
                    text1Display = `${t('documentPage.detected')} ${t(`Language.${lang1}`)}`;
                }

                let text2Display;
                if (lang2 === 'cant_detect') {
                    text2Display = t(`Language.${lang2}`);
                } else {
                    text2Display = `${t('documentPage.detected')} ${t(`Language.${lang2}`)}`;
                }

                const modalInfo = {
                    title: t('documentPage.detectLanguageTitle'),
                    content: (
                        <React.Fragment>
                            <div key='text1'>
                                { t('text1') }: {text1Display} - {t('documentPage.selected')}&nbsp;{t(`Language.vi`)}
                            </div>
                            <div key='text2'>
                                { t('text2') }: {text2Display} - {t('documentPage.selected')}&nbsp;{t(`Language.${_formData.lang2}`)}
                            </div>
                        </React.Fragment>
                    ),
                    cancelText: t('cancel'),
                    okText: t('documentPage.senAlign'),
                    onOk() {
                        submitDocPair();
                    }
                }

                if (lang1Valid && lang2Valid) {
                    Modal.info(modalInfo);
                } else {
                    Modal.confirm(modalInfo);
                }
            });
        });
    }
    
    const handelUploadFile = (file, field) => {
        var reader = new FileReader();
        reader.onload = function(){
            if (field == 1){
                form.setFieldsValue({
                    text1: reader.result
                })
            } else if (field == 2) {
                form.setFieldsValue({
                    text2: reader.result
                })
            }
        };
        reader.readAsText(file);
    }
    return (
        <React.Fragment>

            <Modal 
                title={ t('sentencePage.addDataFromFields') } 
                visible={ isAddingModalVisible } 
                onCancel={ () => setIsAddingModalVisible(false)}
                cancelText={ t('cancel') }
                okText={ t('submit') }
                width={ '60%' }
                onOk={ () => createDetectLanguageModal() }
                centered={ true }
                // bodyStyle={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}
            >

                <>
                    <Form
                        initialValues={ initialValues }
                        form={ form }
                        onValuesChange={(values, changedValues) => {
                            setFormData({
                                ...formData,
                                ...values
                            })
                        }}>
                        {
                            submittingStatus ? (
                                <Spin />
                            ) : ''
                        }

                        <Row gutter={{ xs: 0, sm: 0, md: 24, lg: 32 }}>

                            <Col md={ 12 } xs={ 24 }>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <div style={{ 
                                        fontSize: '20px',
                                        fontWeight: 500,
                                    }}>
                                        { t(`Language.${formData.lang1}`) }
                                    </div>
                                    <UploadButton index={1} onUpload={handelUploadFile}></UploadButton>
                                </div>
                                <Form.Item
                                    name='text1'
                                    rules={ rules.text1 }>
                                    <Input.TextArea
                                        disabled={ disableContentEditing() }
                                        autoSize={{ minRows: 9, maxRows: 9 }}>
                                    </Input.TextArea>
                                </Form.Item>
                            </Col>

                            <Col md={ 12 } xs={ 24 }>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <div style={{ 
                                        fontSize: '20px',
                                        fontWeight: 500
                                    }}>
                                        { formData.lang2 ? t(`Language.${formData.lang2}`) : t('text2') }
                                    </div>
                                    <UploadButton index={2} onUpload={handelUploadFile}></UploadButton>
                                </div>    
                                <Form.Item
                                    name='text2'
                                    rules={ rules.text2 }>
                                    <Input.TextArea
                                        disabled={ disableContentEditing() }
                                        autoSize={{ minRows: 9, maxRows: 9 }}>
                                    </Input.TextArea>
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
                                        ref={ dataFieldSelectRef }
                                        setSelectedDataFieldId={ dataFieldId => {

                                            form.setFieldsValue({dataFieldId: dataFieldId});

                                            setFormData({
                                                ...formData,
                                                dataFieldId: dataFieldId
                                            })
                                        }}>
                                    </DataFieldSelect>
                                </Form.Item>
                            </Col>

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
                        </Row>
                    </Form>
                </>
            </Modal>
        </React.Fragment>
    );
};

export default AddingDocModal; 
