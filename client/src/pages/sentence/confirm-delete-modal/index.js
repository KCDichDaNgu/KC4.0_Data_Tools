import './style.module.scss';
import React from 'react'
import {
    Modal
} from 'antd'

import { useTranslation } from 'react-i18next';
import paraSentenceAPI from '../../../api/para-sentence'
import { toast } from 'react-toastify';

const ConfirmDeleteModal = props => {
    const { t } = useTranslation(['common']);

    const {
        isVisible,
        setVisible,
        deleteData,
        reloadSentenceData,
        reloadPaginationParams,
        currentFilter,
        currentPagination
    } = props

    const handleOk = async () => {
        let response = await paraSentenceAPI.deleteSentencesByIds({ids: deleteData})
        if (response.status == 200 && response.data.code == 1){
            let currentPage = 0;
            console.log(currentPagination)
            if ((currentPagination.total_pages == currentPagination.current_page) && (currentPagination.total_items%currentPagination.page_size == deleteData.length || currentPagination.page_size == deleteData.length)){
                currentPage = currentPagination.current_page - 1
            } else {
                currentPage = currentPagination.current_page
            }
            if (currentPage > 0) {
                currentFilter.page = currentPage;
                let newSentenceData = await paraSentenceAPI.getSentences(currentFilter)
                reloadSentenceData(newSentenceData.data.data.para_sentences);
                reloadPaginationParams(newSentenceData.data.data.pagination);
            }
            setVisible(false)
            toast.success(t("sentencePage.deleteSuccess").replace('#', response.data.data), {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
            })
        } else {
            toast.error(t("sentencePage.deleteFail"), {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
            })
        }
    };

    const handleCancel = () => {
        setVisible(false);
    };
    return (
        <Modal
            title={t("sentencePage.deleteSentences")}
            centered={true}
            visible={isVisible}
            onOk={() => handleOk()}
            onCancel={() => handleCancel()}
            okType="danger primary"
            okText={t("sentencePage.delete")}
            cancelText={t("sentencePage.cancel")}
        >
            <p>{t("sentencePage.deleteSentencesConfirmation").replace('#', deleteData.length)}</p>
        </Modal>
    );
}

export default ConfirmDeleteModal
