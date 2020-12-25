import React, { useEffect, useState, useRef } from 'react';
import PageTitle from '../../Layout/SiteLayout/AppMain/PageTitle';
import {
    Input,
    Table,
    Button,
    Popconfirm,
    Card,
    Dropdown,
    Tooltip,
} from 'antd';
import SiteLayout from '../../Layout/SiteLayout';
import domainAPI from '../../api/domain';
import './Domains.module.css';
const moment = require('moment');

const timeformat = (last_update) => {
    const d = new Date(last_update * 1000);
    return moment(d).format('DD/MM/YYYY');
};

const DomainsPage = (props) => {
    const [dataSource, setDataSource] = useState([]);
    const [selectedDomain, setSeletedDomain] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingKey, setEditingKey] = useState([]);
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    let paginationOptions = {
        showSizeChanger: true,
        showQuickJumper: true,
        onShowSizeChange: (_, pageSize) => {
            handleSetPageSize(pageSize);
        },
        onChange: (page, pageSize) => {
            setOffset((page - 1) * pageSize);
        },
        pageSizeOptions: [5, 10, 15, 20, 50, 100],
        total: total,
        showTotal: (total, range) => `${range[0]} to ${range[1]} of ${total}`,
    };

    useEffect(() => {
        getDomain();
    }, []);

    useEffect(() => {
        !isSearching && getDomain();
    }, [limit, offset]);

    const handleSetPageSize = (pageSize) => {
        setLimit(pageSize);
    };

    const setData = (result) => {
        result = result.map((item) => ({
            ...item,
            key: item._id.$oid,
        }));
        setDataSource(result);
    };

    const getDomain = async () => {
        var data = {
            offset: offset,
            limit: limit,
        };
        let result = await domainAPI.get(data);
        setTotal(result.total);
        setData(result.data);
    };

    const addDomain = async (domain) => {
        var data = new FormData();
        data.append('name', domain);
        data.append('user_id', '12');
        data.append('created_time', Date.now());
        domainAPI.create(data);
        reload();
    };

    const updateDomain = async (id, domain) => {
        if (domain == '' || domain == null) {
            reload();
            alert("Name can't be null");
        } else {
            var data = {
                name: domain,
                _id: id,
            };
            domainAPI.update(data);
        }
        reload();
    };

    const searchDomain = async (domain) => {
        if (domain !== '' && domain !== null) setIsSearching(true);
        var data = {
            name: domain,
        };
        let result = await domainAPI.search(data);
        setTotal(result.total);
        setData(result.data);
    };

    const deleteDomain = (id) => {
        id?.forEach((item) => domainAPI.delete(item));
        getDomain();
    };

    const reload = () => {
        setSeletedDomain('');
        setEditingKey('');
        getDomain();
    };

    const isEditable = (key) => {
        return editingKey.length == 0 ? false : key == editingKey[0];
    };

    const columns = [
        {
            title: 'Domain',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name, domain) => (
                <Tooltip
                    trigger={['focus']}
                    title={'Type in your new domain, press Enter to save.'}
                    placement='topLeft'
                    visible={isEditable(domain.key)}>
                    <Input
                        className='domain-input'
                        defaultValue={name}
                        disabled={!isEditable(domain.key)}
                        bordered={isEditable(domain.key)}
                        onPressEnter={(event) =>
                            updateDomain(domain.key, event.target.value)
                        }></Input>
                </Tooltip>
            ),
        },
        {
            title: 'Last Update',
            dataIndex: 'created_time',
            key: 'created_time',
            render: (created_time) => timeformat(created_time),
            sorter: (a, b) => a.created_time - b.created_time,
        },
        {
            title: 'Document crawled',
            dataIndex: 'crawled',
            key: 'crawled',
            sorter: (a, b) => a.crawled - b.crawled,
        },
        {
            title: 'Crawl',
            dataIndex: '',
            key: 'x',
            render: () => <Button type='primary'>Crawl</Button>,
        },
    ];

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSeletedDomain(selectedRowKeys);
        },
    };

    const handleAddButtonClick = () => {
        setIsAdding(!isAdding);
    };

    const FilterByNameInput = (
        <Input
            placeholder='Search Domain...'
            className='search-input-box'
            onPressEnter={(event) => searchDomain(event.target.value)}
        />
    );

    return (
        <React.Fragment>
            <SiteLayout>
                <PageTitle
                    heading='Domains'
                    subheading='Create new content...'
                    icon='pe-7s-home icon-gradient bg-happy-itmeo'
                />

                <Card className='domain-table-card'>
                    <div style={{ float: 'right' }}>
                        <Button onClick={() => handleAddButtonClick()}>
                            Add domain
                        </Button>

                        <Button onClick={() => setEditingKey(selectedDomain)}>
                            Edit domain
                        </Button>

                        <Button onClick={() => deleteDomain(selectedDomain)}>
                            Delete domain
                        </Button>

                        {isAdding && (
                            <div>
                                <Input
                                    placeholder='Type in and press Enter to add domain...'
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            addDomain(event.target.value);
                                            setIsAdding(false);
                                        }
                                    }}></Input>
                                <i className='ps-7s-plus'></i>
                            </div>
                        )}
                    </div>

                    {FilterByNameInput}

                    {/* {editingKey !== '' ? <Button onClick={reload()}>Cancel</Button> : <></>} */}

                    <Table
                        className='table-striped-rows'
                        rowSelection={{
                            type: 'checkbox',
                            ...rowSelection,
                        }}
                        dataSource={dataSource}
                        columns={columns}
                        pagination={paginationOptions}></Table>
                </Card>
            </SiteLayout>
        </React.Fragment>
    );
};

export default DomainsPage;
