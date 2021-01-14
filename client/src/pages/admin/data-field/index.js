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
    Modal
} from 'antd';

import { WarningOutlined } from '@ant-design/icons';

import SiteLayout from '../../../layout/site-layout';
import dataFieldAPI from '../../../api/admin/data-field';

import { useTranslation } from 'react-i18next';

import { formatDate } from '../../../utils/date';

import { STATUS_CODES } from '../../../constants';

const DataFieldPage = (props) => {
    
    const { t } = useTranslation(['common']);

    const [dataFieldList, setDataFieldList] = useState({
        items: [],
        total: 0,
        page: 1,
        perPage: 5,
    });

    const [searchInput, setSearchInput] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [selectedDataFieldsId, setSelectedDataFieldsId] = useState([]);

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
        total: dataFieldList.total,
        defaultPageSize: pagination.pagination__perPage,

        showTotal: (total, range) => `${range[0]} to ${range[1]} of ${total}`,
    };

    useEffect(() => {
        searchDataField();
    }, [ pagination.pagination__page, pagination.pagination__perPage ]);

    const addDataField = async (dataFieldName) => {

        let _newDataFieldData = {
            name: dataFieldName
        }

        await dataFieldAPI.create(_newDataFieldData);
        
        reload();
    };

    const updateDataField = async (id, dataField) => {

        if (dataField == '' || dataField == null) {
            message.error(t('dataFieldPage.nameNotNull'));
        } else {

            let data = {
                name: dataField,
                id: id,
            };

            let result = await dataFieldAPI.update(data);

            if (result.code == STATUS_CODES.success) {
                message.success(t('updateSuccess'))
                reload();
            }
        }
    };

    const searchDataField = async () => {

        let data = {
            name: searchInput || '',
            ...pagination
        };

        let result = await dataFieldAPI.search(data);
        
        setDataFieldList({
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
            content: <div style={{ display: 'flex' }}>{ t('modalMessages.warning.deleteDataField') }</div>,
            onOk() {
                deleteDataFields()
            },
            onCancel() { },
        });
    }

    const deleteDataFields = () => {

        selectedDataFieldsId?.forEach(async (item) => await dataFieldAPI.delete(item));
        
        searchDataField();
    };

    const reload = () => {
        searchDataField();
    };

    const crawlDataField = () => {
        return '';
    }

    const columns = [
        {
            title: t('dataFieldPage.title'),
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name, dataField) => (
                <Tooltip
                    trigger={ ['focus'] }
                    title={ t('dataFieldPage.inputAdd') }
                    placement='topLeft'>
                    <Input
                        className='dataFieldPage-input'
                        defaultValue={ name }
                        onPressEnter={ event => {
                            updateDataField(dataField.id, event.target.value)
                        }
                    }/> 
                </Tooltip>
            ),
        },
        {
            title: t('dataFieldPage.lastUpdate'),
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (updated_at) => formatDate(updated_at),
            // sorter: (a, b) => a.updated_at - b.updated_at,
        },
        // {
        //     title: t('dataFieldPage.crawledDocuments'),
        //     dataIndex: 'crawled',
        //     key: 'crawled',
        //     sorter: (a, b) => a.crawled - b.crawled,
        // },
        // {
        //     title: t('dataFieldPage.crawl'),
        //     dataIndex: '',
        //     key: 'x',
        //     render: () => (
        //         <Button 
        //             type='primary' 
        //             onClick={ crawlDataField }>
        //             { t('dataFieldPage.crawl') }
        //         </Button>
        //     ),
        // },
    ];

    return (
        <React.Fragment>
            <SiteLayout>
                <PageTitle
                    heading={ t('dataFieldPage.title' )}
                    // subheading='Create new content...'
                    icon='pe-7s-home icon-gradient bg-happy-itmeo'
                />

                <Card className='dataFieldPage-table-card'>
                    <div style={{ float: 'right' }}>
                        <Button onClick={() => setIsAdding(!isAdding)}>
                            { t('dataFieldPage.addDataField') }
                        </Button>

                        {/* <Button 
                            onClick={() => openDeleteModal()}
                            disabled={ selectedDataFieldsId.length == 0 } 
                            danger>
                            { t('dataFieldPage.deleteDataField') }
                        </Button> */}

                        { isAdding && (
                            <div>
                                <Input
                                    style={{ margin: '10px 0' }}
                                    placeholder={ t('dataFieldPage.inputAdd') }
                                    onPressEnter={ event => {
                                        addDataField(event.target.value);
                                    }}
                                />
                                <i className='ps-7s-plus'></i>
                            </div>
                        ) }
                    </div>

                    <Input
                        placeholder={ t('dataFieldPage.searchBox') }
                        className='search-input-box'
                        onChange={ (e) => { setSearchInput(e.target.value) }}
                        onPressEnter={ event => searchDataField(event.target.value) }
                    />

                    <Table
                        className='table-striped-rows'
                        rowSelection={{
                            type: 'checkbox',
                            onChange: (selectedRowKeys) => {
                                setSelectedDataFieldsId(selectedRowKeys)
                            },
                        }}
                        dataSource={ dataFieldList.items.map(d => ({...d, key: d.id})) }
                        columns={ columns }
                        pagination={ paginationOptions }>
                    </Table>
                </Card>
            </SiteLayout>
        </React.Fragment>
    );
};

export default DataFieldPage;
