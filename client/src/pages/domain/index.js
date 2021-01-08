import './Domains.module.css';

import React, { useEffect, useState, useRef } from 'react';
import PageTitle from '../../layout/site-layout/main/PageTitle';
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

import SiteLayout from '../../layout/site-layout';
import domainAPI from '../../api/domain';

import { useTranslation } from 'react-i18next';

import { formatDate } from '../../utils/date';

import { STATUS_CODES } from '../../constants';

const DomainsPage = (props) => {
    
    const { t } = useTranslation(['common']);

    const [domainList, setDomainList] = useState({
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
        total: domainList.total,
        defaultPageSize: pagination.pagination__perPage,

        showTotal: (total, range) => `${range[0]} to ${range[1]} of ${total}`,
    };

    useEffect(() => {
        searchDomain();
    }, [ pagination.pagination__page, pagination.pagination__perPage ]);

    const addDomain = async (domainName) => {

        let _newDomainData = {
            name: domainName
        }

        await domainAPI.create(_newDomainData);
        
        reload();
    };

    const updateDomain = async (id, domain) => {

        if (domain == '' || domain == null) {
            message.error(t('domain.nameNotNull'));
        } else {

            let data = {
                name: domain,
                id: id,
            };

            let result = await domainAPI.update(data);

            if (result.code == STATUS_CODES.success) {
                message.success(t('updateSuccess'))
                reload();
            }
        }
    };

    const searchDomain = async () => {

        let data = {
            name: searchInput || '',
            ...pagination
        };

        let result = await domainAPI.search(data);
        
        setDomainList({
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

    const deleteDomain = (id) => {
        id?.forEach((item) => domainAPI.delete(item));
        searchDomain();
    };

    const reload = () => {
        searchDomain();
    };

    const crawlDomain = () => {
        return '';
    }

    const columns = [
        {
            title: t('domain.title'),
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name, domain) => (
                <Tooltip
                    trigger={ ['focus'] }
                    title={ t('domain.inputAdd') }
                    placement='topLeft'>
                    <Input
                        className='domain-input'
                        defaultValue={name}
                        onPressEnter={ event => {
                            updateDomain(domain.id, event.target.value)
                        }
                    }/> 
                </Tooltip>
            ),
        },
        {
            title: t('domain.lastUpdate'),
            dataIndex: 'created_time',
            key: 'created_time',
            render: (created_time) => formatDate(created_time),
            sorter: (a, b) => a.created_time - b.created_time,
        },
        {
            title: t('domain.crawledDocuments'),
            dataIndex: 'crawled',
            key: 'crawled',
            sorter: (a, b) => a.crawled - b.crawled,
        },
        {
            title: t('domain.crawl'),
            dataIndex: '',
            key: 'x',
            render: () => (
                <Button 
                    type='primary' 
                    onClick={ crawlDomain }>
                    { t('domain.crawl') }
                </Button>
            ),
        },
    ];

    return (
        <React.Fragment>
            <SiteLayout>
                <PageTitle
                    heading={ t('domain.title' )}
                    // subheading='Create new content...'
                    icon='pe-7s-home icon-gradient bg-happy-itmeo'
                />

                <Card className='domain-table-card'>
                    <div style={{ float: 'right' }}>
                        <Button onClick={() => setIsAdding(!isAdding)}>
                            { t('domain.addDomain') }
                        </Button>

                        <Button onClick={() => deleteDomain(selectedDomain)} danger>
                            { t('domain.deleteDomain') }
                        </Button>

                        { isAdding && (
                            <div>
                                <Input
                                    style={{ margin: '10px 0' }}
                                    placeholder={ t('domain.inputAdd') }
                                    onPressEnter={ event => {
                                        addDomain(event.target.value);
                                    }}
                                />
                                <i className='ps-7s-plus'></i>
                            </div>
                        ) }
                    </div>

                    <Input
                        placeholder={ t('domain.searchBox') }
                        className='search-input-box'
                        onChange={ (e) => { setSearchInput(e.target.value) }}
                        onPressEnter={event => searchDomain(event.target.value)}
                    />

                    <Table
                        className='table-striped-rows'
                        rowSelection={{
                            type: 'checkbox'
                        }}
                        dataSource={ domainList.items.map(d => ({...d, key: d.id})) }
                        columns={ columns }
                        pagination={ paginationOptions }>
                    </Table>
                </Card>
            </SiteLayout>
        </React.Fragment>
    );
};

export default DomainsPage;
