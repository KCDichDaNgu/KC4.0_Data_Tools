import "./style.module.scss";

import React, { forwardRef, useState, useRef } from "react";
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

    const currentUserRoles = clonedStore.getState().User?.profile?.roles || [];

    let [ activeTab, setActiveTab ] = useState('reviewTab'); // review, export
    
    const toggleTab = (tabName) => {
        setActiveTab(tabName);
    };

    const sentencePageRef = useRef();

    const setFilterEditorIdTunnel = (editor_id, editor_name, lang2, fromDate, toDate) => {
        setActiveTab('reviewTab');
        sentencePageRef.current.setFilterEditorId(editor_id, editor_name, 
            lang2, fromDate, toDate);
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
                            ref={sentencePageRef}/>
                    </TabPane>
                    <TabPane key="reportTab">
                        <SentenceReport 
                            setFilterEditorId={ setFilterEditorIdTunnel }/>
                    </TabPane>
                </Tabs>

            </SiteLayout>
        </React.Fragment>
    );
};

export default SentencePage;
