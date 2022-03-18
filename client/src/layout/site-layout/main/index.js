import React, { Suspense, Fragment } from 'react';

import {
    ToastContainer,
} from 'react-toastify';

import { connect } from "react-redux";

import PropTypes from "prop-types";
import AppHeader from '../header';
import AppSidebar from '../sidebar';

const AppMain = ( props ) => {
    
    return (
        <Fragment>
            <AppHeader/>
            <div className="app-main">
                <AppSidebar/>
                <div className="app-main__outer">
                    <div className="app-main__inner">
                        { props.children }
                    </div>
                </div>
            </div>
            <ToastContainer/>
        </Fragment>
    )
};

AppMain.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
    return {
        isAuthenticated: !!state.User.auth_info && !!state.User.auth_info.access_token
    };
}

export default connect(mapStateToProps)(AppMain);
