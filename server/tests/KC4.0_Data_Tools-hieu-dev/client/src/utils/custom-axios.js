import axios from 'axios';
import { tokenRefreshSuccess, userLogout } from '../store/user/action';
import { isTokenExpiration } from '../utils/auth'
import userAPI from '../api/user';
import { clonedStore } from '../store';

const customAxios = axios.create();

let isGettingNewAccessToken = false;

// Request interceptor for API calls
customAxios.interceptors.request.use(

    async config => {

        let auth_info = clonedStore.getState().User.auth_info;
        
        if (auth_info && auth_info.access_token) {
            
            if (isTokenExpiration(auth_info.expireDate) && !isGettingNewAccessToken) {

                isGettingNewAccessToken = true;
                
                let response = await userAPI.getNewAccessToken(auth_info.refresh_token);

                clonedStore.dispatch(tokenRefreshSuccess(response));

                auth_info = clonedStore.getState().User.auth_info;
                
                config.headers['Authorization'] = `Bearer ${auth_info.access_token}`;

                isGettingNewAccessToken = false;
            }

            config.headers['Authorization'] = `Bearer ${auth_info.access_token}`;
        }

        await checkGettingAccessToken();
        
        return config; 
    },
    error => {
        Promise.reject(error)
    }
);

const checkGettingAccessToken = () => {

    return new Promise((resolve) => {

        let checkGettingAccessToken = setInterval(() => {

            if (!isGettingNewAccessToken) {
                
                resolve(isGettingNewAccessToken)

                clearInterval(checkGettingAccessToken);
            }
        }, 100)
    })
}


customAxios.interceptors.response.use(

    (response) => {
        return response
    },
    async (error) => {
        
        if (error?.response?.status == 401) {

            // let res = await userAPI.revokeToken()

            clonedStore.dispatch(userLogout())

            window.location.href = '/login'

            return
        }
        
        if (error?.response?.config?.data.includes('access_token')) {

            let auth_info = clonedStore.getState().User.auth_info;
        
            if (clonedStore.getState().User.auth_info && auth_info.access_token) {

                if (isTokenExpiration(auth_info.expireDate) && !isGettingNewAccessToken) {
                    
                    let response = userAPI.getNewAccessToken(auth_info.refresh_token);

                    clonedStore.dispatch(tokenRefreshSuccess(response));
                }
            }   
        }

        if (error?.response?.config?.data.includes('refresh_token')) {

            let res = userAPI.revokeToken()
            
            clonedStore.dispatch(userLogout())
            // window.location.href = '';
        }
    }

)

export { customAxios, clonedStore };
