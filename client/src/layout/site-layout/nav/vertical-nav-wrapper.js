import React, { Component, Fragment, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';

import MetisMenu from 'react-metismenu';
import { isAdmin } from '../../../utils/auth';
import { clonedStore } from '../../../store';

import { useTranslation } from 'react-i18next';

const Nav = () => {
    const { t, i18n } = useTranslation(['common']);

    let [ isClient, setIsClient ] = useState(false)
    let [ mainNav, setMainNav ] = useState([
        {
            icon: 'pe-7s-news-paper',
            label: t('documentPage.title'),
            to: 'document',
        },
        {
            icon: 'pe-7s-copy-file',
            label: t('sentencePage.title'),
            to: 'sentence',
        },
    ])
    
    useEffect(() => {
        setIsClient(true);

        let check = setInterval(() => {

            let profile = clonedStore.getState().User.profile
            
            if (typeof profile !== 'undefined') {
                
                if (isAdmin()) {

                    setMainNav([
                        {
                            icon: 'pe-7s-home',
                            label: t('homePage.title'),
                            to: '/',
                        },
                        {
                            icon: 'pe-7s-users',
                            label: t('manageUserPage.title'),
                            to: '/manage-user',
                        },
                        {
                            icon: 'pe-7s-server',
                            label: t('backupDatabase.title'),
                            to: '/manage-backup',
                        },
                        {
                            icon: 'pe-7s-global',
                            label: t('domainPage.title'),
                            to: 'domain',
                        },
                        {
                            icon: 'pe-7s-global',
                            label: t('dataFieldPage.title'),
                            to: 'data-field',
                        },
                        {
                            icon: 'pe-7s-news-paper',
                            label: t('documentPage.title'),
                            to: 'document',
                        },
                        {
                            icon: 'pe-7s-copy-file',
                            label: t('sentencePage.title'),
                            to: 'sentence',
                        },
                    ])
                }

                clearInterval(check)
            }

        }, 100)
    }, [])

    return (
        <Fragment>
            <h5 className="app-sidebar__heading">{ t('Common.mainPages') }</h5>
            <MetisMenu 
                content={ mainNav } 
                activeLinkFromLocation
                className="vertical-nav-menu"
                iconNamePrefix="" 
                classNameStateIcon="pe-7s-angle-down">
            </MetisMenu>
        </Fragment>
    );
}

export default withRouter(Nav);