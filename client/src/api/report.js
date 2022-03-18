import { customAxios } from "../utils/custom-axios";

const server_endpoint = process.env.REACT_APP_SERVER_ENDPOINT;
const module_api = "report";

export default {
	getReport: (params) =>
        customAxios({
            method: 'get',
            url: `${server_endpoint}/api/${module_api}/`,
            params: params,
            headers: {
                'Content-Type': 'application/json',
            },
        }),

    getUnRatedCount: () =>
        customAxios({
            method: 'get',
            url: `${server_endpoint}/api/${module_api}/unrated-count`,
            headers: {
                'Content-Type': 'application/json',
            },
        }),
};
