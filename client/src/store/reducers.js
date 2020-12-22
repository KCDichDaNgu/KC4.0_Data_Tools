import { UserReducer } from './user/reducer';
import { ThemeOptionReducer } from './themeOption/reducer';

import { combineReducers } from 'redux';

export const rootReducer = combineReducers({
    User: UserReducer, 
    ThemeOption: ThemeOptionReducer, 
});
