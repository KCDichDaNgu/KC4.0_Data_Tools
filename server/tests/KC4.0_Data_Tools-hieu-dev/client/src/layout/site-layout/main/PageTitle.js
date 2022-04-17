import React, {Component} from 'react';
import {connect} from 'react-redux';
import cx from 'classnames';

class PageTitle extends Component {

    render() {
        let {
            enablePageTitleIcon,
            enablePageTitleSubheading,
            heading,
            icon,
            subheading,
            customComponent
        } = this.props;

        return (

            <div className="app-page-title">
                <div className="page-title-wrapper">
                    <div className="page-title-heading">
                        <div
                            className={cx("page-title-icon", {'d-none': !enablePageTitleIcon})}>
                            <i className={icon}/>
                        </div>
                        <div>
                            {heading}
                            <div
                                className={cx("page-title-subheading", {'d-none': !enablePageTitleSubheading})}>
                                {subheading}
                            </div>
                        </div>
                    </div>
                    <div className="page-title-actions">
                        {/* <TitleComponent2/> */}
                        { customComponent }
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    enablePageTitleIcon: state.ThemeOption.enablePageTitleIcon,
    enablePageTitleSubheading: state.ThemeOption.enablePageTitleSubheading,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(PageTitle);