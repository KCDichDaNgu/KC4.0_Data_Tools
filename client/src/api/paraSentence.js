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
    axios({
      method: "get",
      url: `${server_endpoint}/api/v1/${module_api}/list_option_field`,
    }),

  getSentences: (params) => 
    axios({
      method: "get",
      url: `${server_endpoint}/api/v1/${module_api}/${convertParamsToUrl(params)}`,
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
    return `${server_endpoint}/api/v1/${module_api}/import_from_file`
  } 
};
