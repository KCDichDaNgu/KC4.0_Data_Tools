import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuthenticatedUser, isAdmin } from '../utils/auth';

const AdminRoute = ({ component: Component, ...rest }) => {

    return <Route
        { ...rest }
        render={
            props => isAuthenticatedUser() && isAdmin() ? <Component {...props} /> : <Redirect to="/login" />
        }
    />
};

export default AdminRoute;
