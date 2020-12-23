import React, { Suspense, useState, useEffect } from "react";
import { Switch, Route } from "react-router-dom";
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import DomainsPage from './pages/Domains';

import { useStore, cloneStore } from './store';
import { persistStore } from 'redux-persist';
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/lib/integration/react';
import AuthRoute from './routeGuards/AuthRoute';
import AdminRoute from './routeGuards/AdminRoute';

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
                                <AuthRoute 
                                    location={ location } 
                                    exact 
                                    path="/" 
                                    component={ HomePage } 
                                />

                                <AuthRoute 
                                    location={ location } 
                                    exact 
                                    path="/domains" 
                                    component={ DomainsPage } 
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

export default App;
