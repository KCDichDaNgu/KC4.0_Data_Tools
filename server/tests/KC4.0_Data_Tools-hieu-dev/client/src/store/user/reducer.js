import { 
    USER_LOGIN_SUCCESS,
    USER_LOGIN_FAILURE,
    TOKEN_REFRESH_SUCCESS,
    TOKEN_REFRESH_FAILURE,
    GET_CURRENT_USER_SUCCESS,
    USER_LOGOUT
} from './type';
import { setExpireDate } from '../../utils/auth'

export const UserReducer = (state = {}, action = {}) => {
    
    switch (action.type) {
        case GET_CURRENT_USER_SUCCESS:
            return {
                ...state,
                profile: action.payload.response
            }
        case USER_LOGIN_SUCCESS:
            return {
                ...state,
                auth_info: {
                    access_token: action.payload.response.access_token,
                    expireDate: setExpireDate(action.payload.response.expires_in),
                    refresh_token: action.payload.response.refresh_token,
                    scope: action.payload.response.scope,
                    token_type: action.payload.response.token_type
                }
            }

        case USER_LOGIN_FAILURE:
            return {};

        case USER_LOGOUT:
            return {
                auth_info: {}
            }

        case TOKEN_REFRESH_SUCCESS:
            return {
                auth_info: {
                    ...state,
                    access_token: action.payload.response.access_token,
                    expireDate: setExpireDate(action.payload.response.expires_in),
                    refresh_token: action.payload.response.refresh_token,
                    scope: action.payload.response.scope,
                    token_type: action.payload.response.token_type
                }
            }
        case TOKEN_REFRESH_FAILURE:
            return {};
            
        default:
            return state;
    }
}
