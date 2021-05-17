import { method } from "lodash-es";
import { customAxios } from "../utils/custom-axios";

const server_endpoint = process.env.REACT_APP_SERVER_ENDPOINT;

const convertParamsToUrl = (params) => {
	let param = "";
	for (var key in params) {
		if (params[key] !== undefined) {
			if (param === "") param += "?";
			else param += "&";
			param += `${key}=${params[key]}`;
		}
	}
	return param;
}

export default {
    upload: data => {
        const formData = new FormData();
        data.files.forEach(file => {
            formData.append("file", file.originFileObj)
        });
        formData.append("source", data.source);
        formData.append("lang", data.lang)
        formData.append("data_field_id", data.dataFieldId)
        return customAxios({
            method: 'post',
			url: `${server_endpoint}/api/single-language-data/upload`,
			data: formData,
            headers: {
				'content-type': 'multipart/form-data'
			}
        })
    },
    get: data =>  customAxios({
        method: 'get',
        url: `${server_endpoint}/api/single-language-data${convertParamsToUrl(data)}`,
        headers: {
            'Content-Type': 'application/json',
        }
    }),
    deleteById: data => customAxios({
        method: 'post',
        url: `${server_endpoint}/api/single-language-data/delete-sentence`,
        headers: {
            'Content-Type': 'application/json',
        },
        data: data
    }),
    downloadFile: sentenceId => customAxios({
        method: 'get',
        url: `${server_endpoint}/api/single-language-data/download/${sentenceId}`,
        responseType: 'blob'
    }),
    exportCorpus: data => customAxios({
        method: 'get',
        url: `${server_endpoint}/api/single-language-data/export${convertParamsToUrl(data)}`,
        responseType: 'blob'
    }),
    getReport: data => customAxios({
        method: 'get',
        url: `${server_endpoint}/api/single-language-data/report${convertParamsToUrl(data)}`,
        headers: {
            'Content-Type': 'application/json',
        }
    }),
    getFieldReport: data => customAxios({
        method: 'get',
        url: `${server_endpoint}/api/single-language-data/field-report${convertParamsToUrl(data)}`,
        headers: {
            'Content-Type': 'application/json',
        }
    }),
}