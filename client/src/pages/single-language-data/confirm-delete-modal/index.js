import './style.module.scss';
import React, { useState } from 'react'
import {
    Modal,
    Input
} from 'antd'

import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const ConfirmDeleteModal = props => {
    const { t } = useTranslation(['common']);

    const {
        isDeleteAll,
        isVisible,
        setVisible,
        deleteData,
        reloadSentenceData,
        reloadPaginationParams,
        currentFilter,
        currentPagination,
        deleteAPI,
        loadDataAPI,
    } = props

    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // const handleDeleteAll = async () => {
    //     setIsLoading(true)
    //     if (password && password != ""){
    //         let response = await deleteAPI(deleteData)
    //         if (response.status == 200 && response.data.code == 1){
    //             currentFilter.page = 1;
    //             let newSentenceData = await loadDataAPI(currentFilter)
    //             reloadSentenceData(newSentenceData.data.data.para_sentences);
    //             reloadPaginationParams(newSentenceData.data.data.pagination);
                
    //             setPassword("")
    //             setVisible(false)
    //             toast.success(t(`sentencePage.${response.data.message}`).replace('#', response.data.data), {
    //                 position: "top-right",
    //                 autoClose: 3000,
    //                 hideProgressBar: false,
    //                 closeOnClick: true,
    //             })
    //         } else {
    //             toast.error(t(`sentencePage.${response.data.message}`), {
    //                 position: "top-right",
    //                 autoClose: 3000,
    //                 hideProgressBar: false,
    //                 closeOnClick: true,
    //             })
    //         }
    //     } else {
    //         toast.warn(t("sentencePage.emptyPasswordWarning"), {
    //             position: "top-right",
    //             autoClose: 3000,
    //             hideProgressBar: false,
    //             closeOnClick: true,
    //         })
    //     }
    //     setIsLoading(false)
    // }

    const handleDelete = async () => {
        setIsLoading(true)
        let response = await deleteAPI(deleteData)
        if (response.status == 200 && response.data.code == 1){
            let currentPage = 0;
            if ((currentPagination.total_pages == currentPagination.current_page) && (currentPagination.total_items%currentPagination.page_size == deleteData.length || currentPagination.page_size == deleteData.length)){
                currentPage = currentPagination.current_page - 1
            } else {
                currentPage = currentPagination.current_page
            }
            if (currentPage > 0) {
                currentFilter.page = currentPage;
                let newSentenceData = await loadDataAPI(currentFilter)
                reloadSentenceData(newSentenceData.data.data.single_sentences);
                reloadPaginationParams(newSentenceData.data.data.pagination);
            }
            setVisible(false)
            toast.success(t(`singleLanguageDataPage.${response.data.message}`).replace('#', response.data.data), {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
            })
        } else {
            toast.error(t(`singleLanguageDataPage.${response.data.message}`), {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
            })
        }
        setIsLoading(false)
    };

    const handleCancel = () => {
        setPassword("")
        setIsLoading(false);
        setVisible(false);
    };

    if (isDeleteAll) {
        // return (
        //     <Modal
        //         title={t("sentencePage.deleteAll")}
        //         centered={true}
        //         visible={isVisible}
        //         onOk={() => handleDeleteAll()}
        //         onCancel={() => handleCancel()}
        //         okType="danger primary"
        //         okText={t("sentencePage.deleteAll")}
        //         cancelText={t("sentencePage.cancel")}
        //         confirmLoading={isLoading}
        //     >
        //         <div>{t("sentencePage.deleteAllConfirmation").replace('#1', currentPagination.total_items).replace('#2', t(`sentencePage.${currentFilter.rating}`).toLocaleLowerCase())}</div>
        //         <br/>
        //         <div>{t('sentencePage.enterPasswordToDelete')}</div>
        //         <Input.Password 
        //             placeholder={t('sentencePage.passwordPlaceholder')}
        //             value={password}
        //             onChange={ e => {
        //                 setPassword(e.target.value)
        //             }}
        //         />
        //     </Modal>
        // );
    } else {
        return (
            <Modal
                title={t("singleLanguageDataPage.title")}
                centered={true}
                visible={isVisible}
                onOk={() => handleDelete()}
                onCancel={() => handleCancel()}
                okType="danger primary"
                okText={t("sentencePage.delete")}
                cancelText={t("sentencePage.cancel")}
                confirmLoading={isLoading}
            >
                <p>{t("singleLanguageDataPage.deleteSentenceConfirmation")}</p>
            </Modal>
        );
    }
}

export default ConfirmDeleteModal
