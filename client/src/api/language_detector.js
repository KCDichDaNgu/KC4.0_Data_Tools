import { customAxios } from '../utils/custom-axios';

const lang_detector_api = process.env.REACT_APP_LANG_DETECTOR_API

export default {

    detectLanguage: (text) => {
        return customAxios({
            method: 'post',
            url: `${lang_detector_api}/detect_lang`,
            data: {
                data: text
            },
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
};
