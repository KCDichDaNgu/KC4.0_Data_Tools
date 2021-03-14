import './style.module.scss';
import React from 'react'
import {
    Modal
} from 'antd'

import { useTranslation } from 'react-i18next';

const ConfirmDeleteModal = props => {
    const { t } = useTranslation(['common']);

    const {isVisible, setVisible, deleteData} = props
    const [confirmLoading, setConfirmLoading] = React.useState(false);

    const handleOk = () => {
        setConfirmLoading(true);
        setTimeout(() => {
        setVisible(false);
        setConfirmLoading(false);
        }, 2000);
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
            confirmLoading={confirmLoading}
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
