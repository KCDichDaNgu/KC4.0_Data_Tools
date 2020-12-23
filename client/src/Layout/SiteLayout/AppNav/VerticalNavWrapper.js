import React, { Component, Fragment, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';

import MetisMenu from 'react-metismenu';
import { isAdmin } from '../../../utils/auth';
import { clonedStore } from '../../../store';

const Nav = () => {

    let [ isClient, setIsClient ] = useState(false)
    let [ mainNav, setMainNav ] = useState([
        {
            icon: 'pe-7s-home',
            label: 'Home',
            to: '/',
        },
        {
            icon: 'pe-7s-global',
            label: 'Domains',
            to: 'domains',
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
                            label: 'Home',
                            to: '/',
                        },
                        {
                            icon: 'pe-7s-rocket',
                            label: 'History',
                            to: 'log',
                        },
                        {
                            icon: 'pe-7s-download',
                            label: 'Download data',
                            to: 'download-data',
                        },
                    ])
                }

                clearInterval(check)
            }

        }, 100)
    }, [])

    return (
        <Fragment>
            <h5 className="app-sidebar__heading">Main pages</h5>
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