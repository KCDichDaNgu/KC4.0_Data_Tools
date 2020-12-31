import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuthenticatedUser } from '../utils/auth';

const AuthRoute = ({ component: Component, ...rest }) => {

    return <Route
        { ...rest }
        render={
            props => isAuthenticatedUser() ? <Component {...props} /> : <Redirect to="/login" />
        }
    />
};

export default AuthRoute;
