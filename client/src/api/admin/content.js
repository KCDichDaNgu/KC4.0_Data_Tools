import { customAxios } from "../../utils/customAxios";

const server_endpoint = process.env.REACT_APP_SERVER_ENDPOINT;

export default {

    getDownloadLink: (data) => customAxios({
        method: 'get',
        url: `${server_endpoint}/api/admin/content/get-download-link`,
        params: {
            modelName: data.modelName
        }
    }).
    then(res => { return res.data; }),
}
