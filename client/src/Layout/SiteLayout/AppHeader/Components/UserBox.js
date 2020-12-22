import React, { Fragment, useState, useEffect } from 'react';
import { Link } from "react-router-dom";

import {
    DropdownToggle, DropdownMenu,
    Nav, Button, NavItem, NavLink,
    UncontrolledTooltip, UncontrolledButtonDropdown
} from 'reactstrap';
import { useHistory } from "react-router-dom";
import { connect } from 'react-redux';

import {
    faAngleDown
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import avatar1 from '../../../../../public/images/avatars/1.jpg';

import * as actions from "../../../../store/user/action";
import userAPI from '../../../../api/user';
import { isAuthenticatedUser } from '../../../../utils/auth';
import { clonedStore } from '../../../../store';

const UserBox = (props) => {

    let [ active, setActive ] = useState(false);
    let [ user_details, setUserDetails ] = useState({});

    let history = useHistory();

    useEffect(() => {

        const getCurrentUser = async () => {
            props.getCurrentUser()
            
            let check = setInterval(() => {

                let profile = clonedStore.getState().User.profile
                
                if (typeof profile !== 'undefined') {
                    setUserDetails(profile)
    
                    clearInterval(check)
                }

            }, 100)
        }
        
        if (isAuthenticatedUser()) {
            getCurrentUser();
        }

    }, []);

    return (
        <Fragment>
            <div className="header-btn-lg pr-0">
                <div className="widget-content p-0">
                    <div className="widget-content-wrapper">
                        <div className="widget-content-left">
                            <UncontrolledButtonDropdown>
                                <DropdownToggle 
                                    color="link" 
                                    className="p-0">
                                        
                                    <img 
                                        width={42} 
                                        className="rounded-circle" 
                                        src={ user_details.profile_picture || avatar1 } alt=""
                                    />
                                        
                                    {/* <FontAwesomeIcon 
                                        style={{ color: '#fff', fontSize: '10px!important' }}
                                        className="ml-2 opacity-8" 
                                        icon={ faAngleDown }
                                    /> */}
                                </DropdownToggle>

                                <DropdownMenu right className="rm-pointers dropdown-menu-lg">
                                    <Nav vertical>
                                        {/* <NavItem className="nav-item-header">
                                            Activity
                                        </NavItem>
                                        <NavItem>
                                            <NavLink href="#" to="/following">{ t('following') }</NavLink>
                                        </NavItem> */}
                                        {/* <NavItem>
                                            <NavLink href="#" to="/subscriptions">{ t('subscriptions') }</NavLink>
                                        </NavItem> */}
                                        {/* <NavItem>
                                            <NavLink href="#" to="/my_boards">{ t('yourBoard') }</NavLink>
                                        </NavItem> */}
                                        {/* <NavItem>
                                            <NavLink href="#" to="/new_board">{ t('createBoard') }</NavLink>
                                        </NavItem> */}
                                        <NavItem className="nav-item-header">
                                            My Account
                                        </NavItem>
                                        {/* <NavItem>
                                            <NavLink href="#" to={`/u/${user_details.username}`}>
                                                { t('viewProfile') }
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink href="#" to="/settings">
                                                { t('accSetting') }
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink href="#" to="feedback">
                                                { t('sendFeedback') }
                                            </NavLink>
                                        </NavItem> */}
                                        <NavItem>
                                            <NavLink href="#" onClick={() => {
                                                props.logout();
                                                history.push('/login')
                                            }}>
                                                Signout
                                            </NavLink>
                                        </NavItem>
                                    </Nav>
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>
                        </div>

                        <div className="widget-content-left  ml-3 header-user-info">
                            <div className="widget-heading">
                                <div 
                                    className="widget-heading"
                                    style={{ textDecoration: "none", color: 'white' }}>
                                    { user_details.username }
                                </div>
                            </div>
                            {/* <div className="widget-subheading">
                                VP People Manager
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

function mapDispatch(dispatch) {
    return {
        userLogin: (credentials) => dispatch(userLogin(credentials))
    }
}

export default connect(
    null, 
    (dispatch) => ({ 
        logout: () => dispatch(actions.userLogout()), 
        getCurrentUser: () => dispatch(actions.getCurrentUser())  
    })
)(UserBox);
