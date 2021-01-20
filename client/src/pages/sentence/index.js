import "./style.module.scss";

import React, { useEffect, useState, useRef } from "react";
import PageTitle from "../../layout/site-layout/main/PageTitle";
import paraSentenceAPI from "../../api/para-sentence";
import SentenceReport from "./report_tab";
import SentenceReview from "./review_tab";

import {
    Button,
    Row,
    Col,
    Tabs
} from "antd";

import SiteLayout from "../../layout/site-layout";
import { clonedStore } from '../../store';

import { LANGS } from '../../constants';

import { useTranslation } from 'react-i18next';

const { TabPane } = Tabs;

const SentencePage = (props) => {

    const { t } = useTranslation(['common']);

    let [ activeTab, setActiveTab ] = useState('reviewTab'); // review, export
    
    const toggleTab = (tabName) => {
        setActiveTab(tabName);
    };

    const setReviewTabFilterParams = (params) => {
        console.log(params);
    }

    return (
        <React.Fragment>
            <SiteLayout>

                <PageTitle
                    heading={ t(`sentencePage.${ activeTab }.title`) } 
                    icon="pe-7s-home icon-gradient bg-happy-itmeo"
                />

                <div style={{ marginBottom: '20px' }}>
                    <Button 
                        onClick={ () => toggleTab('reviewTab') }
                        type={ activeTab == 'reviewTab' ? "primary" : "" }>
                        { t('sentencePage.title') }
                    </Button>

                    <Button 
                        onClick={ () => toggleTab('reportTab') }
                        type={ activeTab == 'reportTab' ? "primary" : "" }>
                        { t('sentencePage.reportTab.title') }
                    </Button>
                </div>

                <Tabs 
                    renderTabBar={() => (<div></div>)}
                    size='large'
                    activeKey={ activeTab } 
                    onChange={ setActiveTab }>
                    <TabPane key="reviewTab">
                        <SentenceReview 
                            setFilterParams={ setReviewTabFilterParams }/>
                    </TabPane>
                    <TabPane key="reportTab">
                        <SentenceReport
                            setReviewTabFilterParams={ setReviewTabFilterParams }/>
                    </TabPane>
                </Tabs>

            </SiteLayout>
        </React.Fragment>
    );
};

export default SentencePage;
