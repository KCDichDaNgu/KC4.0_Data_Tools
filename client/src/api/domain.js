import { customAxios } from '../utils/customAxios';
import qs from 'querystring';

const server_endpoint = process.env.REACT_APP_SERVER_ENDPOINT;

export default {

    create: (data) =>
        customAxios({
            method: 'post',
            url: `${server_endpoint}/api/domain/`,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => {
            return res.data;
        }),

    update: (data) =>
        customAxios({
            method: 'put',
            url: `${server_endpoint}/api/domain/${data.id}`,
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
            url: `${server_endpoint}/api/domain/${id}`,
        }).then(res => {
            return res.data;
        }),

    search: (data) =>
        customAxios({
            method: 'post',
            url: `${server_endpoint}/api/domain/search`,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => {
            return res.data;
        }),
};
