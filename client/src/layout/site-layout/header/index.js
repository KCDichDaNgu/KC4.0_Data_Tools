import React, {Fragment} from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';

import { TransitionGroup, CSSTransition } from 'react-transition-group';

import HeaderLogo from '../logo';
import PropTypes from 'prop-types';

import { Link } from "react-router-dom";

import {
    DropdownToggle, DropdownMenu,
    Nav, Button, NavItem, NavLink,
    UncontrolledTooltip, UncontrolledButtonDropdown
} from 'reactstrap';

import SearchBox from './Components/SearchBox';
import UserBox from './Components/UserBox';
import * as actions from "../../../store/user/action";
import { isAuthenticatedUser } from '../../../utils/auth';

const prefixLangToFlagIcon = {
    en: 'us',
    vi: 'vn'
};

const Header = ( props ) => {
    
    let {
        headerBackgroundColor,
        enableMobileMenuSmall,
        enableHeaderShadow
    } = props;
    
    return (
        <Fragment>

            <TransitionGroup
                component="div"
                className={ cx("app-header", headerBackgroundColor, { 'header-shadow': enableHeaderShadow })}
                appear={ true }
                enter={ false }
                exit={ false }>

                <CSSTransition
                    classNames="HeaderAnimation"
                    timeout={{ enter: 1500 }}>

                    <>
                        <HeaderLogo/>

                        <div className={cx(
                            "app-header__content",
                            { 'header-mobile-open': enableMobileMenuSmall },
                        )}>
                            <div className="app-header-left">
                                {/* <SearchBox/>
                                <ul className="header-menu nav">
                                    <li className="nav-item">
                                        <Link href="/">
                                            <a className="nav-link">
                                                <i 
                                                    style={{ fontSize: "1.5rem" }} 
                                                    className="pe-7s-home mr-2"> 
                                                </i>
                                                { t('TopNav.home') }
                                            </a>
                                        </Link>
                                    </li>
                                    <li className="btn-group nav-item">
                                        <Link href="/trending">
                                            <a className="nav-link">
                                                <i 
                                                    style={{ fontSize: "1.5rem" }} 
                                                    className="pe-7s-rocket mr-2"> 
                                                </i>
                                                { t('TopNav.trend') }
                                            </a>
                                        </Link>
                                    </li>
                                    <li className="dropdown nav-item">
                                        <Link href="/boards">
                                            <a className="nav-link">
                                                <i 
                                                    style={{ fontSize: "1.5rem" }} 
                                                    className="pe-7s-gleam mr-2"> 
                                                </i>
                                                { t('TopNav.board') }
                                            </a> 
                                        </Link>
                                    </li>
                                    <li className="dropdown nav-item">
                                        <Link href="/apps">
                                            <a className="nav-link">
                                                <i 
                                                    style={{ fontSize: "1.5rem" }} 
                                                    className="pe-7s-plugin mr-2"> 
                                                </i>
                                                { t('TopNav.app') }
                                            </a> 
                                        </Link>
                                    </li>
                                </ul> */}
                            </div>
                            <div className="app-header-right">
                                {/* <UncontrolledButtonDropdown>
                                    <DropdownToggle color="link" className="p-0">
                                        <span 
                                            style={{ textAlign: 'center' }} 
                                            className="icon-wrapper icon-wrapper-alt rounded-circle">
                                            <span className="icon-wrapper-bg bg-focus"></span>
                                            <span 
                                                className={
                                                    "language-icon flag-icon " +  
                                                    `flag-icon-${ prefixLangToFlagIcon[ translate.getCurrentLang() ] }`
                                                }> 
                                            </span>
                                        </span>
                                    </DropdownToggle>
                                    
                                    <DropdownMenu right className="rm-pointers dropdown-menu-lg">
                                        <Nav vertical>
                                            <NavItem style={{ color: "#3f6ad8" }} className="nav-item-header">
                                                { t('TopNav.language') }
                                            </NavItem>
                                            <NavItem>
                                                <NavLink 
                                                    href="#"
                                                    onClick={ () => changeLanguage('en') }>
                                                    <span 
                                                        style={{ 
                                                            textAlign: 'center', 
                                                            height: "auto", 
                                                            width: "auto",
                                                            marginRight: "16px",
                                                            marginLeft: 0
                                                        }} 
                                                        className="icon-wrapper icon-wrapper-alt">
                                                        <span className="icon-wrapper-bg bg-focus"></span>
                                                        <span 
                                                            style={{ height: "32px", width: "32px" }} 
                                                            className="flag-icon flag-icon-us">    
                                                        </span>
                                                    </span>
                                                    <span>{ t('Language.en') }</span>
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink 
                                                    href="#"
                                                    onClick={ () => changeLanguage('vi') }>
                                                    <span 
                                                        style={{ 
                                                            textAlign: 'center', 
                                                            height: "auto", 
                                                            width: "auto",
                                                            marginRight: "16px",
                                                            marginLeft: 0
                                                        }} 
                                                        className="icon-wrapper icon-wrapper-alt">
                                                        <span className="icon-wrapper-bg bg-focus"></span>
                                                        <span 
                                                            style={{ height: "32px", width: "32px" }} 
                                                            className="flag-icon flag-icon-vn">    
                                                        </span>
                                                    </span>
                                                    <span>{ t('Language.vi') }</span>
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                    </DropdownMenu>
                                </UncontrolledButtonDropdown> */}
                                {
                                    isAuthenticatedUser() ? (
                                        <UserBox/>
                                    ) : (
                                        <React.Fragment>
                                            <div className="header-btn-lg pr-0">
                                                <Link 
                                                    to="/login" 
                                                    className="btn btn-primary btn-md login_btn mr-2">
                                                    Login
                                                </Link>
                                    
                                                {/* <Link href="/signup">
                                                    <a className="btn btn-success btn-md signup_btn">
                                                        { t('signup') }
                                                    </a>
                                                </Link> */}
                                            </div>
                                        </React.Fragment>
                                    )
                                }
                            </div>
                        </div>
                    </>
                </CSSTransition>

                
            </TransitionGroup>
        </Fragment>
    );
}

const mapStateToProps = state => ({
    enableHeaderShadow: state.ThemeOption.enableHeaderShadow,
    closedSmallerSidebar: state.ThemeOption.closedSmallerSidebar,
    headerBackgroundColor: state.ThemeOption.headerBackgroundColor,
    enableMobileMenuSmall: state.ThemeOption.enableMobileMenuSmall
});

Header.getInitialProps = async () => ({
    namespacesRequired: [ 'common' ],
})

export default connect(mapStateToProps, { logout: actions.userLogout })(Header);
