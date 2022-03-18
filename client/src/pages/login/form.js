import React, { useState } from "react";
import PropTypes from "prop-types";
// import Link from 'next/link';

import {
    Button, Form,
    FormGroup, Label,
    Input, FormText,
    FormFeedback,
    Row, Col,
    Card, CardBody,
    CardTitle,
} from 'reactstrap';

import { useTranslation } from 'react-i18next';

const LoginForm = (props) => {
    const { t, i18n } = useTranslation(['common']);

    let [ data, setData ] = useState({username: "", password: ""});
    let [ errors, setErrors ] = useState({});

    const handleChange = (event) => {

        event.preventDefault();

        const { name, value } = event.target;

        let _errors = errors;

        switch (name) {
            case 'username': 
                _errors.username = value.length == 0 ? t('Input.requiredField') : '';
                break;
            default: 
                _errors.password = value.length == 0 ? t('Input.requiredField') : ''
                break;
        }
        
        setData({ ...data, [name]: value })

        setErrors(_errors);
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        if (validateForm(errors)) {
            props.submit(data);
        }
    }

    const validateForm = (errors) => {

        let valid = true;

        Object.values(errors).forEach(
            (val) => val.length > 0 && (valid = false)
        );

        return valid;
    }

    return (
        <React.Fragment>
            <div className="modal-content">
                {/* { errors.non_field_errors && ( <FormFeedback>{ errors.non_field_errors }</FormFeedback> )} */}
                <Form onSubmit={ handleSubmit } id="login_Form" noValidate>
                    <div className="modal-body">

                        <div className="h5 modal-title text-center">
                            <h4 className="mt-2">
                                <div>{ t('loginPage.formWelcome') },</div>
                                <span>{ t('loginPage.formTitleMessage') }.</span>
                            </h4>
                        </div>

                        <FormGroup>
                            <Label htmlFor="username">{ t('username') }</Label>
                            <Input
                                type="text"
                                className="Form-control"
                                id="username"
                                name="username"
                                placeholder={ t('loginPage.usernameHint') }
                                value={ data.username }
                                onChange={ handleChange }
                                invalid={ !!errors.username }
                            />
                            
                            <FormFeedback>{ errors.username }</FormFeedback>
                        </FormGroup>
                        
                        <FormGroup>
                            <Label htmlFor="password">{ t('password') }</Label>
                            <Input
                                type="password"
                                className="Form-control"
                                id="password"
                                name="password"
                                placeholder={ t('loginPage.passwordHint') }
                                value={ data.password }
                                onChange={ handleChange }
                                invalid={ !!errors.password }
                            />

                            <FormFeedback>{ errors.password }</FormFeedback>
                        </FormGroup>

                        {/* <div className="form-check">
                            <Input 
                                name="check" 
                                id="exampleCheck" 
                                type="checkbox" 
                                className="form-check-input"/>
                            <Label 
                                for="exampleCheck" 
                                className="form-check-label">
                                { t("keepMeLoggedIn") }
                            </Label>
                        </div>

                        <div className="divider"></div>

                        <h6 className="mb-0">
                            { t('noAccount') }?
                            <Link href="/signup">
                                <a className="text-primary ml-2">
                                    { t('signup_now') }!
                                </a>
                            </Link>
                        </h6>  */}
                    </div>

                    <div className="modal-footer clearfix">

                        <div className="float-right">
                            <button 
                                type="submit"
                                className="btn btn-primary btn-lg" 
                                style={{ fontWeight: 600 }}>
                                { t('loginPage.title') }
                            </button>
                        </div>
                    </div>
                </Form>
            </div>
        </React.Fragment>
    );
}

LoginForm.propTypes = {
    submit: PropTypes.func.isRequired
};

export default LoginForm;
