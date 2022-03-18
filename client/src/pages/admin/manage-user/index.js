import './style.module.scss';

import React, { useEffect, useState, useRef } from 'react';
import PageTitle from '../../../layout/site-layout/main/PageTitle';
import {
    Input,
    Table,
    Button,
    Select,
    Upload,
    message,
    Spin,
    Tooltip,
    Radio,
    Card,
    Row,
    Col,
    Modal,
    Form,
} from "antd";

import { WarningOutlined } from '@ant-design/icons';

import SiteLayout from '../../../layout/site-layout';
import userAPI from '../../../api/admin/user';
import assignmentAPI from '../../../api/admin/assignment';

import { useTranslation } from 'react-i18next';

import { formatDate } from '../../../utils/date';
import { clonedStore } from '../../../store';

import { hasRole } from '../../../utils/auth';

import { STATUS_CODES, USER_STATUS, USER_ROLES, LANGS } from '../../../constants';
import { useForm } from 'antd/lib/form/Form';
import Checkbox from 'antd/lib/checkbox/Checkbox';

const ManageUserPage = (props) => {
    
    const { t } = useTranslation(['common']);

    const [userList, setUserList] = useState({
        items: [],
        total: 0,
        page: 1,
        perPage: 5,
    });

    const [form] = useForm();
    
    const [selectedUsersId, setSelectedUsersId] = useState([]);

    const currentUserId = clonedStore.getState().User?.profile?.id;

    const initialUserValues = {
        username: '',
        email: '',
        password: '',
        status: USER_STATUS.inactive,
        roles: ['member'],
        langScope: null
    };

    const addingFormRules = {
        username: [
            {
                required: true,
                message: t('formMessages.errors.fieldRequired'),
            },
        ],
        email: [
            {
                required: true,
                message: t('formMessages.errors.fieldRequired'),
            },
        ],
        password: [
            {
                required: true,
                message: t('formMessages.errors.fieldRequired'),
            },
        ],
        status: [
            {
                required: true,
                message: t('formMessages.errors.fieldRequired'),
            },
        ],
        roles: [
            {
                required: true,
                message: t('formMessages.errors.fieldRequired'),
            },
        ],
        langScope: [
            // {
            //     required: true,
            //     message: t('formMessages.errors.fieldRequired'),
            // },
        ]
    } 

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

    const createUser = async (data) => {

        let _newUserData = {
            username: data.username,
            email: data.email,
            password: data.password,
            status: data.status,
            roles: data.roles,
        }

        let result = await userAPI.create(_newUserData);

        if (result.code == STATUS_CODES.success) {

            if (data.langScope) {
                let result2 = await assignmentAPI.create({
                    userId: result.data,
                    langScope: [{
                        lang1: 'vi',
                        lang2: data.langScope
                    }]
                })

                if (result2.code == STATUS_CODES.success) {
                    message.success(t('serverMessages.success.createUserSuccess'))

                    return
                }
            }

            message.success(t('serverMessages.success.createUserSuccess'))
        }
        
        reload();
    };

    const createUserFailed = () => {

    }

    const updateUser = async (id, updateData) => {

        let result = await userAPI.update(id, updateData);

        if (result.code == STATUS_CODES.success) {
            message.success(t('serverMessages.success.updateSuccess'))

            reload();
        }
    };

    const searchUser = async () => {
        
        let data = {
            username: searchInput || '',
            email: searchInput || '',
            extraData: {
                assignment: 1
            },
            ...pagination
        };

        let result = await userAPI.search(data);
        
        result.data.items = result.data.items.map(i => ({
            ...i,
            extraData: {
                assignment: Object.keys(i.extraData.assignment).length > 0 ? {
                    id: i.extraData.assignment.id,
                    langScope: i.extraData.assignment.lang_scope[0]
                } : {}
            }
        }))
        
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

    const openDeleteModal = () => {
        Modal.confirm({
            icon: <WarningOutlined />,
            content: <div style={{ display: 'flex' }}>{ t('modalMessages.warning.deleteUser') }</div>,
            onOk() {
                deleteUsers()
            },
            onCancel() { },
        });
    }

    const disableUpdate = (record) => {
        return record.roles.includes(USER_ROLES.admin) && record.id !== currentUserId;
    }

    const deleteUsers = () => {
        selectedUsersId?.forEach((item) => userAPI.delete(item));

        searchUser();
    };

    const reload = () => {
        searchUser();
    };

    const columns = [
        {
            title: t('username'),
            dataIndex: 'username',
            key: 'username',
            render: (username, user) => (
                <Tooltip
                    trigger={ ['focus'] }
                    title={ t('changeInput') }
                    placement='topLeft'>
                    <Input
                        className='user-input'
                        defaultValue={ username }
                        disabled={ disableUpdate(user) }
                        onPressEnter={ event => {
                            updateUser(user.id, { username: event.target.value })
                        }
                    }/> 
                </Tooltip>
            ),
        },
        {
            title: t('email'),
            dataIndex: 'email',
            key: 'email',
            render: (email, user) => (
                <Tooltip
                    trigger={ ['focus'] }
                    title={ t('changeInput') }
                    placement='topLeft'>
                    <Input
                        className='user-input'
                        defaultValue={ email }
                        disabled={ disableUpdate(user) }
                        onPressEnter={ event => {
                            updateUser(user.id, { email: event.target.value })
                        }
                    }/> 
                </Tooltip>
            ),
        },
        {
            title: t('password'),
            dataIndex: 'password',
            key: 'password',
            render: (password, user) => (
                <Tooltip
                    trigger={ ['focus'] }
                    title={ t('changeInput') }
                    placement='topLeft'>
                    <Input
                        className='user-input'
                        defaultValue={ password }
                        disabled={ disableUpdate(user) }
                        onPressEnter={ event => {
                            updateUser(user.id, { password: event.target.value })
                        }
                    }/> 
                </Tooltip>
            ),
        },
        {
            title: t('status'),
            align: 'center',
            dataIndex: 'status',
            key: 'status',
            render: (currentStatus, record) => {
                return renderStatus(currentStatus, record);
            }
        },
        {
            title: t('assignedLanguage'),
            dataIndex: 'extraData',
            key: 'assignment',
            render: (extraData, record) => {
                return (
                    <Select
                        defaultValue={ extraData.assignment?.langScope?.lang2 }
                        options={
                            LANGS
                                .filter(e => e.value != 'vi')
                                .map(l => ({label: t(`Language.${l.label}`), value: l.value}))
                        }
                        onChange={ (value) => { 
                            updateAssignedLang(
                                {
                                    ...extraData.assignment,
                                    userId: record.id
                                }, 
                                value
                            )
                        }}
                        style={{ width: '100%' }}>
                    </Select>
                )
            }
        },
        {
            title: t('role'),
            dataIndex: 'roles',
            key: 'roles',
            render: (roles, record) => {
                return (
                    <Select
                        mode="multiple"
                        // size={ size }
                        placeholder={ t('formMessages.errors.fieldRequired') }
                        defaultValue={ roles }
                        disabled={ disableUpdate(record) }
                        onChange={ value => updateUser(record.id, { roles: value }) }
                        options={
                            Object.keys(USER_ROLES).map(r => ({label: t(`userRoles.${r}`), value: r}))
                        }
                        style={{ width: '100%' }}
                    >
                  </Select>
                )
            }
        },
    ];

    const updateAssignedLang = async (assignment, lang) => {
        
        if (assignment.id) {
            let _data = {
                id: assignment.id,
                langScope: [{
                    lang1: 'vi',
                    lang2: lang
                }]
            }
            
            let result = await assignmentAPI.update(_data);
    
            if (result.code == STATUS_CODES.success) {
                message.success(t('serverMessages.success.updateSuccess'))
    
                reload();
            }
        } else {

            let _data = {
                userId: assignment.userId,
                langScope: [{
                    lang1: 'vi',
                    lang2: lang
                }]
            }
    
            let result = await assignmentAPI.create(_data);
    
            if (result.code == STATUS_CODES.success) {
                message.success(t('serverMessages.success.updateSuccess'))
    
                reload();
            }
        }
    }

    const renderStatus = (currentStatus, record) => {
        let defaultStatus = currentStatus === USER_STATUS.active;

        return (
            <Checkbox
                className='status-checkbox'
                defaultChecked={ defaultStatus }
                onChange={ (e) =>
                    handleStatusChange(e, currentStatus, record)
                }> 
            </Checkbox>
        );
    };

    const handleStatusChange = (e, currentStatus, record) => {
        const status = e.target.checked ? USER_STATUS.active : USER_STATUS.inactive;

        updateUser(record.id, { status: status });
    };

    return (
        <React.Fragment>
            <SiteLayout>
                <PageTitle
                    heading={ t('manageUserPage.title') }
                    // subheading='Create new content...'
                    icon='pe-7s-home icon-gradient bg-happy-itmeo'
                />

                <Card className='user-table-card'>
                    <div style={{ float: 'right' }}>
                        <Button onClick={() => setIsAdding(!isAdding)}>
                            { t('manageUserPage.addUser') }
                        </Button>

                        {/* <Button 
                            onClick={() => openDeleteModal()}
                            disabled={ selectedUsersId.length == 0 } 
                            danger>
                            { t('manageUserPage.deleteUser') }
                        </Button> */}
                    </div>

                    <Input
                        placeholder={ t('manageUserPage.searchUser') }
                        className='search-input-box'
                        onChange={ e => setSearchInput(e.target.value) }
                        onPressEnter={ e => searchUser(e.target.value) }
                    />

                    { 
                        isAdding && (
                            <div style={{
                                padding: '20px',
                                background: '#eee'
                            }}>
                                <Form 
                                    form={ form }
                                    initialValues={ initialUserValues }
                                    onFinish={ createUser }
                                    onFinishFailed={ createUserFailed }>

                                    <Row gutter={{ xs: 0, sm: 0, md: 24, lg: 32 }}>

                                        <Col xs={ 24 } md={ 12 }>

                                            <label>{ t('username') }</label>
                                            <Tooltip
                                                trigger={ ['focus'] }
                                                title={ t('changeInput') }
                                                placement='topLeft'>

                                                <Form.Item 
                                                    name='username'
                                                    rules={ addingFormRules.username }>
                                                    <Input
                                                        className='user-input'
                                                        onPressEnter={ event => {
                                                            updateUser(user.id, event.target.value)
                                                        }
                                                    }/> 
                                                </Form.Item>
                                            </Tooltip>
                                        </Col>

                                        <Col xs={ 24 } md={ 12 }>

                                            <label>{ t('email') }</label>
                                            <Tooltip
                                                trigger={ ['focus'] }
                                                title={ t('changeInput') }
                                                placement='topLeft'>
                                                
                                                <Form.Item 
                                                    name='email'
                                                    rules={ addingFormRules.email }>
                                                    <Input
                                                        className='user-input'
                                                        onPressEnter={ event => {
                                                            updateUser(user.id, event.target.value)
                                                        }
                                                    }/> 
                                                </Form.Item>
                                            </Tooltip>
                                        </Col>

                                        <Col xs={ 24 } md={ 12 }>

                                            <label>{ t('password') }</label>
                                            <Tooltip
                                                trigger={ ['focus'] }
                                                title={ t('changeInput') }
                                                placement='topLeft'>
                                                
                                                <Form.Item 
                                                    name='password'
                                                    rules={ addingFormRules.password }>
                                                    <Input
                                                        className='user-input'
                                                        onPressEnter={ event => {
                                                            updateUser(user.id, event.target.value)
                                                        }
                                                    }/> 
                                                </Form.Item>
                                            </Tooltip>
                                        </Col>

                                        <Col xs={ 24 } md={ 12 }>

                                            <label>{ t('status') }</label>
                                            <Form.Item 
                                                name='status'
                                                rules={ addingFormRules.status }>
                                                <Radio.Group>
                                                    {
                                                        Object.keys(USER_STATUS).map(statusKey => {
                                                            return (
                                                                <Radio.Button key={ statusKey } value={ statusKey }>
                                                                    { t(`userStatus.${statusKey}`) }
                                                                </Radio.Button>
                                                            )
                                                        })
                                                    }
                                                </Radio.Group>
                                            </Form.Item>
                                        </Col>

                                        <Col xs={ 24 } md={ 12 }>

                                            <label>{ t('role') }</label>
                                            <Form.Item 
                                                name='roles'
                                                rules={ addingFormRules.roles }>
                                                <Select
                                                    mode="multiple"
                                                    // size={ size }
                                                    placeholder={ t('formMessages.errors.fieldRequired') }
                                                    onChange={ () => {}}
                                                    options={
                                                        Object.keys(USER_ROLES).map(r => ({label: t(`userRoles.${r}`), value: r}))
                                                    }
                                                    style={{ width: '100%' }}
                                                    >
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        
                                            <Col xs={ 24 } md={ 12 }>

                                            <label>{ t('assignedLanguage') }</label>
                                            
                                            <Form.Item 
                                                name='langScope'
                                                rules={ addingFormRules.langScope }>
                                                <Select
                                                    // placeholder={ t('formMessages.errors.fieldRequired') }
                                                    allowClear={ true }
                                                    options={
                                                        LANGS
                                                            .filter(e => e.value != 'vi')
                                                            .map(l => ({label: t(`Language.${l.label}`), value: l.value}))
                                                    }
                                                    style={{ width: '100%' }}>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        
                                    </Row>

                                    <Button 
                                        type="primary" 
                                        htmlType="submit">
                                        { t('create') }
                                    </Button>
                                </Form>
                            </div>
                        )    
                    }

                    <Table
                        className='table-striped-rows'
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
