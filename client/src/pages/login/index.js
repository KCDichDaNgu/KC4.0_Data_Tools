import React, { useEffect } from "react";

import { connect, useDispatch } from "react-redux";

import LoginForm from "./form";

import { userLogin, getCurrentUser } from "../../store/user/action";
import { Row } from 'reactstrap';
import { useHistory } from "react-router-dom";
import { isAuthenticatedUser, isAdmin } from '../../utils/auth';

import { useTranslation } from 'react-i18next';

import { asyncDispatch, clonedStore } from '../../store';

import watch from 'redux-watch';

import { useMountedState } from 'react-use';

const LoginPage = (props) => {
    const { t, i18n } = useTranslation(['common']);

    const history = useHistory();
    const dispatch = useDispatch();

    const isMounted = useMountedState();

    const authInfoWatcher = watch(clonedStore.getState, 'User.auth_info');
    const userProfileWatcher = watch(clonedStore.getState, 'User.profile');
    
    useEffect(() => {
        document.title = t('loginPage.title');

        clonedStore.subscribe(
            authInfoWatcher(async (newVal, oldVal, objectPath) => {
                
                if (isMounted() && isAuthenticatedUser()) {
                    await asyncDispatch(dispatch, getCurrentUser())
                }
            })
        );

        clonedStore.subscribe(
            userProfileWatcher(async (newVal, oldVal, objectPath) => {
                
                if (isMounted()) {
                    if (isAdmin()) history.push('/sentence')
                    else history.push('/sentence')
                }
            })
        );
    }, []);

    const submit = async credentials => { 
        await asyncDispatch(dispatch, userLogin(credentials));
    };

    return (
        <React.Fragment>
            <div className="h-100 bg-plum-plate bg-animation">
                <div className="container">
                    <Row className="h-100 justify-content-center align-items-center">
                        <div className="mx-auto app-login-box col-md-8">
                            <div className="app-logo-inverse mx-auto mb-3"></div>
                            <div className="modal-dialog w-100 mx-auto">
                                <LoginForm submit={ submit } />
                            </div>
                        </div>
                    </Row>
                </div>
            </div>
        </React.Fragment>
    );
}

export default LoginPage;
