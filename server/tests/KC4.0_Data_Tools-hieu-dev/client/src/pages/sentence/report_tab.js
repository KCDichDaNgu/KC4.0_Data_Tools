import "./style.module.scss";

import React, { useEffect, useState, useRef } from "react";
import PageTitle from "../../layout/site-layout/main/PageTitle";
import reportAPI from "../../api/report";
import locale from 'antd/es/date-picker/locale/vi_VN';
import { LANGS, STATUS_CODES } from '../../constants';

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

import { ArrowRightOutlined } from "@ant-design/icons"

import { useTranslation } from 'react-i18next';
import moment, { lang } from 'moment';

const startDate = moment().clone().startOf('month');
const endDate = moment().add(1, 'days');

const SentenceReport = (props) => {

    const { t } = useTranslation(['common']);

    const { setFilterEditorId } = props;

    // key = lang, value = [{user_id, user_name, statistics}]
    const [dataDict, setDataDict] = useState({});
    const [filterDict, setFilterDict] = useState({});
    const [unRatedCount, setUnRatedCount] = useState({});

    useEffect(() => {
        let defaultFilterLangDict = {
            fromDate: startDate.valueOf(),
            toDate: endDate.valueOf()
        };
        let filterDict_ = {};

        LANGS.map((lang, idx) => {
            filterDict_[lang['value']] = defaultFilterLangDict;
        });

        setFilterDict(filterDict_);

        reportAPI.getReport(defaultFilterLangDict).then(res => {
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

    const viewDetails = (editor_id, editor_name, lang2, fromDate, toDate) => {
        setFilterEditorId(editor_id, editor_name, lang2, fromDate, toDate);
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
            title: `${t('sentencePage.reportTab.numberOnlyRate')}`,
            dataIndex: "n_only_rate",
            key: "n_only_rate",
            render: (n_only_rate) => {return n_only_rate ? n_only_rate : 0}
        },
        {
            title: `${t('sentencePage.reportTab.numberEditDistance')}`,
            dataIndex: "total_edit_distance",
            key: "total_edit_distance",
            render: (total_edit_distance) => {return total_edit_distance ? total_edit_distance : 0}
        },
        {
            title: `${t('sentencePage.reportTab.viewDetails')}`,
            dataIndex: "view_details",
            key: "view_details",
            render: (key, record) => (
                <Button 
                    type='link'
                    onClick={() => viewDetails(
                        record.user_id, 
                        record.username, 
                        record.lang,
                        record.from_date,
                        record.to_date) }>
                    { t('sentencePage.reportTab.viewDetails') }
                </Button>
            )
        },
    ];

    const handleFilterDate = (searchData, lang) => {
        let fromDate = searchData == null ? null : searchData[0].valueOf(); // timestamp
        let toDate = searchData == null ? null : searchData[1].valueOf();

        fromDate = new Date(fromDate);
        fromDate.setHours(0,0,0,0);
        fromDate = fromDate.getTime();

        toDate = new Date(toDate);
        toDate.setHours(0,0,0,0);
        toDate = toDate.getTime();

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
                            <Col style={{ marginBottom: '10px' }} xs={ 24 } md={ 14 }>
                                <div
                                    style={{ 
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                    <div 
                                        style={{ 
                                            fontSize: '20px',
                                            fontWeight: 600,
                                            marginRight: '16px',
                                            display: 'inline-block'
                                        }}>
                                        { t(`Language.${lang}`) }
                                    </div>
                                    <div style={{ 
                                            display: 'inline-block',
                                            fontSize: '18px'
                                        }}>
                                        (
                                        { t('sentencePage.reportTab.remain')}&nbsp;
                                        { Number(unRatedCount[lang])?.toLocaleString('vi') }&nbsp;
                                        { t('sentencePage.reportTab.unratedSentences') }
                                        )
                                    </div>
                                </div> 
                            </Col>

                            <Col xs={24} md={10}>
                                <Row gutter={ [ 16, 8 ] }>
                                    <Col 
                                        style={{ textAlign: 'right' }} 
                                        xs={ 24 } md={ 18 }>
                                        <DatePicker.RangePicker 
                                            style={{ width: "fit-content" }}
                                            locale={ locale }
                                            allowClear={ true }
                                            defaultValue={ [startDate, endDate] }
                                            onChange={ date => handleFilterDate(date, lang) }
                                            separator={<ArrowRightOutlined style={{display: "flex"}}/>}
                                        />
                                    </Col>

                                    <Col 
                                        style={{ marginBottom: '10px', textAlign: 'right' }}
                                        xs={ 24 } md={ 6 }>
                                        <Button
                                            style={{ 
                                                width: '100%',
                                                maxWidth: '100px',
                                                background: '#384AD7', 
                                                borderColor: '#384AD7'
                                            }}
                                            type='primary'
                                            onClick={ () => handleFilter(lang) }>
                                            { t('sentencePage.reportTab.filter') }
                                        </Button> 
                                    </Col>
                                </Row>
                            </Col>

                            <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ 24 }>
                                <Table
                                    scroll={{ x: 'max-content' }}
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
