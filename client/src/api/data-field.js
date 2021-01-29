import { customAxios } from '../utils/custom-axios';
import qs from 'querystring';

const server_endpoint = process.env.REACT_APP_SERVER_ENDPOINT;

export default {

    search: (data) => 
        customAxios({
            method: 'post',
            url: `${server_endpoint}/api/data-field/search`,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => {
            return res.data;
        })
};
