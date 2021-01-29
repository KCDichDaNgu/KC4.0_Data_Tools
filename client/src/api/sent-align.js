import { customAxios } from '../utils/customAxios';

const sent_align_km_api = process.env.REACT_APP_SENT_ALIGN_KM_API

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
    }
};
