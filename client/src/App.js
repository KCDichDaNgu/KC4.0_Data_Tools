import React, { Suspense, useState, useEffect } from "react";
import { Switch, Route } from "react-router-dom";
import LoginPage from './pages/login';
import HomePage from './pages/home';

import DocumentPage from './pages/document';
import SentencePage from './pages/sentence';
import singleLanguageDataPage from './pages/single-language-data';

import SettingPage from './pages/admin/setting';
import ManageUserPage from './pages/admin/manage-user';
import DomainPage from './pages/admin/domain';
import DataFieldPage from './pages/admin/data-field';
import ManageBackupPage from './pages/admin/manage-backup';
import ToolStatus from './pages/admin/tool-status'

import { useStore, cloneStore } from './store';
import { persistStore } from 'redux-persist';
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/lib/integration/react';

import AuthRoute from './routeGuards/AuthRoute';
import AdminRoute from './routeGuards/AdminRoute';
import AdminReviewerRoute from './routeGuards/AdminReviewerRoute'

import { withTranslation, Trans } from 'react-i18next';

import './App.css';
import 'antd/dist/antd.css';
import 'react-toastify/dist/ReactToastify.css';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"

const App = ({ location, initialReduxState }) => {

    const store = useStore(initialReduxState);
    const [ isPersistorLoaded, setPersistorLoaded ] = useState(false);

    const persistor = persistStore(store, {}, function () {
        persistor.persist();

        cloneStore(store);

        setPersistorLoaded(true);
    });

    return (
        <React.Fragment>
            
            <div id="overlay">
                <div className="cv-spinner">
                    <span className="spinner"></span>
                </div>
            </div>

            <Provider store={ store }>

                <PersistGate 
                    loading={
                        <div className="loader-container">
                            <div className="loader-container-inner">
                                <h6>
                                    Page is being loaded, please wait... 
                                </h6>
                            </div>
                        </div> 
                    } 
                    persistor={ persistor }>

                    {
                        isPersistorLoaded ?
                    
                        <Suspense>
                            <Switch>
                                <AdminRoute 
                                    location={ location } 
                                    exact 
                                    path="/" 
                                    component={ HomePage } 
                                />

                                <AdminRoute 
                                    location={ location } 
                                    exact 
                                    path="/domain" 
                                    component={ DomainPage } 
                                />

                                <AdminRoute
                                    location={ location }
                                    exact
                                    path="/tool-status"
                                    component={ ToolStatus }
                                />

                                <AdminRoute 
                                    location={ location } 
                                    exact 
                                    path="/data-field" 
                                    component={ DataFieldPage } 
                                />

                                <AdminRoute 
                                    location={ location } 
                                    exact 
                                    path="/setting" 
                                    component={ SettingPage } 
                                />

                                <AdminRoute 
                                    location={ location } 
                                    exact 
                                    path="/manage-user" 
                                    component={ ManageUserPage } 
                                />

                                <AdminRoute 
                                    location={ location } 
                                    exact 
                                    path="/manage-backup" 
                                    component={ ManageBackupPage } 
                                />

                                <AuthRoute 
                                    location={ location } 
                                    exact 
                                    path="/document" 
                                    component={ DocumentPage } 
                                />
                                
                                <AuthRoute 
                                    location={ location } 
                                    exact 
                                    path="/sentence" 
                                    component={ SentencePage } 
                                />

                                <AdminReviewerRoute 
                                    location={ location } 
                                    exact 
                                    path="/single-language-data" 
                                    component={ singleLanguageDataPage } 
                                />

                                <Route 
                                    location={ location } 
                                    exact 
                                    path="/login" 
                                    component={ LoginPage } 
                                />
                            </Switch>
                        </Suspense>

                        : <></>
                    }
                </PersistGate>
            </Provider>
        </React.Fragment>
    )
};

export default withTranslation('common')(App);
