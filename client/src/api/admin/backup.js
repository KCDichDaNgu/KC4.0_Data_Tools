import { customAxios } from '../../utils/customAxios';
import qs from 'querystring';

const server_endpoint = process.env.REACT_APP_SERVER_ENDPOINT;

export default {

    create: (data) =>
        customAxios({
            method: 'post',
            url: `${server_endpoint}/api/admin/manage-backup/`,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        }),

    search: (params) =>
        customAxios({
            method: 'get',
            url: `${server_endpoint}/api/admin/manage-backup/`,
            params: params,
            headers: {
                'Content-Type': 'application/json',
            },
        }),

    delete: (backupId) => 
        customAxios({
            method: 'delete',
            url: `${server_endpoint}/api/admin/manage-backup/${backupId}`,
            headers: {
                'Content-Type': 'application/json',
            },
        }),

    update: (backupId, data) => 
        customAxios({
            method: 'put',
            url: `${server_endpoint}/api/admin/manage-backup/${backupId}`,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        }),

    downloadBackupURL: (type, hash_name) => 
        `${server_endpoint}/public/backups/${type}/${hash_name}`,
};
