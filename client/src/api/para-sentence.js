import { customAxios } from "../utils/customAxios";
import axios from "axios";
import qs from "querystring";

const server_endpoint = process.env.REACT_APP_SERVER_ENDPOINT;
const module_api = "para_sentence";

const toUnicode = (str) => {
	return str
		.split("")
		.map(function (value, index, array) {
			var temp = value.charCodeAt(0).toString(16).toUpperCase();
			if (temp.length > 2) {
				return "\\u" + temp;
			}
			return value;
		})
		.join("");
};

const toBase64 = (str) => {
	return window.btoa(str);
};

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
			url: `${server_endpoint}/api/${module_api}/list-option-field`,
		}),

	getSentences: (data) =>
        customAxios({
            method: 'get',
            url: `${server_endpoint}/api/${module_api}/${convertParamsToUrl(data)}`,
            headers: {
                'Content-Type': 'application/json',
            },
        }),

	updateParaSentence: (id, params) =>
		customAxios({
            method: 'put',
            url: `${server_endpoint}/api/${module_api}/${id}`,
            data: params
        }),

	importFromFile: (data) => {
		const formData = new FormData();
		
		formData.append('file', data.file);
		formData.append('dataFieldId', data.dataFieldId);
		formData.append('lang1', data.lang1);
		formData.append('lang2', data.lang2);
		
		return customAxios({
            method: 'post',
			url: `${server_endpoint}/api/${module_api}/import-from-file`,
			data: formData,
            headers: {
				'content-type': 'multipart/form-data'
			}
        })
	}, 

	exportFile: (data) => 
		customAxios({
			method: 'get',
			url: `${server_endpoint}/api/${module_api}/export`,
			params: data,
			responseType: 'blob'
		}),
};
