import React, { useEffect } from "react";

import { connect } from "react-redux";

import LoginForm from "./form";

import { userLogin } from "../../store/user/action";
import { Row } from 'reactstrap';
import { useHistory } from "react-router-dom";
import { isAuthenticatedUser } from '../../utils/auth';

import { useTranslation } from 'react-i18next';

const LoginPage = (props) => {
    const { t, i18n } = useTranslation(['common']);

    let history = useHistory();
    
    useEffect(() => {
        document.title = t('login.title');
    });

    const submit = credentials => { 
        props.userLogin(credentials);

        let check = setInterval(() => {
            if (isAuthenticatedUser()) {
                history.push('/')

                clearInterval(check)
            }
        }, 100)
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

function mapDispatch(dispatch) {
    return {
        userLogin: (credentials) => dispatch(userLogin(credentials))
    }
}

export default connect(null, mapDispatch)(LoginPage);
