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


import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { unregister } from "./serviceWorker";

const rootElement = document.getElementById('root');

const renderApp = Component => {

    ReactDOM.render(
        <BrowserRouter>
            <Component />
        </BrowserRouter>,
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
