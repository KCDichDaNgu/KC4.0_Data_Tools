import './style.module.scss';

import React, { useEffect, useState, useRef } from 'react';
import PageTitle from '../../layout/site-layout/main/PageTitle';
import Tabs from 'react-responsive-tabs';

import SiteLayout from '../../layout/site-layout';

import { useTranslation } from 'react-i18next';

function getTabs() {
    return ['a','b','c']
}

function HomePage(props) {
    const { t, i18n } = useTranslation(['common']);

    return (
        <React.Fragment>
            <SiteLayout>

                <PageTitle
                    heading={ t('homePage.title') }
                    // subheading="Create new content..."
                    icon="pe-7s-home icon-gradient bg-happy-itmeo" />

                <Tabs
                    tabsWrapperClass="body-tabs body-tabs-layout"
                    transform={false}
                    showInkBar={true}
                    items={getTabs()} />

            </SiteLayout>
        </React.Fragment>
    );
}

export default HomePage;
