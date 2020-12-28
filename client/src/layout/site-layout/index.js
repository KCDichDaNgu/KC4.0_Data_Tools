import React from 'react';
import AppMain from './main';
import ResizeDetector from 'react-resize-detector';
import cx from 'classnames';
import { connect } from "react-redux";

class SiteLayout extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            closedSmallerSidebar: false,
            width: undefined
        };
    }

    onResize = (width) => this.setState({ width });

    render() {

        const { width } = this.state;

        let {
            colorScheme,
            enableFixedHeader,
            enableFixedSidebar,
            enableFixedFooter,
            enableClosedSidebar,
            closedSmallerSidebar,
            enableMobileMenu,
            enablePageTabsAlt,
        } = this.props;

        return (
            <React.Fragment>
                <div className={cx(
                    "app-container app-theme-" + colorScheme,
                    { 'fixed-header': enableFixedHeader },
                    { 'fixed-sidebar': enableFixedSidebar || width < 1250 },
                    { 'fixed-footer': enableFixedFooter },
                    { 'closed-sidebar': enableClosedSidebar || width < 1250 },
                    { 'closed-sidebar-mobile': closedSmallerSidebar || width < 1250 },
                    { 'sidebar-mobile-open': enableMobileMenu },
                )}>
                    <AppMain>
                        { this.props.children }
                    </AppMain>
                    <ResizeDetector handleWidth onResize={ this.onResize } />
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProp = state => ({
    colorScheme: state.ThemeOption.colorScheme,
    enableFixedHeader: state.ThemeOption.enableFixedHeader,
    enableMobileMenu: state.ThemeOption.enableMobileMenu,
    enableFixedFooter: state.ThemeOption.enableFixedFooter,
    enableFixedSidebar: state.ThemeOption.enableFixedSidebar,
    enableClosedSidebar: state.ThemeOption.enableClosedSidebar,
    enablePageTabsAlt: state.ThemeOption.enablePageTabsAlt,
});

export default connect(mapStateToProp)(SiteLayout);
