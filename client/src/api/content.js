import { customAxios } from "../utils/customAxios";
import qs from 'querystring';

const server_endpoint = process.env.REACT_APP_SERVER_ENDPOINT;

export default {

    create: data => customAxios({
        method: 'post',
        url: `${server_endpoint}/api/content`,
        data: data,
        headers: {
            'Content-Type': 'application/json'
        }
    }).
    then(res => { return res.data; }),

    update: data => customAxios({
        method: 'put',
        url: `${server_endpoint}/api/content/${data.id}`,
        data: data,
        headers: {
            'Content-Type': 'application/json'
        }
    }).
    then(res => { return res.data; }),

    delete: id => customAxios({
        method: 'delete',
        url: `${server_endpoint}/api/content/${id}`,
    }).
    then(res => { return res.data; }),

    index: data => customAxios({
        method: 'get',
        url: `${server_endpoint}/api/content`,
        params: {
            q__modelNames: data.q.modelNames.join(','),
            pagination__page: data.pagination.page || 1,
            pagination__perPage: data.pagination.perPage || 15,
        },
        headers: {
            'Content-Type': 'application/json'
        }
    }).
    then(res => { return res.data; })
}
