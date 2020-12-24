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
    const [data, setData] = useState([]);
    const [value, setValue] = useState('');
    const [selectedDomain, setSeletedDomain] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingKey, setEditingKey] = useState([]);

    useEffect(() => {
        getDomain();
    }, []);

    const getDomain = async () => {
        let result = await domainAPI.get();
        let count = 1;
        result = result.map((item) => ({
            ...item,
            key: item._id.$oid,
            id: count++,
        }));
        setDataSource(result);
        setData(result);
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
        var data = {
            name: domain,
            _id: id,
        };
        domainAPI.update(data);
        reload();
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
            title: 'IDs',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
        },
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
                        }
                        required
                        validationErrors={{
                            isDefaultRequiredValue: 'Field is required',
                        }}></Input>
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
            value={value}
            onChange={(e) => {
                console.log(data);
                const currValue = e.target.value;
                setValue(currValue);
                const filteredData = data.filter((entry) =>
                    entry.name.includes(currValue)
                );
                setDataSource(filteredData);
            }}
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
                        columns={columns}></Table>
                </Card>
            </SiteLayout>
        </React.Fragment>
    );
};

export default DomainsPage;
