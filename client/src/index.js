import React from "react";
import ReactDOM from "react-dom";

import 'react-responsive-tabs/styles.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "jquery/dist/jquery.slim.min.js";
import "popper.js/dist/popper.min.js";
import "bootstrap/dist/js/bootstrap.min.js";
import '../public/styles/base.scss';
import '../public/styles2/sidebar.css';
import '../public/styles2/custom.css';

import {I18nextProvider} from 'react-i18next';
import i18next from 'i18next';
import common_vi from "./translations/vi/common.json";
import common_en from "./translations/en/common.json";

import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { unregister } from "./serviceWorker";

i18next.init({
    interpolation: { escapeValue: false },  // React already does escaping
    lng: 'vi',                              // language to use
    resources: {
        en: {
            common: common_en               // 'common' is our custom namespace
        },
        vi: {
            common: common_vi
        },
    },
});

const rootElement = document.getElementById('root');

const renderApp = Component => {

    ReactDOM.render(
        <I18nextProvider i18n={ i18next }>
            <BrowserRouter>
                <Component />
            </BrowserRouter>,
        </I18nextProvider>,
        rootElement
    );
}

if (module.hot) {

    module.hot.accept('./App', () => {

        const App = require('./App').default;

        renderApp(App);
    });
  }

renderApp(App);

unregister();
