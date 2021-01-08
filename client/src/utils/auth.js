import { clonedStore } from '../store';

const setExpireDate = (expires_in) => {

    const now = new Date();

    return now.getTime() + expires_in * 1000
}

const isTokenExpiration = (expireDate) => {
    
    const now = new Date();

    let timeleft = (expireDate - now.getTime()) / 1000;
    
    return timeleft < 5
}

const isAuthenticatedUser = () => {

    let auth_info = clonedStore.getState().User.auth_info;
    let access_token = null;
    let expireDate = null;
    
    if (auth_info && auth_info.access_token) {
        access_token = auth_info.access_token;
        expireDate = auth_info.expireDate;
    }
    
    return access_token != null && !isTokenExpiration(expireDate)
}

const isAdmin = () => {

    let profile = clonedStore.getState().User.profile;

    if (typeof profile !== 'undefined') return isAuthenticatedUser() && profile.roles.includes('admin');

    return false
}

export { 
    setExpireDate, 
    isTokenExpiration, 
    isAuthenticatedUser,
    isAdmin
}
