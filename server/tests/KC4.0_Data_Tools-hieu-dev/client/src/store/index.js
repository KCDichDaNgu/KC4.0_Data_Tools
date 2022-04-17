import { useMemo } from 'react';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic } from './epics';
import { rootReducer } from './reducers';
import { persistReducer } from 'redux-persist';

import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

let store

const persistConfig = {
    key: 'root',
    storage: storage,
    stateReconciler: autoMergeLevel2,
    whitelist: [ 'User', 'ThemeOption' ]
};

const pReducer = persistReducer(persistConfig, rootReducer);

const initStore = (initialState = {}) => {
    const epicMiddleware = createEpicMiddleware();
    const logger = createLogger({ collapsed: true }); // log every action to see what's happening behind the scenes.
    const reduxMiddleware = applyMiddleware(epicMiddleware, logger);

    const store = createStore(pReducer, initialState, reduxMiddleware);

    epicMiddleware.run(rootEpic);

    return store;
}

const initializeStore = (preloadedState) => {

    let _store = store ?? initStore(preloadedState);

    // After navigating to a page with an initial Redux state, merge that state
    // with the current state in the store, and create a new store
    if (preloadedState && store) {

        _store = initStore({
            ...store.getState(),
            ...preloadedState,
        });
        // Reset the current store
        store = undefined;
    }

    // For SSG and SSR always create a new store
    if (typeof window === 'undefined') return _store;
    // Create the store once in the client
    if (!store) store = _store;

    return _store;
}

const asyncDispatch = (dispatch, callback) => {
    return new Promise((resolve, reject) => {
        dispatch(callback);
        resolve();
    })  
} 

const useStore = (initialState) => {
    const store = useMemo(() => initializeStore(initialState), [initialState])

    return store
};

const cloneStore = (store = null) => {
    if (store) clonedStore = store;
}

let clonedStore = null;

export {
    initializeStore,
    useStore,
    cloneStore,
    clonedStore,
    asyncDispatch
}
