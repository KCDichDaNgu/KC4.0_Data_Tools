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

import documentAPI from '../../../api/document';
import sentAlignAPI from '../../../api/sent-align'; 
import assignmentAPI from '../../../api/assignment';
import paraSentenceAPI from '../../../api/para-sentence';

import { LANGS, STATUS_CODES } from '../../../constants';

import dataFieldAPI from '../../../api/data-field';
import { useForm } from 'antd/lib/form/Form';

import { isAdmin, isReviewer } from '../../../utils/auth';

let SEN_ALIGN_LANG_MAPPING = {
    'km': 'km'
}

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

    const [submittingStatus, setSubmittingStatus] = useState(false);

    const [searchInput, setSearchInput] = useState('');

    const initialValues = {
        dataFieldId: '',
        text1: 'Đến với Mộc Châu , du khách được hoà mình vào không gian văn hoá mang đậm nét độc đáo của đồng bào các dân tộc Thái , Mông trên miền thảo nguyên xanh.',
        text2: 'មកដល់ Moc Chau អ្នកទេសចរបានសម្របខ្លួនចូលក្នុងលំហវប្បធម៌ ដែលមានលក្ខណៈពិសេសរបស់ជនជាតិភាគជាតិថៃ និង Mong នៅលើវាលស្មៅពណ៌ខៀវស្រងាត់។',
        lang1: 'vi',
        lang2: ''
    }

    const [form] = useForm()
    const [formData, setFormData] = useState(initialValues)

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

                form.setFieldsValue({ lang2: langs[0].value });
            }
        }
        
        fetchData()
    }, [])

    useEffect(() => {
        searchDataField();
    }, [ 
        dataFieldPagination.pagination__page, 
        dataFieldPagination.pagination__perPage 
    ]);

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
            
            if (result.code == STATUS_CODES.success) {
                
                createSentAlignSuccessModal(
                    `${t('total')} ${result.data.length} ${t('sentencePair')}`,
                    result.data.map(e => ({
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
            title: title,
            visible: isModalImportVisible,
            width: 1000,
            icon: '',
            content: (
                <>
                    <Row
                        style={{ marginBottom: '15px' }} 
                        gutter={{ xs: 0, sm: 0, md: 24, lg: 32 }}>

                        <Col xs={ 24 } md={ 11 }>
                            <div style={{ fontWeight: 700 }}>
                                { t(`Language.${metaData.lang1}`) }
                            </div>
                        </Col>

                        <Col xs={ 24 } md={ 11 }>
                            <div style={{ fontWeight: 700 }}>
                                { t(`Language.${metaData.lang2}`) }
                            </div>
                        </Col>

                        <Col xs={ 24 } md={ 2 }>
                            <div style={{ fontWeight: 700 }}>
                                { t(`score`) }
                            </div>
                        </Col>
                    </Row>

                    {
                        sentPairs.map((sentencePair, index) => (
                            <Row
                                key={ index }
                                style={{ marginBottom: '10px' }} 
                                gutter={{ xs: 0, sm: 0, md: 24, lg: 32 }}>

                                <Col xs={ 24 } md={ 11 }>
                                    { sentencePair.text1 }
                                </Col>

                                <Col xs={ 24 } md={ 11 }>
                                    { sentencePair.text2 }
                                </Col>

                                <Col xs={ 24 } md={ 2 }>
                                    <div style={{ fontWeight: 700 }}>
                                        { Number(sentencePair.score).toFixed(2) }
                                    </div>
                                </Col>

                            </Row>
                        ))
                    }
                </>
            ),
            onCancel() { setIsModalImportVisible(false) },
            cancelText: t('cancel'),
            okText: t('submit'),
            onOk: async (close) => { 

                try {
                    let result1 = await documentAPI.create({
                        text1: metaData.docText1,
                        text2: metaData.docText2,
                        lang1: metaData.lang1,
                        lang2: metaData.lang2,
                        dataFieldId: metaData.dataFieldId
                    })

                    if (result1.data.code == STATUS_CODES.success) {    
                        Modal.success({
                            title: t('result'),
                            content: t('docPairsCreatedSuccessfully'),
                            onOk() {},
                        });
                    } else {
                        if (result1.data.message == 'docExisted') {
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

                try {
                
                    let result2 = await paraSentenceAPI.importByUser({
                        lang1: metaData.lang1,
                        lang2: metaData.lang2,
                        pairs: sentPairs,
                        dataFieldId: metaData.dataFieldId
                    })
                    
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
            },
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
                width={ '10000' }
                onOk={ () => submitDocPair() }>

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
                                <div style={{ 
                                    marginBottom: '10px',
                                    fontSize: '20px',
                                    fontWeight: 500
                                }}>
                                    { t(`Language.${formData.lang1}`) }
                                </div>
                                
                                <Form.Item
                                    name='text1'
                                    rules={ rules.text1 }>
                                    <Input.TextArea
                                        autoSize={{ minRows: 4 }}>
                                    </Input.TextArea>
                                </Form.Item>
                            </Col>

                            <Col md={ 12 } xs={ 24 }>
                                <div style={{ 
                                    marginBottom: '10px',
                                    fontSize: '20px',
                                    fontWeight: 500
                                }}>
                                    { formData.lang2 ? t(`Language.${formData.lang2}`) : t('text2') }
                                </div>
                                
                                <Form.Item
                                    name='text2'
                                    rules={ rules.text2 }>
                                    <Input.TextArea
                                        autoSize={{ minRows: 4 }}>
                                    </Input.TextArea>
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
                                    rules={ rules.dataFieldId }>
                                    <Select
                                        options={ dataFieldList.items.map(df => ({
                                            value: df.id,
                                            label: df.name
                                        }))}>
                                    </Select>
                                </Form.Item>
                            </Col>

                            { isAdmin() ?
                                <Col xs={ 24 }>
                                    <div style={{ 
                                        marginBottom: '10px',
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

export default ImportFileModal;
