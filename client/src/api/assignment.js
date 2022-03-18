import { customAxios } from '../utils/custom-axios';
import qs from 'querystring';

const server_endpoint = process.env.REACT_APP_SERVER_ENDPOINT;

export default {

    owner: () =>
        customAxios({
            method: 'get',
            url: `${server_endpoint}/api/assignment/current-user`,
        }).then(res => {
            return res.data;
        }),
};
