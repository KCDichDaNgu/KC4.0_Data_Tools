// import './manage-backup.module.scss';

import React, { useEffect, useState, useRef } from 'react';
import PageTitle from '../../../layout/site-layout/main/PageTitle';
import {
    Input,
    Table,
    Button,
    message,
    Card,
    Anchor,
    Spin,
    Modal,
} from "antd";
import { DownloadOutlined, DeleteTwoTone, ExclamationCircleOutlined } from '@ant-design/icons';

import SiteLayout from '../../../layout/site-layout';
import backupAPI from '../../../api/admin/backup';
import { formatDateTime } from '../../../utils/date';
import { useTranslation } from 'react-i18next';
import { relativeTimeRounding, localeData } from 'moment';
import RestoreModal from './restore-modal/index';
import { ToastContainer, toast } from 'react-toastify';

const ManageBackUpPage = (props) => {
    
    const { t } = useTranslation(['common']);

    const [isAdding, setIsAdding] = useState(false);
    const [backUps, setBackUps] = useState([]);
    const [currentVersion, setCurrentVersion] = useState('')
    const [paginationParams, setPaginationParams] = useState({});
    const [backupProcessing, setBackupProcessing] = useState(false);
    const [isRestoreModalVisible, setIsRestoreModalVisible] = useState(false);

    useEffect(() => {
        searchBackups();
        getCurrentVersion();
    }, []);

    const searchBackups = () => {
        return backupAPI.search(paginationParams).then(res => {
            setBackUps(res.data.data.backups);
            setPaginationParams(res.data.data.pagination);
        });
    }

    const getCurrentVersion = async () => {
        let res = await backupAPI.getCurrentVersion();
        setCurrentVersion(res.data.data.current_version)
    }

    const addBackup = (backupName) => {
        setBackupProcessing(true);

        let newBackUpData = {
            name: backupName
        }

        backupAPI.create(newBackUpData).then(res => {
            if (res.data.code == process.env.REACT_APP_CODE_SUCCESS) {
                message.success(t('backupDatabase.addedSuccess'));
                setIsAdding(false);
                searchBackups();
                setBackupProcessing(false);
            } else {
                message.error(t('backupDatabase.addedFailure'));
                setBackupProcessing(false);
            }
        });
    };

    const handleTableChange = (pagination, filters, sorter) => {
        let params = {
            page: pagination['current']
        };

        backupAPI.search(params).then((res) => {
            setBackUps(res.data.data.backups);
            setPaginationParams(res.data.data.pagination);
        });
    }

    const openModelConfirmDelete = (backup) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: (
                <>
                    <p>
                        {t('backupDatabase.confirmDeleteContent')}
                    </p>
                    <p>
                        {backup.name} - {t('backupDatabase.createdAt')} {formatDateTime(backup.created_at)}
                    </p>
                </>
            ),
            onOk() {
                deleteBackup(backup);
            },
            // onCancel() {},
        });
    }

    const deleteBackup = (backup) => {
        backupAPI.delete(backup['id']).then(res => {
            if (res.data.code == process.env.REACT_APP_CODE_SUCCESS) {
                message.success(t('backupDatabase.deletedSuccess'));
                searchBackups();
            } else {
                message.error(t('backupDatabase.deletedFailure'));
            }
        })
    }

    const updateBackup = (backup, key, value) => {
        let updateData = {};
        updateData[key] = value;

        backupAPI.update(backup['id'], updateData).then(res => {
            if (res.data.code == process.env.REACT_APP_CODE_SUCCESS) {
                message.success(t('backupDatabase.editedSuccess'));
            } else {
                message.error(t(`backupDatabase.${res.data.message}`));
            }
        });
    }

    const columns = [
        {
            title: t('backupDatabase.name'),
            dataIndex: "name",
            key: "name",
            render: (name, backup) => (
                backup['type'] == 'by_user' ? 
                    <Input
                        key={ backup['id'] }
                        className='domain-input'
                        defaultValue={ name }
                        onPressEnter={ event => {
                            event.preventDefault();
                            updateBackup(backup, "name", event.target.value);
                        }}
                    /> : name
            )
        },
        {
            title: t('backupDatabase.createdAt'),
            dataIndex: "created_at",
            key: "created_at",
            render: (created_at) => formatDateTime(created_at),
            align: 'center'
        },
        {
            title: t('backupDatabase.createdBy'),
            dataIndex: "creator",
            key: "creator",
            render: (creator, backup, index) => (
                backup['type'] === 'by_user' ? creator['username'] : t('backupDatabase.machine')
            ),
            align: 'center'
        },
        {
            title: t('backupDatabase.type'),
            dataIndex: "type",
            key: "type",
            render: (type) => t(`backupDatabase.${ type }`),
            align: 'center'
        },
        {
            title: t('backupDatabase.version'),
            dataIndex: "version",
            key: "version",
            render: version => version == null ? 'NaN' : version,
            align: 'center'
        },
        {
            title: t('backupDatabase.url'),
            dataIndex: "hash_name",
            key: "hash_name",
            render: (hash_name, backup) => (
                <a href={backupAPI.downloadBackupURL(backup['type'], hash_name)}
                    style={{display: 'flex', justifyContent: 'center'}}
                    target='_blank'>
                    <Button 
                        type="primary" 
                        shape="round"
                        style={{display: "flex", alignItems: "center", fontSize: "15px"}} 
                        icon={<DownloadOutlined />} >
                        { t('backupDatabase.download') }
                    </Button>
                </a>
            ),
            align: 'center'
        },
        {
            title: t('backupDatabase.delete'),
            dataIndex: "delete",
            key: "delete",
            render: (row_value, backup) => (
                <Button 
                    type="link" 
                    icon={<DeleteTwoTone twoToneColor="red" style={{fontSize: '18px'}}/>} 
                    size='small'
                    onClick={() => openModelConfirmDelete(backup)}
                    block>
                </Button>
            ),
            align: 'center'
        },
    ];

    return (
        <React.Fragment>
            <SiteLayout>
                <PageTitle
                    heading={ t('backupDatabase.title') }
                    // subheading='Create new content...'
                    icon='pe-7s-home icon-gradient bg-happy-itmeo'
                />

                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div>
                            <div style={{fontSize: "16px", fontWeight: "bold"}}>
                                {t('backupDatabase.currentVersion') + ': ' + currentVersion}
                            </div>
                        </div>
                        <div>
                        <div style={{ marginRight: '10px', display: 'inline-block' }}>
                            {
                                backupProcessing ? (
                                    <Spin />
                                ) : ''
                            }
                        </div>
                        
                        <Button 
                            style={{ display: 'inline-block', marginRight: "5px" }}
                            onClick={() => setIsAdding(!isAdding)}>
                            { t('backupDatabase.addBackUp') }
                        </Button>

                        <Button 
                            style={{ display: 'inline-block' }}
                            onClick={() => setIsRestoreModalVisible(!isRestoreModalVisible)}
                        >
                            { t('backupDatabase.restore') }
                        </Button>
                        </div>
                    </div>

                    { 
                        isAdding && (
                            <div>
                                <Input
                                    style={{ margin: '10px 0' }}
                                    placeholder={ t('backupDatabase.inputAdd') }
                                    onPressEnter={ event => {
                                        addBackup(event.target.value);
                                    }}
                                />
                                <i className='ps-7s-plus'></i>
                            </div>
                        ) 
                    }

                    <Table
                        rowKey={ record => record.id }
                        className='table-striped-rows'
                        // rowSelection={{
                        //     type: 'checkbox'
                        // }}
                        // rowSelection={{
                        //     type: 'checkbox',
                        //     onChange: (selectedRowKeys) => {
                        //         setSelectedUsersId(selectedRowKeys)
                        //     },
                        // }}
                        dataSource={ backUps }
                        columns={ columns }
                        onChange={ handleTableChange } 
                        pagination={{
                            pageSize: paginationParams.page_size,
                            total: paginationParams.total_items,
                            current: paginationParams.current_page
                        }}>
                    </Table>
                </Card>
            </SiteLayout>
            <RestoreModal
                isVisible={ isRestoreModalVisible }
                setVisible={ setIsRestoreModalVisible }
                getCurrentVersion={ getCurrentVersion }
                toast={ toast }
            />
            <ToastContainer/>
        </React.Fragment>
    );
};

export default ManageBackUpPage;
