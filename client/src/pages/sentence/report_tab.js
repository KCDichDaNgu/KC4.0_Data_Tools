import "./style.module.scss";

import React, { useEffect, useState, useRef } from "react";
import PageTitle from "../../layout/site-layout/main/PageTitle";
import reportAPI from "../../api/report";
import locale from 'antd/es/date-picker/locale/vi_VN';

import {
    Button,
    Row,
    Col,
    Card,
    Select,
    Input,
    message,
    Table,
    DatePicker
} from "antd";

import { useTranslation } from 'react-i18next';

const SentenceReport = (props) => {

    const { t } = useTranslation(['common']);
    const { setReviewTabFilterParams } = props;

    // key = lang, value = [{user_id, user_name, statistics}]
    const [dataDict, setDataDict] = useState({});
    const [filterDict, setFilterDict] = useState({});
    const [unRatedCount, setUnRatedCount] = useState({});

    useEffect(() => {
        reportAPI.getReport().then(res => {
            if (res.data.code == process.env.REACT_APP_CODE_SUCCESS) {
                setDataDict(res.data.data);
                
                let _filterDict = {};
                Object.entries(res.data.data).map(([lang, data]) => {
                    _filterDict[lang] = {};
                });
                setFilterDict(_filterDict);
            } else {
                message.error(t(`reportTab.${res.data.message}`));
            }
        });

        reportAPI.getUnRatedCount().then(res => {
            if (res.data.code == process.env.REACT_APP_CODE_SUCCESS) {
                setUnRatedCount(res.data.data);
            } else {
                message.error(t(`reportTab.${res.data.message}`));
            }
        });
    }, []);

    const viewDetails = (user_id) => {
        console.log(user_id);
    }

    const columns = [
        {
            title: `${t('sentencePage.reportTab.username')}`,
            dataIndex: "username",
            key: "username"
        },
        {
            title: `${t('sentencePage.reportTab.numberEdited')}`,
            dataIndex: "n_edited",
            key: "n_edited",
            render: (n_edited) => {return n_edited ? n_edited : 0}
        },
        {
            title: `${t('sentencePage.reportTab.numberBeEdited')}`,
            dataIndex: "n_be_edited",
            key: "n_be_edited",
            render: (n_be_edited) => {return n_be_edited ? n_be_edited : 0}
        },
        {
            title: `${t('sentencePage.reportTab.viewDetails')}`,
            dataIndex: "view_details",
            key: "view_details",
            render: (key, record) => (
                <Button 
                    type='link'
                    onClick={() => viewDetails(record['user_id']) }>
                    { t('sentencePage.reportTab.viewDetails') }
                </Button>
            )
        },
    ];

    const handleFilterDate = (searchData, lang) => {
        let fromDate = searchData == null ? null : searchData[0].valueOf(); // timestamp
        let toDate = searchData == null ? null : searchData[1].valueOf();

        filterDict[lang] = {
            'fromDate': fromDate,
            'toDate': toDate
        }
    };

    const handleFilter = (lang) => {
        reportAPI.getReport(filterDict[lang]).then(res => {
            if (res.data.code == process.env.REACT_APP_CODE_SUCCESS) {
                setDataDict(res.data.data);
            } else {
                message.error(t(`reportTab.${res.data.message}`));
            }
        });
    }

    return (
        <React.Fragment>
            {
                Object.entries(dataDict).map(([lang, data]) => {
                    return (<Card 
                        key={lang}
                        // title={ } 
                        style={{ marginBottom: '40px' }}>
                            
                        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                            <Col xs={ 24 } md={ 12 }>
                                <div
                                    style={{ 
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                    <div 
                                        style={{ 
                                            fontSize: '20px',
                                            fontWeight: 600,
                                            display: 'inline-block'
                                        }}>
                                        { t(`Language.${lang}`) }
                                    </div>
                                    <div style={{ 
                                            display: 'inline-block',
                                            marginLeft: '20px',
                                            fontSize: '18px'
                                        }}>
                                        (
                                        { t('sentencePage.reportTab.remain')} { unRatedCount[lang] }&nbsp;
                                        { t('sentencePage.reportTab.unratedSentences') }
                                        )
                                    </div>
                                </div> 
                            </Col>

                            <Col 
                                style={{ marginBottom: '20px', textAlign: 'right' }} 
                                xs={ 24 } md={ 12 }>
                                <div style={{ display: 'inline-block', marginRight: '10px' }}>
                                    <DatePicker.RangePicker 
                                        locale={ locale }
                                        allowClear={ true }
                                        onChange={ date => handleFilterDate(date, lang) }
                                    />
                                </div>
                                
                                <div style={{ display: 'inline-block' }}>
                                    <Button
                                        style={{ 
                                            width: '100px', 
                                            background: '#384AD7', 
                                            borderColor: '#384AD7'
                                        }}
                                        type='primary'
                                        onClick={ () => handleFilter(lang) }>
                                        { t('sentencePage.reportTab.filter') }
                                    </Button> 
                                </div>
                            </Col>

                            <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ 24 }>
                                <Table
                                    rowKey={ record => record.user_id }
                                    dataSource={ data }
                                    columns={ columns }
                                    // pagination={{
                                    //     pageSize: paginationParams.page_size,
                                    //     total: paginationParams.total_items,
                                    //     current: paginationParams.current_page
                                    // }}
                                    >
                                </Table>
                            </Col>
                        </Row>

                    </Card>)
                })
            }
        </React.Fragment>
    );
};

export default SentenceReport;
