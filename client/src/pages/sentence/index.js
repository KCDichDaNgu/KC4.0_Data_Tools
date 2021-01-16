import "./style.module.scss";

import React, { useEffect, useState, useRef } from "react";
import PageTitle from "../../layout/site-layout/main/PageTitle";
import paraSentenceAPI from "../../api/para-sentence";
import SentenceExport from "./export_tab";
import SentenceReview from "./review_tab";

import {
    Button,
    Row,
    Col,
    Tabs
} from "antd";

import SiteLayout from "../../layout/site-layout";
import { clonedStore } from '../../store';

import { useTranslation } from 'react-i18next';

const { TabPane } = Tabs;

const SentencePage = (props) => {

    const { t } = useTranslation(['common']);

    const currentUserRoles = clonedStore.getState().User?.profile?.roles || []; // bug here, slow

    let [ activeTab, setActiveTab ] = useState('reviewTab'); // review, export
    
    const toggleTab = (tabName) => {
        setActiveTab(tabName);
    };

    return (
        <React.Fragment>
            <SiteLayout>

                <PageTitle
                    heading={ t(`sentencePage.${ activeTab }.title`) } 
                    icon="pe-7s-home icon-gradient bg-happy-itmeo"
                />

                {
                    currentUserRoles.includes('admin') ? (
                        <div style={{ marginBottom: '20px' }}>
                            <Button 
                                onClick={ () => toggleTab('reviewTab') }
                                type={ activeTab == 'reviewTab' ? "primary" : "" }>
                                { t('sentencePage.title') }
                            </Button>
                            <Button 
                                onClick={ () => toggleTab('exportTab') }
                                type={ activeTab == 'exportTab' ? "primary" : "" }>
                                { t('sentencePage.exportTab.title') }
                            </Button>
                        </div>
                    ) : ''
                }

                
                <Tabs 
                    renderTabBar={() => (<div></div>)}
                    size='large'
                    activeKey={ activeTab } 
                    onChange={ setActiveTab }>
                    <TabPane key="reviewTab">
                        <SentenceReview />
                    </TabPane>
                    {
                        currentUserRoles.includes('admin') ? (
                            <TabPane key="exportTab">
                                <SentenceExport />
                            </TabPane>
                        ) : ''
                    }
                </Tabs>

            </SiteLayout>
        </React.Fragment>
    );
};

export default SentencePage;
