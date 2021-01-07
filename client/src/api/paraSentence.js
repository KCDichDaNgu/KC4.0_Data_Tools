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
			url: `${server_endpoint}/api/${module_api}/list_option_field`,
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

	revokeToken: (token) =>
		axios({
			method: "post",
			url: `${server_endpoint}/api/oauth/revoke`,
			data: `token=${token}`,
			headers: {
				Authorization: `Basic ${toUnicode(toBase64("12345678:12345678"))}`,
			},
		}).then((res) => {
			return res.data;
		}),

	importFromFileUrl: () => {
		return `${server_endpoint}/api/${module_api}/import_from_file`
	},

	importFromFile: (onProgress, onSuccess, onError, file) => {
		const formData = new FormData();
		formData.append('file', file);

		return customAxios({
            method: 'post',
			url: `${server_endpoint}/api/${module_api}/import_from_file`,
			data: formData,
            headers: {
				'content-type': 'multipart/form-data'
			},
			onUploadProgress: onProgress,
        }).then(res => onSuccess(res)).catch(res => onError(res));
	},
        
};
