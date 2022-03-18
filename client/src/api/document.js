import { customAxios } from '../utils/custom-axios';
import qs from 'querystring';

const server_endpoint = process.env.REACT_APP_SERVER_ENDPOINT;

const convertParamsToUrl = (params) => {
	let param = "";
	for (var key in params) {
		if (params[key] !== "" && params[key] !== undefined) {
			if (param === "") param += "?";
			else param += "&";
			param += `${key}=${params[key]}`;
		}
	}
	return param;
}

export default {

    create: (data) =>
        customAxios({
            method: 'post',
            url: `${server_endpoint}/api/document/`,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => {
            return res.data;
        }),

    getDocuments: (data) =>
        customAxios({
            method: 'get',
            url: `${server_endpoint}/api/document/${convertParamsToUrl(data)}`,
            headers: {
                'Content-Type': 'application/json',
            },
        }),

    getOptions: () =>
		customAxios({
			method: 'get',
			url: `${server_endpoint}/api/document/list-option-field`,
        }),
        
    updateParaDocument: (id, params) =>
		customAxios({
            method: 'put',
            url: `${server_endpoint}/api/document/${id}`,
            data: params
        }),
    
    delete: (paraDocumentId) => 
        customAxios({
            method: 'delete',
            url: `${server_endpoint}/api/document/${paraDocumentId}`,
            headers: {
                'Content-Type': 'application/json',
            },
        }),

};
