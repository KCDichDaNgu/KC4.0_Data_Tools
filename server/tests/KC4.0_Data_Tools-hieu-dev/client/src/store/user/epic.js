import { of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { from } from 'rxjs';

import * as actions from './action';
import * as types from './type';

import userAPI from '../../api/user';

export const userLoginEpic = (action$, state$) =>

    action$.pipe(

        ofType(types.USER_LOGIN),
        switchMap((action) => 
            from(userAPI.login(action.payload.credentials)).
            pipe(
                map((response) => {
                    return actions.userLoginSuccess(response);
                }),
                catchError((error) => of(actions.userLoginFailure(error)) )
            ) 
        )
    )

export const getCurrentUserEpic = (action$, state$) =>

    action$.pipe(

        ofType(types.GET_CURRENT_USER),
        switchMap((action) => 
            from(userAPI.currentUser()).
            pipe(
                map((response) => {
                    return actions.getCurrentUserSuccess(response);
                }),
                catchError((error) => of(actions.getCurrentUserFailure(error)) )
            ) 
        )
    )
    
export const userResetPasswordEpic = (action$, state$) =>

    action$.pipe(
        ofType(types.USER_RESET_PASSWORD),
        switchMap((action) => 
            
            from(userAPI.resetPassword(action.payload.email)).
            pipe(
                map((response) => {
                    return actions.userResetPasswordSuccess(response);
                }),
                catchError((error) => of(actions.userResetPasswordFailure(error)) )
            )
        )
    )
