import React, {Component, Fragment} from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';

import Nav from '../nav/vertical-nav-wrapper';

import { TransitionGroup, CSSTransition } from 'react-transition-group';
import PerfectScrollbar from 'react-perfect-scrollbar';
import HeaderLogo from '../logo';

import {
    setEnableMobileMenu
} from '../../../store/themeOption/action';

const isClient = () => { return typeof window !== 'undefined' }

class AppSidebar extends Component {

    state = {};

    toggleMobileSidebar = () => {
        let { enableMobileMenu, setEnableMobileMenu } = this.props;
        setEnableMobileMenu(!enableMobileMenu);
    }

    render() {
        let {
            backgroundColor,
            enableBackgroundImage,
            enableSidebarShadow,
            backgroundImage,
            backgroundImageOpacity,
        } = this.props;

        return (
            <Fragment>
                <div className="sidebar-mobile-overlay" onClick={this.toggleMobileSidebar}></div>

                <TransitionGroup
                    component="div"
                    className={cx("app-sidebar", backgroundColor, {'sidebar-shadow': enableSidebarShadow})}
                    appear={ true }
                    enter={ false }
                    exit={ false }>

                    <CSSTransition
                        classNames="SidebarAnimation"
                        timeout={{ enter: 1500 }}>

                        <>
                            <HeaderLogo/>
                            <PerfectScrollbar>
                                <div className="app-sidebar__inner">
                                    <Nav/>
                                </div>
                            </PerfectScrollbar>
                            <div
                                className={ cx("app-sidebar-bg", backgroundImageOpacity) }
                                style={{
                                    backgroundImage: enableBackgroundImage ? 'url(' + backgroundImage + ')' : null
                                }}>
                            </div>
                        </>
                    </CSSTransition>
                </TransitionGroup>
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    enableBackgroundImage: state.ThemeOption.enableBackgroundImage,
    enableSidebarShadow: state.ThemeOption.enableSidebarShadow,
    enableMobileMenu: state.ThemeOption.enableMobileMenu,
    backgroundColor: state.ThemeOption.backgroundColor,
    backgroundImage: state.ThemeOption.backgroundImage,
    backgroundImageOpacity: state.ThemeOption.backgroundImageOpacity,
});

const mapDispatchToProps = dispatch => ({

    setEnableMobileMenu: enable => dispatch(setEnableMobileMenu(enable)),

});

export default connect(mapStateToProps, mapDispatchToProps)(AppSidebar);