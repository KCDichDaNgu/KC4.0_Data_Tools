import React, { useState } from 'react'
import './style.module.scss'
import {
    Modal
} from 'antd'

import { FileAddOutlined } from '@ant-design/icons'

import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone'

import backupAPI from '../../../../api/admin/backup';

const RestoreModal = props => {
    const { t } = useTranslation(['common']);

    const {isVisible, setVisible, getCurrentVersion, toast} = props
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [files, setFiles] = useState([])

    const handleOk = async () => {
        if (files.length < 1) {
            toast.warn(t("backupDatabase.noFile"), {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
            })
            return;
        }

        setConfirmLoading(true);
        let response = await backupAPI.restore(files[0])
        setConfirmLoading(false)
        if (response.status == 200 && response.data.code == 1) {
            getCurrentVersion()
            setFiles([])
            setVisible(false)
            toast.success(t("backupDatabase.restoreSuccess"), {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
            })
        } else {
            setFiles([])
            toast.error(response.data.message, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
            })
        }
    };

    const handleCancel = () => {
        setFiles([])
        setVisible(false);
    };

    let text = "Hãy chọn tệp chứa dữ liệu cần khôi phục!"

    let {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop: acceptedFiles =>{setFiles(acceptedFiles)}})

    const fileList = files.map(file => (
        <li key={file.path}>
            &#9864; {file.path} - {file.size} bytes
        </li>
    ));
    
    return (
        <Modal
            title={t("backupDatabase.restore")}
            centered={true}
            visible={isVisible}
            onOk={() => handleOk()}
            confirmLoading={confirmLoading}
            onCancel={() => handleCancel()}
            okText={t("backupDatabase.restore")}
            cancelText={t("sentencePage.cancel")}
        >
            <div {...getRootProps()} className={`upload-container ${isDragActive? "upload-container-active" : ""}`}>
                <input {...getInputProps()} />
                <FileAddOutlined />
                <div className={`upload-title`}>
                    { text }
                </div>
            </div>
            <div style={{marginTop: "10px"}}>
                {fileList}
            </div>
        </Modal>
    );
}

export default RestoreModal
