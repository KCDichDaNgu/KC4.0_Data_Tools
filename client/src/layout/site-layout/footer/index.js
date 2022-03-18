import React, { Fragment } from 'react';

const AppFooter = () => {
    
    return (
        <Fragment>
            <div 
                className="app-footer"
                style={{
                    marginTop: '2rem'
                }}>
                <div className="app-footer__inner">
                    <div className="app-footer-left">
                        <ul className="nav">
                            <li className="nav-item">
                                <a href="#!" className="nav-link">
                                    Footer Link 1
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#!" className="nav-link">
                                    Footer Link 2
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="app-footer-right">
                        <ul className="nav">
                            <li className="nav-item">
                                <a href="#!" className="nav-link">
                                    Footer Link 3
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#!" className="nav-link">
                                    <div className="badge badge-success mr-1 ml-0">
                                        <small>NEW</small>
                                    </div>
                                    Footer Link 4
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default AppFooter;