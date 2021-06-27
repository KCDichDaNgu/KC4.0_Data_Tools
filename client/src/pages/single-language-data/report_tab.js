import "./style.module.scss";

import React, { useEffect, useState } from "react";
import singleLanguageDataAPI from "../../api/single-language-data";
import assignmentAPI from '../../api/assignment';

import { LANGS, STATUS_CODES } from '../../constants';

import Chart from 'react-apexcharts';

import {
    Row,
    Col,
    Card,
    Select,
    Table,
} from "antd";

import { isAdmin } from '../../utils/auth';
import { useTranslation } from 'react-i18next';
import { randomColors } from '../../utils/generate-color'
import { getConfirmLocale } from "antd/lib/modal/locale";

const SentenceReport = (props) => {
    const { t } = useTranslation(['common']);

    const wordCountColumns = [
        {
          title: 'Từ',
          dataIndex: 'word',
        },
        {
          title: 'Tần số',
          dataIndex: 'count',
          render: count => count.toLocaleString()
        }
    ];
    const [filter, setFilter] = useState({
        lang: '',
        field: '',
    });
    const [langList, setLangList] = useState([]);
    const [reportData, setReportData] = useState({
        "total_file": 0,
        "sentence_num": 0,
        "word_num": 0,
        "dict_size": 0,
        "longest_sentence": 0,
        "shortest_setence": 0,
        "word_num_avg": 0,
        "word_count": []
    });
    const [totalFieldReportData, setTotalFieldReportData] = useState({});
    const [currentField, setCurrentField] = useState([]);
    const [chartData, setChartData] = useState({
        series: [],
        labels: [],
        colors: ["#ffffff"]
    });

    const updateChart = data => {
        let newSeries = []
        let newLables = []
        data.forEach(e => {
            newSeries.push(e.count)
            newLables.push(e.field.name)
        });

        setChartData({
            series: newSeries,
            labels: newLables,
            colors: randomColors(data.length)
        })
    }

    useEffect(() => {

        const fetchData = async () => {

            let cloneFilter = JSON.parse(JSON.stringify(filter))

            if (isAdmin()) {
                setLangList([
                    {
                        value: '',
                        label: 'all'
                    }
                ].concat(LANGS))
            } else {
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

                cloneFilter = {
                    ...filter,
                    lang: langs[0]?.value
                }

                setFilter(cloneFilter)
            }

            let reportRes = await singleLanguageDataAPI.getReport(filter)
            setReportData(reportRes.data.data)
            setTotalFieldReportData(reportRes.data.data)

            let fieldReportRes = await singleLanguageDataAPI.getFieldReport({lang: filter.lang})
            setCurrentField(fieldReportRes.data.data)
            updateChart(fieldReportRes.data.data)
        }

        fetchData()
    }, []);

    const handleFilterChange = async (searchData, key) => {
        
        let cloneFilter = {
                ...filter,
                [key]: searchData,
                field: ''
            }
        setFilter(cloneFilter)
        
        let reportRes = await singleLanguageDataAPI.getReport(cloneFilter)
        setReportData(reportRes.data.data)
        setTotalFieldReportData(reportRes.data.data)
        let fieldReportRes = await singleLanguageDataAPI.getFieldReport({lang: cloneFilter.lang})
        setCurrentField(fieldReportRes.data.data)
        updateChart(fieldReportRes.data.data)
    };

    const selectField = async (event, chartContext, config) => {
        let selectedField = config.dataPointIndex;
        let selectedFieldId = currentField[selectedField].field._id.$oid
        if (filter.field !== selectedFieldId){
            filter.field = selectedFieldId
            let reportRes = await singleLanguageDataAPI.getReport(filter)
            setReportData(reportRes.data.data)
        } else if (filter.field === selectedFieldId){
            filter.field = ""
            setReportData(totalFieldReportData)
        }
    }

    return (
        <React.Fragment>
            <Card
                style={{ marginBottom: '40px' }}
            >
                <Row
                    gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                    style={{ position: 'relative' }}>

                    <Col
                        style={{ marginBottom: '20px' }}
                        xs={24}
                        md={8}
                    >
                        
                            <div style={{
                                marginBottom: '5px',
                                fontSize: '20px',
                                fontWeight: 500
                            }}>
                                {t('singleLanguageDataPage.corpus')}
                            </div>

                            <Select
                                style={{
                                    width: '100%',
                                }}
                                options={ langList.map(e => {
                                    if (e.value === '') {
                                        return {
                                            value: '', 
                                            label: t('all')
                                        }
                                    } 

                                    return {
                                        value: e.value, 
                                        label: t(`Language.${e.label}`)
                                    }
                                }) }
                                value={ filter.lang }
                                onChange={ value => handleFilterChange(value, 'lang') }
                            />
                       
                    </Col>
                </Row>
            </Card>
            <Card>
                <Row>
                    <Col
                        xs={24}
                        xl={12}
                    >
                        <Chart 
                            options={{
                                colors: chartData.colors,
                                labels: chartData.labels,
                                stroke: {
                                    width: 1
                                },
                                chart: {
                                    events: {
                                        dataPointSelection: selectField,
                                        updated: (chartContext, config) => {
                                            config.globals.selectedDataPoints = []
                                        }
                                    }
                                },
                                noData: {
                                    text: t("noData"),
                                    align: 'center',
                                    verticalAlign: 'middle',
                                    offsetX: 0,
                                    offsetY: 0,
                                    style: {
                                      color: '#123456',
                                      fontSize: '14px',
                                      fontFamily: undefined
                                    }
                                  }
                            }}
                            series={chartData.series} 
                            type="pie" 
                            width='75%'
                        />
                    </Col>
                    <Col
                        xs={12}
                        xl={6}
                    >
                        <table id='general-info-tb'>
                            <tbody>
                            <tr>
                                <th>Số tệp</th>
                                <td>{ reportData.total_file }</td>
                            </tr>
                            <tr>
                                <th>Số câu</th>
                                <td>{ reportData.sentence_num }</td>
                            </tr>
                            <tr>
                                <th>Số từ</th>
                                <td>{ reportData.word_num }</td>
                            </tr>
                            <tr>
                                <th>Kích thước tập từ vựng</th>
                                <td>{ reportData.dict_size } từ</td>
                            </tr>
                            <tr>
                                <th>Câu dài nhất</th>
                                <td>{ reportData.longest_sentence } từ</td>
                            </tr>
                            <tr>
                                <th>Câu ngắn nhất</th>
                                <td>{ reportData.shortest_setence } từ</td>
                            </tr>
                            <tr>
                                <th>Độ dài câu trung bình</th>
                                <td>{ reportData.word_num_avg.toFixed(2) } từ</td>
                            </tr>
                            </tbody>
                        </table>
                    </Col>
                    <Col
                        xs={12}
                        xl={6}
                    >
                            <Table
                                scroll={{ x: 'max-content' }}
                                rowKey={record => record.word}
                                columns={wordCountColumns}
                                dataSource={reportData.word_count}
                                footer={() => (
                                    <div style={{ float: "right" }}>
                                        <div style={{ lineHeight: "32px" }}>
                                            {`${t('total')} ${reportData.dict_size} ${t('records').toLowerCase()}`}
                                        </div>
                                    </div>
                                )}
                            />
                    </Col>
                </Row>
            </Card>
        </React.Fragment>
    );
};

export default SentenceReport;
