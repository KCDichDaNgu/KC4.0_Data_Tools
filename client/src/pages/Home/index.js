import React, { useEffect, useState, useRef } from "react";
import PageTitle from '../../Layout/SiteLayout/AppMain/PageTitle';
import Tabs from 'react-responsive-tabs';

import SiteLayout from '../../Layout/SiteLayout';

import './Home.module.css';

function getTabs() {
    return ['a','b','c']
}

function HomePage(props) {
    return (

        <React.Fragment>

            <SiteLayout>

                <PageTitle
                    heading="Home"
                    subheading="Create new content..."
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
