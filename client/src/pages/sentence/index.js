import React, { useEffect, useState, useRef } from "react";
import PageTitle from "../../layout/site-layout/main/PageTitle";
import paraSentenceAPI from "../../api/paraSentence";

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
    Col
} from "antd";
import { UploadOutlined } from '@ant-design/icons';
import SiteLayout from "../../layout/site-layout";

import "./Sentence.module.scss";

import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/date';

const { TextArea } = Input;
const { Option } = Select;

const SentencePage = (props) => {

    const { t } = useTranslation(['common']);

    const [dataSource, setDataSource] = useState([]);
    const [value, setValue] = useState("");
    const [paginationParams, setPaginationParams] = useState({});
    const [requestParams, setRequestParams] = useState({
        domain: "",
        lang1: "",
        lang2: "",
        sort_by: "",
        sort_order: "",
        page: ""
    });
    const [uploadingFile, setUploadingFile] = useState(false);

    const renderText = (key, paraSentence, index) => {

        let lastUpdated = paraSentence[key];

        if (paraSentence.hasOwnProperty('edited')
            && paraSentence['edited'].hasOwnProperty(key)
            && paraSentence['edited'][key] !== undefined) {
            lastUpdated = paraSentence['edited'][key];
        }

        return (
            <TextArea
                key={paraSentence['_id']['$oid']}
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

        if (paraSentence.hasOwnProperty('edited')
            && paraSentence['edited'].hasOwnProperty('rating')
            && paraSentence['edited']['rating'] !== undefined) {
            lastUpdated = paraSentence['edited']['rating'];
        }

        return (
            <Radio.Group
                key={paraSentence['_id']['$oid']} 
                defaultValue={lastUpdated}
                onChange={value => updateParaSentence(paraSentence, "rating", value)}>
                {
                    ratingList.map((rating) => {
                        if (rating == 'unRated') {

                            return (
                                <Radio.Button key={rating} value={rating}>?</Radio.Button>
                            );
                        } else {
                            return (
                                <Radio.Button key={rating} value={rating}>{t(`sentence.${rating}`)}</Radio.Button>
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
        {
            title: t('sentence.lastUpdate'),
            dataIndex: "updated_time",
            key: "updated_time",
            render: (updated_time) => (
                formatDate(updated_time)
            ),
            sorter: (a, b, sortOrder) => { },
            sortDirections: ['ascend', 'descend', 'ascend']
        },
        {
            title: t('sentence.score'),
            dataIndex: "score",
            key: "score.senAlign",
            render: (score) => Number(score['senAlign']).toFixed(2),
            sorter: (a, b, sortOrder) => { },
            sortDirections: ['ascend', 'descend', 'ascend']
        },
        {
            title: t('sentence.rating'),
            dataIndex: "rating",
            key: "rating",
            render: (rating, paraSentence, index) => renderRating(rating, paraSentence, index),
        }
    ];

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSeletedDomain(selectedRowKeys);
        },
    };

    const handleChange = (value, key) => {
        setRequestParams({ ...requestParams, [key]: value });
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

    const lang1Option = langList1.map((lang) => {
        return <Option key={lang}>{lang}</Option>;
    });
    const lang2Option = langList2.map((lang) => {
        return <Option key={lang}>{lang}</Option>;
    });

    const ratingOption = ratingList.map((rating) => {
        return <Option key={rating}>{t(`sentence.${rating}`)}</Option>;
    });

    const uploadFile = {
        name: 'file',
        action: paraSentenceAPI.importFromFileUrl(),
        showUploadList: false,
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {

            if (info.file.status !== 'uploading') setUploadingFile(true);

            if (info.file.status === 'done') {
                setUploadingFile(false);

                let nSuccess = info.file.response.n_success;
                let nData = info.file.response.n_data;

                message.success(`${t('sentence.imported')} ${nSuccess}/${nData} ${t('sentence.pairParaSentences')}`);

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

        paraSentenceAPI.getSentences(params).then((res) => {
            setDataSource(res.data.data);
            setPaginationParams(res.data.pagination);
        });
    }

    const updateParaSentence = (paraSentence, key, value) => {
        let filterParams = {};
        filterParams[key] = value;

        paraSentenceAPI.updateParaSentence(paraSentence['_id']['$oid'], filterParams).then((res) => {
            if (res.data.code == process.env.REACT_APP_CODE_SUCCESS) {
                message.success(t('sentence.editedSuccess'));
            } else {
                message.error(t('sentence.editedFail'));
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
                                onClick={handleFilter}>
                                {t('sentence.search')}
                            </Button> 
                        </div>
                    } 
                    style={{ marginBottom: '40px' }}>

                    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                        <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ 6 }>
                            <div style={{ 
                                marginBottom: "10px",
                                fontSize: '20px',
                                fontWeight: 500
                            }}>
                                { t('sentence.by_text') }
                            </div>
                            <Input
                                placeholder={t('sentence.searchBox')}
                                value={value}
                                onChange={(e) => {
                                    const currValue = e.target.value;
                                    setValue(currValue);
                                    const filteredData = dataSource.filter((entry) => {
                                        if (
                                            entry.text1.includes(currValue) ||
                                            entry.text2.includes(currValue)
                                        )
                                            return true;
                                    });
                                    setDataSource(filteredData);
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
                                onChange={(value) => handleChange(value, "rating")}
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
                                defaultValue={lang1Option.length === 0 ? "" : lang1Option[0]}
                                onChange={(value) => handleChange(value, "lang1")}
                            >
                                {lang1Option}
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
                                onChange={(value) => handleChange(value, "lang2")}
                            >
                                {lang2Option}
                            </Select>
                        </Col>
                    </Row>
                </Card>

                <Card className='card-body-padding-0'>
                    <Table
                        className="table-striped-rows"
                        // rowSelection={{
                        //   type: "checkbox",
                        //   ...rowSelection,
                        // }}
                        rowKey="key"
                        dataSource={dataSource}
                        columns={columns}
                        onChange={handleTableChange}
                        pagination={{
                            pageSize: paginationParams.page_size,
                            total: paginationParams.total_items,
                            current: paginationParams.current_page
                        }}>
                    </Table>
                </Card>
            </SiteLayout>
        </React.Fragment>
    );
};

export default SentencePage;
