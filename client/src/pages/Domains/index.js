import React, { useEffect, useState, useRef } from 'react';
import PageTitle from '../../Layout/SiteLayout/AppMain/PageTitle';
import { Input, Table, Button, Popconfirm, Card, Dropdown } from 'antd';
import SiteLayout from '../../Layout/SiteLayout';

import './Domains.module.css';
import { set } from 'numeral';
const moment = require('moment');

const DomainsPage = (props) => {
    const [data, setData] = useState([
        {
            key: '1',
            id: 1,
            domain: 'vov.vn',
            last_update: 1608488868000,
            crawled: 34,
        },
        {
            key: '2',
            id: 2,
            domain: 'vnexpress.net',
            last_update: 1608402468000,
            crawled: 54,
        },
        {
            key: '3',
            id: 3,
            domain: 'nhandan.com.vn',
            last_update: 1608575268000,
            crawled: 12,
        },
        {
            key: '4',
            id: 4,
            domain: 'thanhnien.com',
            last_update: 1608575268000,
            crawled: 44,
        },
        {
            key: '5',
            id: 5,
            domain: 'vnanet.vn',
            last_update: 1608661668000,
            crawled: 92,
        },
    ]);
    const [dataSource, setDataSource] = useState(data);
    const [count, setCount] = useState(data.length + 1);
    const [value, setValue] = useState('');
    const [selectedDomain, setSeletedDomain] = useState([]);
    const [isAdding, setIsAdding] = useState(false);

    const timeformat = (last_update) => {
        const d = new Date(last_update);
        return moment(d).format('DD/MM/YYYY');
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
            dataIndex: 'domain',
            key: 'domain',
            sorter: (a, b) => a.domain.localeCompare(b.domain),
        },
        {
            title: 'Last Update',
            dataIndex: 'last_update',
            key: 'last_update',
            render: (last_update) => timeformat(last_update),
            sorter: (a, b) => a.last_update - b.last_update,
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
            value={ value }
            onChange={ (e) => {
                const currValue = e.target.value;
                setValue(currValue);
                const filteredData = data.filter((entry) =>
                    entry.domain.includes(currValue)
                );
                setDataSource(filteredData);
            } }
        />
    );

    const addDomain = (domain) => {
        const newData = {
            id: count,
            key: count,
            domain: domain,
            last_update: new Date(),
            crawled: 0,
        };
        setDataSource([...dataSource, newData]);
        setCount(count + 1);
        setData([...data, newData]);
    };

    const deleteDomain = (id) => {
        setDataSource(
            dataSource.filter((domain) => domain.id !== parseInt(id))
        );
        console.log(dataSource);
    };

    return (
        <React.Fragment>
            <SiteLayout>
                <PageTitle
                    heading='Domains'
                    subheading='Create new content...'
                    icon='pe-7s-home icon-gradient bg-happy-itmeo'
                />

                <Card className='domain-table-card'>
                    <div style={ { float: 'right' } }>
                        <Button onClick={ () => handleAddButtonClick() }>
                            Add domain
                        </Button>

                        <Button> Edit domain</Button>

                        <Button onClick={ () => deleteDomain(selectedDomain) }>
                            Delete domain
                        </Button>

                        { isAdding && (
                            <div>
                                <Input
                                    placeholder='Type in and press Enter to add domain...'
                                    onKeyPress={ (event) => {
                                        if (event.key === 'Enter') {
                                            addDomain(event.target.value);
                                            setIsAdding(false);
                                        }
                                    } }></Input>
                                <i className='ps-7s-plus'></i>
                            </div>
                        ) }
                    </div>

                    { FilterByNameInput }

                    <Table
                        className='table-striped-rows'
                        rowSelection={ {
                            type: 'checkbox',
                            ...rowSelection,
                        } }
                        dataSource={ dataSource }
                        columns={ columns }></Table>
                </Card>
            </SiteLayout>
        </React.Fragment>
    );
};

export default DomainsPage;
