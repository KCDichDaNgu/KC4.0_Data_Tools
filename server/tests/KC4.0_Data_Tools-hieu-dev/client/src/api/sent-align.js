import { customAxios } from '../utils/custom-axios';

const sent_align_km_api = process.env.REACT_APP_SENT_ALIGN_KM_API
const sent_align_lo_api = process.env.REACT_APP_SENT_ALIGN_LO_API
const sent_align_zh_api = process.env.REACT_APP_SENT_ALIGN_ZH_API

export default {

    create: (data) => {
        
        if (data.lang2 == 'km') {
        
            return customAxios({
                method: 'post',
                url: `${sent_align_km_api}/sen_align`,
                data: {
                    lg: data.lang2,
                    doc_source: data.text1,
                    doc_target: data.text2
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(res => {
                return res.data;
            })
        }

        if (data.lang2 == 'lo') {

            return customAxios({
                method: 'post',
                url: `${sent_align_lo_api}/scores/sentences`,
                data: {
                    source: data.text1,
                    target: data.text2,
                    type: 'vl',
                    sort: true
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(res => {
                return res.data;
            })
        }

        if (data.lang2 == 'zh') {

            return customAxios({
                method: 'post',
                url: `${sent_align_zh_api}/sentences_align`,
                data: {
                    source: data.text1,
                    target: data.text2,
                    type: 'vi-zh'
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(res => {
                return res.data;
            })
        }
    }
};
