import { customAxios } from '../../utils/custom-axios';
import qs from 'querystring';

const server_endpoint = process.env.REACT_APP_SERVER_ENDPOINT;

export default {

    create: (data) =>
        customAxios({
            method: 'post',
            url: `${server_endpoint}/api/admin/domain/`,
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
            url: `${server_endpoint}/api/admin/domain/${data.id}`,
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
            url: `${server_endpoint}/api/admin/domain/${id}`,
        }).then(res => {
            return res.data;
        }),

    search: (data) => 
        customAxios({
            method: 'post',
            url: `${server_endpoint}/api/admin/domain/search`,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => {
            return res.data;
        }),

    crawl: (data) => 
        customAxios({
            method: 'post',
            url: `${server_endpoint}/api/admin/domain/crawl`,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        }),

    checkStatusBitextor: (domain_id) => 
        customAxios({
            method: 'get',
            url: `${server_endpoint}/api/admin/domain/check_status_bitextor/${domain_id}`
        })
    
};
