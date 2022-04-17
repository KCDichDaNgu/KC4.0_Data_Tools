import { customAxios } from '../../utils/custom-axios';

const server_endpoint = process.env.REACT_APP_SERVER_ENDPOINT;

export default {

    update: (data) =>
        customAxios({
            method: 'put',
            url: `${server_endpoint}/api/admin/setting/`,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => {
            return res.data;
        }),

    get: () => 
        customAxios({
            method: 'get',
            url: `${server_endpoint}/api/admin/setting/`,
        }).then(res => {
            return res.data;
        })
};
