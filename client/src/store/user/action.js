import { 
    USER_LOGIN, 
    USER_LOGIN_SUCCESS,
    USER_LOGIN_FAILURE,
    USER_LOGOUT,
    USER_LOGOUT_SUCCESS,
    USER_LOGOUT_FAILURE,
    USER_RESET_PASSWORD,
    USER_RESET_PASSWORD_SUCCESS,
    USER_RESET_PASSWORD_FAILURE,
    TOKEN_REFRESH_SUCCESS,
    TOKEN_REFRESH_FAILURE,
    GET_CURRENT_USER,
    GET_CURRENT_USER_SUCCESS,
    GET_CURRENT_USER_FAILURE,
} from './type';

export const userLogin = credentials => ({
    type: USER_LOGIN,
    payload: { credentials }
});

export const userLoginSuccess = (response) => ({
    type: USER_LOGIN_SUCCESS,
    payload: { response },
})

export const tokenRefreshSuccess = (response) => ({
    type: TOKEN_REFRESH_SUCCESS,
    payload: { response }
})

export const tokenRefreshFailure = (error) => ({
    type: TOKEN_REFRESH_FAILURE,
    payload: { error }
})

export const userLoginFailure = (error) => ({
    type: USER_LOGIN_FAILURE,
    payload: { error },
})

export const userLogout = () => ({
    type: USER_LOGOUT
});

export const userResetPassword = () => ({
    type: USER_RESET_PASSWORD
});

export const userResetPasswordSuccess = (response) => ({
    type: USER_RESET_PASSWORD_SUCCESS,
    payload: { response },
})
  
export const userResetPasswordFailure = (error) => ({
    type: USER_RESET_PASSWORD_FAILURE,
    payload: { error },
})

export const getCurrentUser = () => ({
    type: GET_CURRENT_USER
});

export const getCurrentUserSuccess = (response) => ({
    type: GET_CURRENT_USER_SUCCESS,
    payload: { response },
})
  
export const getCurrentUserFailure = (error) => ({
    type: GET_CURRENT_USER_FAILURE,
    payload: { error },
})
