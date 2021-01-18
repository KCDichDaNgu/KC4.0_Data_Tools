import "./style.module.scss";

import React, { useEffect, useState, useRef } from "react";
import PageTitle from "../../layout/site-layout/main/PageTitle";
import paraSentenceAPI from "../../api/para-sentence";

import {
    Button,
    Row,
    Col,
    Card,
    Select,
    Input,
    message
} from "antd";

import { useTranslation } from 'react-i18next';

const FileDownload = require('js-file-download');

const { Option } = Select;

const SentenceReport = (props) => {

    const { t } = useTranslation(['common']);

    const [searchInput, setSearchInput] = useState('');
    const [langList1, setLangList1] = useState([]);
    const [langList2, setLangList2] = useState([]);
    const [ratingList, setRatingList] = useState([]);
    const [filter, setFilter] = useState({});

    const lang1Option = [
        <Option key='all'>{t('sentencePage.all')}</Option>
    ].concat(
        langList1.map((lang) => {
            return <Option key={lang}>{lang}</Option>;
        })
    );

    const lang2Option = [
        <Option key='all'>{t('sentencePage.all')}</Option>
    ].concat(
        langList2.map((lang) => {
            return <Option key={lang}>{lang}</Option>;
        })
    );

    const ratingOption = [
        <Option key='all'>{t('sentencePage.all')}</Option>
    ].concat(
        ratingList.map((rating) => {
            return <Option key={rating}>{t(`sentencePage.${rating}`)}</Option>;
        })
    );

    useEffect(() => {
        paraSentenceAPI.getOptions().then((res) => {
            setLangList1(res.data.data.lang1);
            setLangList2(res.data.data.lang2);
            setRatingList(res.data.data.rating);
        });
    }, []);

    const handleChange = (searchInput, key) => {
        if (key === 'text') {
            setFilter({ ...filter, text1: searchInput, text2: searchInput });
        } else {
            setFilter({ ...filter, [key]: searchInput });
        }
    };

    const exportData = () => {
        paraSentenceAPI.exportFile(filter).then(res => {
            FileDownload(res.data, 'report.csv');
        });
    }   

    return (
        <React.Fragment>
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
                            { t('sentencePage.filter') }
                        </div>
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
                            { t('sentencePage.by_text') }
                        </div>

                        <Input
                            placeholder={ t('sentencePage.searchBox') }
                            value={ searchInput }
                            onChange={(e) => {

                                const currValue = e.target.value;

                                setSearchInput(currValue);
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
                            { t('sentencePage.by_rating') }
                        </div>

                        <Select
                            showSearch
                            style={{
                                width: '100%',
                            }}
                            defaultValue='all'
                            onChange={ value => handleChange(value, "rating") }>
                            { ratingOption }
                        </Select>
                    </Col>

                    <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ 6 }>
                        <div style={{ 
                            marginBottom: "10px",
                            fontSize: '20px',
                            fontWeight: 500
                        }}>
                            { t('sentencePage.by_lang_1') }
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
                            { t('sentencePage.by_lang_2') }
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

                    <Col 
                        md={ 24 }
                        className="text-center"> 
                        <Button
                            showsearchshowsearch="true"
                            style={{ 
                                width: "100px", 
                                marginLeft: "30px", 
                                background: '#384AD7', 
                                borderColor: '#384AD7',
                            }}
                            type="primary"
                            onClick={ exportData }>
                            { t('sentencePage.exportData') }
                        </Button> 
                    </Col>
                </Row>
            </Card>
        </React.Fragment>
    );
};

export default SentenceReport;
