import React, { Fragment, useState, useEffect } from 'react';

import { 
    UncontrolledButtonDropdown, 
    DropdownToggle,
    DropdownMenu,
    Nav,
    NavItem,
    NavLink
} from 'reactstrap'

import avatar from '../../../../../public/images/avatars/avatar.jpg';
import { clonedStore } from '../../../../store';

import { userLogout } from '../../../../store/user/action';

import { asyncDispatch } from '../../../../store';

import watch from 'redux-watch';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';

import { useMountedState } from 'react-use';

const UserBox = () => {
    
    const [userDetail, setUserDetail] = useState(clonedStore.getState().User.profile || {});

    const profileWatcher = watch(clonedStore.getState, 'User.profile');

    const dispatch = useDispatch();
    const history = useHistory();
    const isMounted = useMountedState();

    useEffect(() => {

        clonedStore.subscribe(
            profileWatcher((newVal, oldVal, objectPath) => {
                if (isMounted()) setUserDetail(newVal || {})
            })
        );

    }, []);

    const logout = async () => {
        await asyncDispatch(dispatch, userLogout());

        history.push('/login')
    }

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
                                        width={ 42 } 
                                        className="rounded-circle" 
                                        src={ userDetail.profile_picture || avatar } alt=""
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
                                            <NavLink href="#" to={`/u/${userDetail.username}`}>
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
                                            <NavLink href="#" onClick={async () => { 
                                                await logout()
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
                                    { userDetail.username }
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

export default UserBox;
