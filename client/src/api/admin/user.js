import { customAxios } from '../../utils/custom-axios';
import qs from 'querystring';

const server_endpoint = process.env.REACT_APP_SERVER_ENDPOINT;

export default {

    create: (data) =>
        customAxios({
            method: 'post',
            url: `${server_endpoint}/api/admin/user/`,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => {
            return res.data;
        }),

    update: (id, data) =>
        customAxios({
            method: 'put',
            url: `${server_endpoint}/api/admin/user/${id}`,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => {
            return res.data;
        }),

    delete: (id) =>
        customAxios({
            method: 'delete',
            url: `${server_endpoint}/api/admin/user/${id}`,
        }).then(res => {
            return res.data;
        }),

    search: (data) =>
        customAxios({
            method: 'post',
            url: `${server_endpoint}/api/admin/user/search`,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => {
            return res.data;
        }),
};
