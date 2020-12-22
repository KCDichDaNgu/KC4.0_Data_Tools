import { customAxios } from "../utils/customAxios";

const demo3_endpoint = process.env.REACT_APP_DEMO3_ENDPOINT;
const demo4_endpoint = process.env.REACT_APP_DEMO4_ENDPOINT;

export default {

    paraphase: {
        getNewCandidates: data => {
        
            return customAxios({
                method: 'post',
                url: `${demo3_endpoint}/demo3-paraphrase`,
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => { return res.data; })
        }
    },

    // {
    //     "department": "Clothing",
    //     "category": "Women",
    //     "product": "Skirts",
    //     "number_of_candidates": 5,
    //     "only_attribute": "True",
    //     "attributes": [
    //       {
    //         "name": "brand",
    //         "value": "Time And Tru",
    //         "order": 1
    //       },
    //       {
    //         "name": "color",
    //         "value": "black",
    //         "order": 2
    //       }
    //     ]
    //   }

    wallmart: {
        getNewCandidates: data => {
        
            return customAxios({
                method: 'post',
                url: `${demo4_endpoint}/demo4-api`,
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => { return res.data; })
        }
    }
}
