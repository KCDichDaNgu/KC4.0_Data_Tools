import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuthenticatedUser, isAdmin, isReviewer} from '../utils/auth';

const AdminReviewerRoute = ({ component: Component, ...rest }) => {

    return <Route
        { ...rest }
        render={
            props => isAuthenticatedUser() && (isAdmin() || isReviewer()) ? <Component {...props} /> : <Redirect to="/login" />
        }
    />
};

export default AdminReviewerRoute;
