import "./sentence.module.scss";

import React, { useEffect, useState, useRef } from "react";
import PageTitle from "../../layout/site-layout/main/PageTitle";
import paraSentenceAPI from "../../api/para-sentence";

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
    Modal
} from "antd";
import { UploadOutlined } from '@ant-design/icons';
import SiteLayout from "../../layout/site-layout";

import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/date';
import { clonedStore } from '../../store';

const { TextArea } = Input;
const { Option } = Select;

const SentencePage = (props) => {

    const { t } = useTranslation(['common']);

    const currentUserId = clonedStore.getState().User?.profile?.id;

    const [dataSource, setDataSource] = useState([]);
    const [value, setValue] = useState("");
    const [paginationParams, setPaginationParams] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [requestParams, setRequestParams] = useState({
        domain: "",
        lang1: "",
        lang2: "",
        sort_by: "",
        sort_order: "",
        page: ""
    });
    const [uploadingFile, setUploadingFile] = useState(false);
    const [isModalImportVisible, setIsModalImportVisible] = useState(false);
    const [importStatus, setImportStatus] = useState({});

    const renderText = (key, paraSentence, index) => {

        let lastUpdated = paraSentence[key];

        // if (paraSentence.hasOwnProperty('edited')
        //     && paraSentence['edited'].hasOwnProperty(key)
        //     && paraSentence['edited'][key] !== undefined) {
        //     lastUpdated = paraSentence['edited'][key];
        // }

        return (
            <TextArea
                key={paraSentence['id']}
                autoSize
                showCount
                defaultValue={lastUpdated}
                onPressEnter={event => {
                    event.preventDefault();
                    updateParaSentence(paraSentence, key, event.target.value);
                }}
                onResize={({ width, height }) => {
                    return height + 10;
                }} 
            />
        );
    }

    const renderRating = (rating, paraSentence, index) => {

        let lastUpdated = paraSentence['rating'];

        // if (paraSentence.hasOwnProperty('edited')
        //     && paraSentence['edited'].hasOwnProperty('rating')
        //     && paraSentence['edited']['rating'] !== undefined) {
        //     lastUpdated = paraSentence['edited']['rating'];
        // }

        return (
            <Radio.Group
                key={ paraSentence['id'] } 
                value={ lastUpdated }
                onChange={ event => updateParaSentence(paraSentence, "rating", event.target.value) }>
                {
                    ratingList.map((rating) => {
                        if (rating == 'unRated') {
                            if (lastUpdated == 'unRated') {
                                return (
                                    <Radio.Button key={ rating } value={ rating}>?</Radio.Button>
                                );
                            }
                        } else {
                            return (
                                <Radio.Button key={ rating } value={ rating }>
                                    { t(`sentence.${rating}`) }
                                </Radio.Button>
                            );
                        }
                    })
                }
            </Radio.Group>
        );
    }

    const columns = [
        {
            title: `${t('sentence.text')} 1`,
            dataIndex: "text1",
            key: "text1",
            render: (text, paraSentence, index) => renderText('text1', paraSentence, index)
        },
        {
            title: `${t('sentence.text')} 2`,
            dataIndex: "text2",
            key: "text2",
            render: (text, paraSentence, index) => renderText('text2', paraSentence, index)
        },
        // {
        //     title: t('sentence.lastUpdate'),
        //     // dataIndex: "updated_time",
        //     key: "updated_time",
        //     render: (record) => {
        //         // formatDate(updated_time)
        //         console.log(record)
        //     },
        //     sorter: (a, b, sortOrder) => { },
        //     sortDirections: ['ascend', 'descend', 'ascend']
        // },
        {
            title: `${t('sentence.score')} / ${t('sentence.rating')}`,
            // dataIndex: "score",
            key: "score",
            render: (record, index) => {
                return (
                    <div style={{
                        width: 'fit-content'
                    }}>
                        <div style={{ 
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: 600,
                            marginBottom: '10px'
                        }}>
                            { Number(record.score.senAlign).toFixed(2) }
                        </div>
                        
                        <div>
                            { renderRating(record.rating, record, index) }
                        </div>
                    </div>
                )
            },
            sorter: (a, b, sortOrder) => { },
            width: '20%',
            sortDirections: ['ascend', 'descend', 'ascend']
        },
        // {
        //     title: t('sentence.rating'),
        //     dataIndex: "rating",
        //     key: "rating",
        //     render: (rating, paraSentence, index) => renderRating(rating, paraSentence, index),
        // }
    ];

    const handleChange = (value, key) => {
        if (key == 'text') {
            setRequestParams({ ...requestParams, text1: value, text2: value });
        } else {
            setRequestParams({ ...requestParams, [key]: value });
        }
    };

    const handleFilter = () => {
        let params = {
            ...requestParams,
            page: 1
        }; // reset page to 1

        setRequestParams(params);

        paraSentenceAPI.getSentences(params).then((res) => {
            setDataSource(res.data.data)
            setPaginationParams(res.data.pagination);
        });
    };

    const [langList1, setLangList1] = useState([]);
    const [langList2, setLangList2] = useState([]);
    const [ratingList, setRatingList] = useState([]);

    const lang1Option = [
        <Option key='all'>{t('sentence.all')}</Option>
    ].concat(
        langList1.map((lang) => {
            return <Option key={lang}>{lang}</Option>;
        })
    );

    const lang2Option = [
        <Option key='all'>{t('sentence.all')}</Option>
    ].concat(
        langList2.map((lang) => {
            return <Option key={lang}>{lang}</Option>;
        })
    );

    const ratingOption = [
        <Option key='all'>{t('sentence.all')}</Option>
    ].concat(
        ratingList.map((rating) => {
            return <Option key={rating}>{t(`sentence.${rating}`)}</Option>;
        })
    );

    const uploadFile = {
        name: 'file',
        customRequest: ({onProgress, onSuccess, onError, file}) => {
            paraSentenceAPI.importFromFile(onProgress, onSuccess, onError, file)
        },
        showUploadList: false,
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {

            if (info.file.status !== 'uploading') setUploadingFile(true);

            if (info.file.status === 'done') {
                setUploadingFile(false);

                // let nSuccess = info.file.response.data.n_success;
                // let nData = info.file.response.data.n_data;

                setImportStatus(info.file.response.data);
                setIsModalImportVisible(true);
                // message.success(`${t('sentence.imported')} ${nSuccess}/${nData} ${t('sentence.pairParaSentences')}`);
                
                // reload new results
                paraSentenceAPI.getSentences({}).then((res) => {
                    setDataSource(res.data.data);
                    setPaginationParams(res.data.pagination);
                });
            } else if (info.file.status === 'error') {
                setUploadingFile(false);

                message.error(`${info.file.name} ${t('sentence.uploadFailed')}`);
            }
        },
    };

    useEffect(() => {
        paraSentenceAPI.getSentences({}).then((res) => {
            setDataSource(res.data.data);
            setPaginationParams(res.data.pagination);
        });

        paraSentenceAPI.getOptions().then((res) => {
            setLangList1(res.data.lang1);
            setLangList2(res.data.lang2);
            setRatingList(res.data.rating);
        });
    }, []);

    const handleTableChange = (pagination, filters, sorter) => {
        
        let params = {
            ...requestParams,
            sort_by: sorter['columnKey'],
            sort_order: sorter['order'],
            page: pagination['current']
        }

        setRequestParams(params);
        setSortedInfo(sorter)

        paraSentenceAPI.getSentences(params).then((res) => {
            setDataSource(res.data.data);
            setPaginationParams(res.data.pagination);
        });
    }

    const updateParaSentence = (paraSentence, key, value) => {

        let filterParams = {};

        filterParams[key] = value;

        paraSentenceAPI.updateParaSentence(paraSentence['id'], filterParams).then((res) => {
            if (res.data.code == process.env.REACT_APP_CODE_SUCCESS) {
                message.success(t('sentence.editedSuccess'));

                let params = {
                    ...requestParams,
                    sort_by: sortedInfo['columnKey'],
                    sort_order: sortedInfo['order'],
                    page: paginationParams.current_page
                }

                paraSentenceAPI.getSentences(params).then((res) => {
                    setDataSource(res.data.data);
                    setPaginationParams(res.data.pagination);
                });
            } else {
                message.error(t(`sentence.${res.data.message}`));
            }
        });
    }

    return (
        <React.Fragment>
            <SiteLayout>
                <PageTitle
                    heading={t('sentence.title')}
                    icon="pe-7s-home icon-gradient bg-happy-itmeo"
                    customComponent={
                        (
                            <div>
                                {
                                    uploadingFile ? (
                                        <Spin />
                                    ) : ''
                                }
                                <Upload {...uploadFile}>
                                    <Button icon={<UploadOutlined />}>
                                        {t('sentence.uploadFile')}
                                    </Button>
                                </Upload>
                            </div>
                        )
                    }
                />

                <Card 
                    title={ 
                        <div
                            style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                            <div 
                                style={{ 
                                    fontSize: '25px',
                                    fontWeight: 600
                                }}>
                                { t('sentence.filter') }
                            </div>

                            <Button
                                showsearchshowsearch="true"
                                style={{ 
                                    width: "100px", 
                                    marginLeft: "30px", 
                                    background: '#384AD7', 
                                    borderColor: '#384AD7',
                                    float: 'right'
                                }}
                                type="primary"
                                onClick={ handleFilter }>
                                { t('sentence.search') }
                            </Button> 
                        </div>
                    } 
                    style={{ marginBottom: '40px' }}>

                    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                        <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ 6 }>
                            <div 
                                style={{ 
                                    marginBottom: "10px",
                                    fontSize: '20px',
                                    fontWeight: 500
                                }}>
                                { t('sentence.by_text') }
                            </div>
                            <Input
                                placeholder={ t('sentence.searchBox') }
                                value={ value }
                                onChange={(e) => {

                                    const currValue = e.target.value;

                                    setValue(currValue);
                                    handleChange(currValue, "text");
                                }}
                            />
                        </Col>

                        <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ 6 }>
                            <div style={{ 
                                marginBottom: "10px",
                                fontSize: '20px',
                                fontWeight: 500
                            }}>
                                { t('sentence.by_rating') }
                            </div>

                            <Select
                                showSearch
                                style={{
                                    width: '100%',
                                }}
                                defaultValue={
                                    ratingOption.length === 0 ? "" : ratingOption[0]
                                }
                                onChange={ value => handleChange(value, "rating") }
                            >
                                {ratingOption}
                            </Select>
                        </Col>

                        <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ 6 }>
                            <div style={{ 
                                marginBottom: "10px",
                                fontSize: '20px',
                                fontWeight: 500
                            }}>
                                { t('sentence.by_lang_1') }
                            </div>

                            <Select
                                style={{
                                    width: '100%',
                                }}
                                defaultValue={ lang1Option.length === 0 ? "" : lang1Option[0] }
                                onChange={ value => handleChange(value, "lang1")}
                            >
                                { lang1Option }
                            </Select>
                        </Col>

                        <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ 6 }>
                            <div style={{ 
                                marginBottom: "10px",
                                fontSize: '20px',
                                fontWeight: 500
                            }}>
                                { t('sentence.by_lang_2') }
                            </div>

                            <Select
                                showSearch
                                style={{
                                    width: '100%',
                                }}
                                defaultValue={lang2Option.length === 0 ? "" : lang2Option[0]}
                                onChange={ value => handleChange(value, "lang2") }
                            >
                                {lang2Option}
                            </Select>
                        </Col>
                    </Row>
                </Card>

                <Card className='card-body-padding-0'>
                    <Table
                        // rowSelection={{
                        //   type: "checkbox",
                        //   ...rowSelection,
                        // }}
                        rowKey={ record => record.id } 
                        rowClassName={ record =>  {
                            if (!record.editor?.id) return '';
                            if (record.editor.id === currentUserId) return 'edited-by-my-self';
                            if (record.editor.id !== currentUserId) return 'edited-by-someone';
                        }}
                        expandable={{
                            expandedRowRender: record => {
                                return (
                                    <div style={{
                                        padding: '20px'
                                    }}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label 
                                                style={{
                                                    fontSize: '16px',
                                                    marginBottom: '10px',
                                                    fontWeight: 600
                                                }}>
                                                { t('originalText') } { t(record.lang1) }
                                            </label>
                                            <div>
                                                { record.original.text1 }
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label 
                                                style={{
                                                    fontSize: '16px',
                                                    marginBottom: '10px',
                                                    fontWeight: 600
                                                }}>
                                                { t('originalText') } { t(record.lang2) }
                                            </label>

                                            <div>
                                                { record.original.text2 }
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label 
                                                style={{
                                                    fontSize: '16px',
                                                    marginBottom: '10px',
                                                    fontWeight: 600
                                                }}>
                                                { t('sentence.lastUpdate') } { t('sentence.by') }
                                                &nbsp;{ record.editor?.id === currentUserId ? t('sentence.you') : record.editor.username }
                                            </label>
                                            
                                            <div>
                                                { formatDate(record.updated_time) }
                                            </div>
                                        </div>

                                        <div>
                                            <label 
                                                style={{
                                                    fontSize: '16px',
                                                    marginBottom: '10px',
                                                    fontWeight: 600
                                                }}>
                                                { t('sentence.createdTime') } 
                                            </label>
                                            <div>
                                                { formatDate(record.created_time) }
                                            </div>
                                        </div>
                                    </div>
                                )
                            },
                            rowExpandable: record => { return !!record.editor?.id },
                        }}
                        dataSource={ dataSource }
                        columns={ columns }
                        onChange={ handleTableChange } 
                        pagination={{
                            pageSize: paginationParams.page_size,
                            total: paginationParams.total_items,
                            current: paginationParams.current_page
                        }}>
                    </Table>
                </Card>

                <Modal 
                    title={ t('sentence.resultUpdateData') } 
                    visible={ isModalImportVisible } 
                    footer={[
                        <Button 
                            type="primary"
                            onClick={() => setIsModalImportVisible(false)}>
                            { t('sentence.ok') }
                        </Button>
                    ]}>
                    <p>
                        - { t('sentence.imported') } { importStatus.nSuccess }/{ importStatus.nData } { t('sentence.pairParaSentences') }.
                    </p>
                    <p>
                        - { importStatus.nErrorHashExists }/{ importStatus.nData } { t('sentence.duplicatedRecords') }.
                    </p>
                </Modal>
            </SiteLayout>
        </React.Fragment>
    );
};

export default SentencePage;
