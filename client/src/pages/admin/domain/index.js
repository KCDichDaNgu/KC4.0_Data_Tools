import './style.module.scss';

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
    message,
    Modal,
    Select,
    Row,
    Col,
    Spin
} from 'antd';

import { WarningOutlined } from '@ant-design/icons';

import SiteLayout from '../../../layout/site-layout';
import domainAPI from '../../../api/admin/domain';

import { useTranslation } from 'react-i18next';

import { formatDate } from '../../../utils/date';

import { LANGS, STATUS_CODES } from '../../../constants';


const DomainPage = (props) => {
    
    const { t } = useTranslation(['common']);

    const [domainList, setDomainList] = useState({
        items: [],
        total: 0,
        page: 1,
        perPage: 5,
    });

    const [searchInput, setSearchInput] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [selectedDomainsId, setSelectedDomainsId] = useState([]);
    const [intervalCheckCrawlList, setIntervalCheckCrawlList] = useState([]);

    const [pagination, setPagination] = useState({
        pagination__page: 1,
        pagination__perPage: 5
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            checkCrawlingInterval(domainList.items);
        }, 5000);

        return () => {
            clearTimeout(timer);
        };
    }, [domainList]);

    const langList2 = LANGS.filter(e => (e.value != 'vi'));

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

    const addDomain = async (domainUrl) => {

        let _newDomainData = {
            url: domainUrl
        }

        await domainAPI.create(_newDomainData);
        
        reload();
    };

    const updateDomain = async (id, domain) => {

        if (domain == '' || domain == null) {
            message.error(t('domainPage.urlNotNull'));
        } else {

            let data = {
                url: domain,
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
            url: searchInput || '',
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

    const openDeleteModal = () => {
        Modal.confirm({
            icon: <WarningOutlined />,
            content: <div style={{ display: 'flex' }}>{ t('modalMessages.warning.deleteDomain') }</div>,
            onOk() {
                deleteDomains()
            },
            onCancel() { },
        });
    }

    const deleteDomains = () => {

        selectedDomainsId?.forEach(async (item) => await domainAPI.delete(item));
        
        searchDomain();
    };

    const reload = () => {
        searchDomain();
    };

    const checkCrawlingInterval = (domains) => {
        intervalCheckCrawlList.map((job) => {
            if (job !== null) {
                clearInterval(job);
            }
        });

        let jobs = domains.map((domain, idx) => {

            let intervalId = setInterval(() => {
                if (domain.job_id !== null && domain.job_id !== undefined) {
                    domainAPI.checkStatusBitextor(domain.id).then(res => {
                        if (res.data.code == process.env.REACT_APP_CODE_SUCCESS) {
                            if (res.data.data.job_id !== domain.job_id)
                                setDomainListCrawlingStatus(domain.id, res.data.data.job_id);
                        } else {
                            if (res.data.message === 'jobNotFound') {
                                setDomainListCrawlingStatus(domain.id, null);
                            }
                        } 
                    });
                }
            }, 5000);

            return intervalId;
        });

        setIntervalCheckCrawlList(jobs);
    }

    const crawlDomain = (domain) => {
        domainAPI.crawl({
            'lang': domain.lang,
            'id': domain.id
        }).then(res => {
            if (res.data.code == process.env.REACT_APP_CODE_SUCCESS) {
                domain.job_id = res.data.job_id;
            } else {
                message.error(t(`domainPage.${res.data.message}`));
            }
        });
    }

    const setDomainListCrawlingStatus = (domain_id, job_id) => {
        let domains = domainList.items.map((domain) => {
            if (domain.id === domain_id) {
                domain.job_id = job_id;
                return domain;
            } else {
                return domain;
            }
        });

        let newDomainList = {
            ...domainList,
            items: domains
        };

        setDomainList(newDomainList);
    }
    
    const renderCrawling = (domain) => {
        domain.lang = langList2[0].value;

        if (domain.job_id !== null && domain.job_id !== undefined) {
            return (
                <div className="text-center">
                    <Spin></Spin>
                    <i style={{ marginLeft: '10px', display: 'inline-block' }}>
                        { t('domainPage.crawling') }
                    </i>
                </div>
            );
        } else {
            return (
                <Row>
                    <Col xs={ 12 }>
                        <Select
                            key={ domain.id }
                            style={{
                                width: '100%',
                            }}
                            
                            onChange={ e => domain.lang = e }
                            defaultValue={ langList2[0].value }
                            // value={ domain.lang }
                            options={ 
                                langList2.map(e => ({
                                    value: e.value, 
                                    label: t(`Language.${e.label}`)
                                })
                            )}>
                        </Select>
                    </Col>
                    <Col xs={ 12 }>
                        <Button 
                            type='primary' 
                            onClick={ () => crawlDomain(domain) }>
                            { t('domainPage.crawl') }
                        </Button>
                    </Col>
                </Row>
            );
        }
    }

    const columns = [
        {
            title: t('domainPage.title'),
            dataIndex: 'url',
            key: 'url',
            sorter: (a, b) => a.url.localeCompare(b.url),
            render: (url, domain) => (
                <Tooltip
                    trigger={ ['focus'] }
                    title={ t('domainPage.inputAdd') }
                    placement='topLeft'>
                    <Input
                        className='domain-input'
                        defaultValue={ url }
                        onPressEnter={ event => {
                            updateDomain(domain.id, event.target.value)
                        }
                    }/> 
                </Tooltip>
            ),
        },
        {
            title: t('domainPage.lastUpdate'),
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (updated_at) => formatDate(updated_at),
            // sorter: (a, b) => a.updated_at - b.updated_at,
        },
        {
            title: t('domainPage.crawledDocuments'),
            dataIndex: 'inserted_documents_count',
            key: 'inserted_documents_count',
            sorter: (a, b) => a.inserted_documents_count - b.inserted_documents_count
        },
        {
            title: t('domainPage.crawl'),
            dataIndex: 'job_id',
            key: 'job_id',
            render: (job_id, domain) => renderCrawling(domain),
        },
    ];

    return (
        <React.Fragment>
            <SiteLayout>
                <PageTitle
                    heading={ t('domainPage.title' )}
                    // subheading='Create new content...'
                    icon='pe-7s-home icon-gradient bg-happy-itmeo'
                />

                <Card className='domain-table-card'>
                    <div style={{ float: 'right' }}>
                        <Button onClick={() => setIsAdding(!isAdding)}>
                            { t('domainPage.addDomain') }
                        </Button>

                        <Button 
                            onClick={() => openDeleteModal()}
                            disabled={ selectedDomainsId.length == 0 } 
                            danger>
                            { t('domainPage.deleteDomain') }
                        </Button>

                        { isAdding && (
                            <div>
                                <Input
                                    style={{ margin: '10px 0' }}
                                    placeholder={ t('domainPage.inputAdd') }
                                    onPressEnter={ event => {
                                        addDomain(event.target.value);
                                    }}
                                />
                                <i className='ps-7s-plus'></i>
                            </div>
                        ) }
                    </div>

                    <Input
                        placeholder={ t('domainPage.searchBox') }
                        className='search-input-box'
                        onChange={ (e) => { setSearchInput(e.target.value) }}
                        onPressEnter={ event => searchDomain(event.target.value) }
                    />

                    <Table
                        className='table-striped-rows'
                        rowSelection={{
                            type: 'checkbox',
                            onChange: (selectedRowKeys) => {
                                setSelectedDomainsId(selectedRowKeys)
                            },
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

export default DomainPage;
