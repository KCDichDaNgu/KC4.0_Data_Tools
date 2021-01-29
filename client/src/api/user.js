import { customAxios } from "../utils/custom-axios";
import axios from 'axios'
import qs from 'querystring';

const server_endpoint = process.env.REACT_APP_SERVER_ENDPOINT;

const toUnicode = (str) => {
	return str.split('').map(function (value, index, array) {
		var temp = value.charCodeAt(0).toString(16).toUpperCase();
		if (temp.length > 2) {
			return '\\u' + temp;
		}
		return value;
	}).join('');
}

const toBase64 = (str) => {
    return window.btoa(str)
}

export default {

    login: credentials => axios({
        method: 'post',
        url: `${server_endpoint}/api/auth/oauth2/token`,
        data: qs.stringify({
            grant_type: 'password',
            username: credentials.username,
            password: credentials.password,
            scope: 'profile'
        }),
        headers: {
            Authorization: `Basic ${toUnicode(toBase64('12345678:12345678'))}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).
    then(res => { return res.data; }),

    getNewAccessToken: token => axios({
        method: 'post',
        url: `${server_endpoint}/api/auth/oauth2/token`,
        data: qs.stringify({
            grant_type: 'refresh_token',
            refresh_token: token,
            scope: 'profile'
        })
    }).
    then(res => { return res.data; }),

    revokeToken: token => axios({
        method: 'post',
        url: `${server_endpoint}/api/auth/oauth2/revoke`,
        data: `token=${token}`,
        headers: {
            Authorization: `Basic ${toUnicode(toBase64('12345678:12345678'))}`
        }
    }).
    then (res => { return res.data; }),

    currentUser: () => customAxios({
        method: 'get',
        url: `${server_endpoint}/api/auth/me`,
        data: `scope=profile`,
    }).then(res => { return res.data.data; })
}
