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
    Spin
} from "antd";
import { DownloadOutlined } from '@ant-design/icons';

import SiteLayout from '../../../layout/site-layout';
import backupAPI from '../../../api/admin/backup';
import { formatDateTime } from '../../../utils/date';
import { useTranslation } from 'react-i18next';
import { relativeTimeRounding, localeData } from 'moment';

const { Link } = Anchor;

const ManageBackUpPage = (props) => {
    
    const { t } = useTranslation(['common']);

    const [isAdding, setIsAdding] = useState(false);
    const [backUps, setBackUps] = useState([]);
    const [paginationParams, setPaginationParams] = useState({});
    const [backupProcessing, setBackupProcessing] = useState(false);

    useEffect(() => {
        searchBackups();
    }, []);

    const searchBackups = () => {
        return backupAPI.search(paginationParams).then(res => {
            setBackUps(res.data.data.backups);
            setPaginationParams(res.data.data.pagination);
        });
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

    const columns = [
        {
            title: t('backupDatabase.name'),
            dataIndex: "name",
            key: "name"
        },
        {
            title: t('backupDatabase.createdAt'),
            dataIndex: "created_at",
            key: "created_at",
            render: (created_at) => formatDateTime(created_at)
        },
        {
            title: t('backupDatabase.createdBy'),
            dataIndex: "creator",
            key: "creator",
            render: (creator, backup, index) => (
                backup['type'] === 'by_user' ? creator['username'] : t('backupDatabase.machine')
            )
        },
        {
            title: t('backupDatabase.type'),
            dataIndex: "type",
            key: "type",
            render: (type) => t(`backupDatabase.${ type }`)
        },
        {
            title: t('backupDatabase.url'),
            dataIndex: "hash_name",
            key: "hash_name",
            render: (hash_name, backup) => (
                <a href={backupAPI.downloadBackupURL(backup['type'], hash_name)}
                    target='_blank'>
                    <Button 
                        type="primary" 
                        shape="round" 
                        icon={<DownloadOutlined />} 
                        size='small'>
                        { t('backupDatabase.download') }
                    </Button>
                </a>
            )
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
                    <div style={{ float: 'right', marginBottom: '20px' }}>
                        <div style={{ marginRight: '10px', display: 'inline-block' }}>
                            {
                                backupProcessing ? (
                                    <Spin />
                                ) : ''
                            }
                        </div>
                        
                        <Button 
                            style={{ display: 'inline-block' }}
                            onClick={() => setIsAdding(!isAdding)}>
                            { t('backupDatabase.addBackUp') }
                        </Button>
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
        </React.Fragment>
    );
};

export default ManageBackUpPage;
