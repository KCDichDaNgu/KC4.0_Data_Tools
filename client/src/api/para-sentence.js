import { customAxios } from "../utils/custom-axios";
import axios from "axios";
import qs from "querystring";

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
	getOptions: () =>
		customAxios({
			method: 'get',
			url: `${server_endpoint}/api/para-sentence/list-option-field`,
		}),

	getSentences: (data) =>
        customAxios({
            method: 'get',
            url: `${server_endpoint}/api/para-sentence/${convertParamsToUrl(data)}`,
            headers: {
                'Content-Type': 'application/json',
            },
        }),

	updateParaSentence: (id, params) =>
		customAxios({
            method: 'put',
            url: `${server_endpoint}/api/para-sentence/${id}`,
            data: params
		}),
		
	importByUser: (data) => {
		return customAxios({
            method: 'post',
			url: `${server_endpoint}/api/para-sentence/import-by-user`,
			data: data,
            headers: {
				'Content-Type': 'application/json',
			}
        })
	},

	importFromFile: (data) => {
		const formData = new FormData();
		
		formData.append('file', data.file);
		formData.append('dataFieldId', data.dataFieldId);
		formData.append('lang1', data.lang1);
		formData.append('lang2', data.lang2);
		
		return customAxios({
            method: 'post',
			url: `${server_endpoint}/api/para-sentence/import-from-file`,
			data: formData,
            headers: {
				'content-type': 'multipart/form-data'
			}
        })
	}, 

	exportFile: (data) => 
		customAxios({
			method: 'get',
			url: `${server_endpoint}/api/para-sentence/export`,
			params: data,
			responseType: 'blob'
		}),

	deleteSentencesByIds: data => 
		customAxios({
			method: "post",
			url: `${server_endpoint}/api/para-sentence/detele-sentences`,
			data: data,
			headers: {
				'Content-Type': 'application/json',
			}
		}),
	
	deleteAllSentences: data => 
		customAxios({
			method: "post",
			url: `${server_endpoint}/api/para-sentence/detele-all-sentences`,
			data: data,
			headers: {
				'Content-Type': 'application/json',
			}
		}),
};
