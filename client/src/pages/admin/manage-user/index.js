import './manage-user.module.scss';

import React, { useEffect, useState, useRef } from 'react';
import PageTitle from '../../../layout/site-layout/main/PageTitle';
import {
    Input,
    Table,
    Button,
    Popconfirm,
    Card,
    Dropdown,
    Tooltip,
    message
} from 'antd';

import SiteLayout from '../../../layout/site-layout';
import userAPI from '../../../api/admin/user';

import { useTranslation } from 'react-i18next';

import { formatDate } from '../../../utils/date';

import { STATUS_CODES } from '../../../constants';

const ManageUserPage = (props) => {
    
    const { t } = useTranslation(['common']);

    const [userList, setUserList] = useState({
        items: [],
        total: 0,
        page: 1,
        perPage: 5,
    });

    const [searchInput, setSearchInput] = useState('')
    const [isAdding, setIsAdding] = useState(false);

    const [pagination, setPagination] = useState({
        pagination__page: 1,
        pagination__perPage: 5
    });

    let paginationOptions = {
        showSizeChanger: true,
        showQuickJumper: true,

        onShowSizeChange: (_, pageSize) => {
            setPagination({
                ...pagination,
                pagination__perPage: pageSize
            })
        },

        onChange: (page, pageSize) => {
            setPagination({
                pagination__page: page,
                pagination__perPage: pageSize
            })
        },

        pageSizeOptions: [5, 10, 15, 20, 50, 100],
        total: userList.total,
        defaultPageSize: pagination.pagination__perPage,

        showTotal: (total, range) => `${range[0]} to ${range[1]} of ${total}`,
    };

    useEffect(() => {
        searchUser();
    }, [ 
        pagination.pagination__page, 
        pagination.pagination__perPage 
    ]);

    const addUser = async (userName) => {

        let _newUserData = {
            name: userName
        }

        await userAPI.create(_newUserData);
        
        reload();
    };

    const updateUser = async (id, user) => {

        if (user == '' || user == null) {
            message.error(t('user.nameNotNull'));
        } else {

            let data = {
                name: user,
                id: id,
            };

            let result = await userAPI.update(data);

            if (result.code == STATUS_CODES.success) {
                message.success(t('updateSuccess'))
                reload();
            }
        }
    };

    const searchUser = async () => {

        let data = {
            name: searchInput || '',
            ...pagination
        };

        let result = await userAPI.search(data);
        
        setUserList({
            items: result.data.items,
            total: result.data.total,
            page: result.data.page,
            perPage: result.data.perPage,
        });

        setPagination({
            pagination__page: result.data.page,
            pagination__perPage: result.data.perPage,
        })
    };

    const deleteUser = (id) => {
        id?.forEach((item) => userAPI.delete(item));
        searchUser();
    };

    const reload = () => {
        searchUser();
    };

    const columns = [
        {
            title: t('user.title'),
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name, user) => (
                <Tooltip
                    trigger={ ['focus'] }
                    title={ t('user.inputAdd') }
                    placement='topLeft'>
                    <Input
                        className='user-input'
                        defaultValue={name}
                        onPressEnter={ event => {
                            updateUser(user.id, event.target.value)
                        }
                    }/> 
                </Tooltip>
            ),
        },
        {
            title: t('user.lastUpdate'),
            dataIndex: 'created_time',
            key: 'created_time',
            render: (created_time) => formatDate(created_time),
            sorter: (a, b) => a.created_time - b.created_time,
        },
        {
            title: t('user.crawledDocuments'),
            dataIndex: 'crawled',
            key: 'crawled',
            sorter: (a, b) => a.crawled - b.crawled,
        },
        {
            title: t('user.crawl'),
            dataIndex: '',
            key: 'x',
            render: () => (
                <Button 
                    type='primary' 
                    onClick={ crawlUser }>
                    { t('user.crawl') }
                </Button>
            ),
        },
    ];

    return (
        <React.Fragment>
            <SiteLayout>
                <PageTitle
                    heading={ t('manageUser.title') }
                    // subheading='Create new content...'
                    icon='pe-7s-home icon-gradient bg-happy-itmeo'
                />

                <Card className='user-table-card'>
                    <div style={{ float: 'right' }}>
                        <Button onClick={() => setIsAdding(!isAdding)}>
                            { t('user.addUser') }
                        </Button>

                        <Button onClick={() => deleteUser(selectedUser)} danger>
                            { t('user.deleteUser') }
                        </Button>

                        { isAdding && (
                            <div>
                                <Input
                                    style={{ margin: '10px 0' }}
                                    placeholder={ t('user.inputAdd') }
                                    onPressEnter={ event => {
                                        addUser(event.target.value);
                                    }}
                                />
                                <i className='ps-7s-plus'></i>
                            </div>
                        ) }
                    </div>

                    <Input
                        placeholder={ t('user.searchBox') }
                        className='search-input-box'
                        onChange={ (e) => { setSearchInput(e.target.value) }}
                        onPressEnter={event => searchUser(event.target.value)}
                    />

                    <Table
                        className='table-striped-rows'
                        rowSelection={{
                            type: 'checkbox'
                        }}
                        dataSource={ userList.items.map(d => ({...d, key: d.id})) }
                        columns={ columns }
                        pagination={ paginationOptions }>
                    </Table>
                </Card>
            </SiteLayout>
        </React.Fragment>
    );
};

export default ManageUserPage;
