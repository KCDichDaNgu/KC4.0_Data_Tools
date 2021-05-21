import './style.module.scss';

import 'moment/locale/vi';

import React, { forwardRef, useEffect, useState } from 'react';
import singleLanguageDataAPI from '../../api/single-language-data';

import {
    Table,
    Button,
    Select,
    Modal,
    Spin,
    Card,
    Row,
    Col,
} from 'antd';

import { UploadOutlined, DownloadOutlined, DeleteTwoTone } from '@ant-design/icons';

import { ToastContainer, toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/date';
import { clonedStore } from '../../store';

import ImportFileModal from './import-file-modal';
import { LANGS, STATUS_CODES } from '../../constants';
import { isAdmin, isReviewer } from '../../utils/auth';
import CustomTextArea from '../../components/custom-textarea';
import ConfirmDeleteModal from './confirm-delete-modal/index';

import assignmentAPI from '../../api/assignment';

const FileDownload = require('js-file-download');

const SentenceReview = forwardRef((props, ref) => {

    const { t } = useTranslation(['common']);

    const currentUserId = clonedStore.getState().User?.profile?.id;
    const currentUserRoles = clonedStore.getState().User?.profile?.roles || [];

    const [dataSource, setDataSource] = useState([]);
    const [paginationParams, setPaginationParams] = useState({});
    const [exporting, setExporting] = useState(false);
    const [deleteData, setDeleteData] = useState({});
    const [isConfirmDeleteModalVisible, setIsConfirmDeleteModalVisible] = useState(false);

    const [filter, setFilter] = useState({
        lang: '',
        page: 1,
        size: 5,
    });

    const [isModalImportVisible, setIsModalImportVisible] = useState(false);

    const renderText = (key, data) => {

        let lastestContent = data[key];
        const maxChar = 200;
        const exceedMaxChar = lastestContent.length > maxChar;
        let disabled = true;

        return (
            <CustomTextArea
                className={ disabled && isAdminOnly() ? 'input-admin-disable' : '' }
                style={{ border: 'none' }}
                autoSize
                defaultValue={
                    exceedMaxChar
                    ? `${lastestContent.substring(0, maxChar + 1)}...`
                    : lastestContent
                }
                onResize={({ width, height }) => {
                    return height + 10;
                }} 
                disabled={ true }
            />
        );
    }

    const allowImportFiles = () => {
        return isAdmin() || isReviewer()
    }

    const allowExport = () => {
        return isAdmin()
    }

    const columns = [
        {
            title: t('singleLanguageDataPage.doc'),
            dataIndex: 'sentence_data',
            key: 'sentence_data',
            render: data => {
                return (
                    <React.Fragment>
                        { renderText('content', data) }
                        {/* <Button
                            type='link'
                            onClick={ () => showFullDocModal(data) }
                            style={{
                                position: 'absolute',
                                bottom: '4px',
                                padding: 0,
                                zIndex: 1 
                            }}
                        >
                            { t('documentPage.showFull') }
                        </Button> */}
                    </React.Fragment>
                )
            },
            width: '50%',
        },
        {
            title: t('singleLanguageDataPage.source'),
            dataIndex: 'source',
            key: 'source',
            render: data => {
                return (
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>
                        { data }
                    </div>
                )
            },
            width: '10%',
            align: 'center'
        },
        {
            title: t('singleLanguageDataPage.field'),
            dataIndex: 'data_field',
            key: 'data_field',
            render: data => {
                return (
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>
                        { data.name }
                    </div>
                )
            },
            width: '10%',
            align: 'center',
        },
        {
            title: t('language'),
            dataIndex: 'sentence_data',
            key: 'sentence_data',
            render: data => {
                return (
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>
                        { t(`Language.${data.lang}`) }
                    </div>
                )
            },
            width: '10%',
            align: 'center'
        },
        {
            title: t('lastUpdatedDay'),
            key: 'updated_at',
            render: record => {
                return (
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>
                        { formatDate(record.updated_at)}
                    </div>
                )
            },
            width: '10%',
            align: 'center',
        },
        {
            title: t('singleLanguageDataPage.action'),
            dataIndex: "id",
            key: "id",
            render: id => (
                <div
                    style={{display: 'flex', justifyContent: 'space-evenly'}}
                    target='_blank'>
                    {/* <a href={`${singleLanguageDataAPI.downloadURL}/${id}`}> */}
                        <Button 
                            type="primary" 
                            shape="round"
                            style={{display: "flex", alignItems: "center", fontSize: "18px"}} 
                            onClick={async () => {
                                let res = await singleLanguageDataAPI.downloadFile(id)
                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                const fileName = `${+ new Date()}.zip`
                                link.setAttribute('download', fileName);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                            }}
                            icon={<DownloadOutlined />} >
                        </Button>
                    {/* </a> */}
                    <Button 
                        type="link" 
                        icon={<DeleteTwoTone twoToneColor="red" style={{fontSize: '18px'}}/>} 
                        size='small'
                        onClick={() => {
                            setDeleteData({id: id})
                            setIsConfirmDeleteModalVisible(true)
                        }}
                        block>
                    </Button>
                </div>
            ),
            width: '10%',
            align: 'center'
        }
    ];

    const handleFilterChange = async (searchData, key) => {
        let cloneFilter = null
        if (key == 'text') {
            cloneFilter = {
                ...filter,
                text1: searchData,
                text2: searchData
            }
        } else if (key == 'updatedAt') {

            let fromDate = searchData == null ? null : searchData[0].valueOf();
            let toDate = searchData == null ? null : searchData[1].valueOf();

            cloneFilter = {
                ...filter,
                updatedAt__fromDate: fromDate,
                updatedAt__toDate: toDate
            }

        } else {
            cloneFilter = {
                ...filter,
                [key]: searchData
            }
        }
        if (cloneFilter){
            setFilter({
                ...cloneFilter,
                page: 1
            })
        }
        let res = await singleLanguageDataAPI.get(cloneFilter)
        setDataSource(res.data.data.single_sentences);
        setPaginationParams(res.data.data.pagination);
    };

    const [langList, setLangList] = useState([]);

    useEffect(() => {

        const fetchData = async () => {

            let cloneFilter = JSON.parse(JSON.stringify(filter))

            if (isAdmin()) {
                setLangList([
                    {
                        value: '',
                        label: 'all'
                    }
                ].concat(LANGS))
            } else {
                let result = await assignmentAPI.owner()

                let langs = []

                if (result.code == STATUS_CODES.success) {
                    for (const langPair of result.data.lang_scope) {
                        langs.push({
                            value: langPair.lang2,
                            label: langPair.lang2
                        })
                    }
                }

                setLangList(langs)

                cloneFilter = {
                    ...filter,
                    lang: langs[0]?.value
                }

                setFilter(cloneFilter)
            }

            let res = await singleLanguageDataAPI.get(cloneFilter)

            setDataSource(res.data.data.single_sentences);
            setPaginationParams(res.data.data.pagination);
        }

        fetchData()
    }, []);

    const handleTableChange = (pagination, filters, sorter) => {

        let params = {
            ...filter,
            sortBy: sorter['columnKey'],
            sortOrder: sorter['order'],
            page: pagination['current']
        }

        paraSentenceAPI.getSentences(params).then((res) => {
            setDataSource(res.data.data.para_sentences);
            setPaginationParams(res.data.data.pagination);
        });
    }

    const isAllowedToEdit = (paraSentence) => {
        // if current user roles contains admin only -> can not edit
        if (isAdminOnly()) return false;

        // if editted by reviewer and current user is editor -> can not edit
        return !(paraSentence.editor && paraSentence.editor.roles &&
            (paraSentence.editor.roles.includes('admin') || paraSentence.editor.roles.includes('reviewer')) &&
            currentUserRoles.includes('member'))
    }

    const isAdminOnly = () => {
        return currentUserRoles.length == 1 && isAdmin();
    }

    const getTableRowClassName = (paraSentence) => {

        let className = '';

        if (isAllowedToEdit(paraSentence)) {
            if (!paraSentence.editor?.id) className = '';
            else if (paraSentence.editor.id === currentUserId) className = 'edited-by-my-self';
            else if (paraSentence.editor.id !== currentUserId) className = 'edited-by-someone';
        }

        return className;
    }

    return (
        <React.Fragment>
            <Card
                style={{ marginBottom: '40px' }}
            >
                <Row
                    gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                    style={{ position: 'relative' }}>

                    <Col
                        style={{ marginBottom: '20px' }}
                        xs={24}
                        md={isAdmin() || isReviewer() ? 6 : 8}
                    >
                        
                            <div style={{
                                marginBottom: '5px',
                                fontSize: '20px',
                                fontWeight: 500
                            }}>
                                {t('singleLanguageDataPage.corpus')}
                            </div>

                            <Select
                                style={{
                                    width: '100%',
                                }}
                                options={ langList.map(e => {
                                    if (e.value === '') {
                                        return {
                                            value: '', 
                                            label: t('all')
                                        }
                                    } 

                                    return {
                                        value: e.value, 
                                        label: t(`Language.${e.label}`)
                                    }
                                }) }
                                value={ filter.lang }
                                onChange={ value => handleFilterChange(value, 'lang') }
                            />
                       
                    </Col>

                    <Col className='import-export-buttons-wrapper' xs={24} md={10}>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {
                                allowImportFiles() ? (
                                    <Button
                                        style={{ display: "flex", alignItems: "center", fontSize: "15px", marginRight: "10px" }}
                                        onClick={() => setIsModalImportVisible(!isModalImportVisible)}
                                        icon={<UploadOutlined />}
                                    >
                                        { t('sentencePage.uploadFile')}
                                    </Button>
                                ) : ''
                            }

                            {
                                allowExport() ? (
                                    <Button 
                                        style={{ fontSize: "15px" }} 
                                        onClick={async () => {
                                            let res = await singleLanguageDataAPI.exportCorpus({lang: filter.lang})
                                            const url = window.URL.createObjectURL(new Blob([res.data]));
                                            const link = document.createElement('a');
                                            link.href = url;
                                            const fileName = `${+ new Date()}.zip`
                                            link.setAttribute('download', fileName);
                                            document.body.appendChild(link);
                                            link.click();
                                            link.remove();
                                        }}
                                    >
                                        { t('sentencePage.exportData')}
                                    </Button>
                                ) : ''
                            }
                            {
                                allowExport() && exporting ? (
                                    <div style={{ marginLeft: '10px' }}>
                                        <Spin />
                                    </div>
                                ) : ''
                            }
                        </div>
                    </Col>
                </Row>
            </Card>

            <Card className='card-body-padding-0'>
                <Table
                    scroll={{ x: 'max-content' }}
                    rowKey={record => record.id}
                    rowClassName={record => getTableRowClassName(record)}
                    style={{ padding: "0px 0px" }}
                    // expandable={{
                    //     expandedRowRender: record => {
                    //         return (
                    //             <div style={{
                    //                 padding: '20px'
                    //             }}>
                    //                 <div style={{ marginBottom: '20px' }}>
                    //                     <label
                    //                         style={{
                    //                             fontSize: '16px',
                    //                             marginBottom: '10px',
                    //                             fontWeight: 600
                    //                         }}>
                    //                         {t('originalText')} {t(record.original_para_sentence.text1.lang)}
                    //                     </label>
                    //                     <div>
                    //                         {record.original_para_sentence.text1.content}
                    //                     </div>
                    //                 </div>

                    //                 <div style={{ marginBottom: '20px' }}>
                    //                     <label
                    //                         style={{
                    //                             fontSize: '16px',
                    //                             marginBottom: '10px',
                    //                             fontWeight: 600
                    //                         }}>
                    //                         {t('originalText')} {t(record.original_para_sentence.text2.lang)}
                    //                     </label>

                    //                     <div>
                    //                         {record.original_para_sentence.text2.content}
                    //                     </div>
                    //                 </div>

                    //                 <div style={{ marginBottom: '20px' }}>
                    //                     <label
                    //                         style={{
                    //                             fontSize: '16px',
                    //                             marginBottom: '10px',
                    //                             fontWeight: 600
                    //                         }}>
                    //                         {t('sentencePage.lastUpdate')} {t('sentencePage.by')}
                    //                         &nbsp;{record.editor?.id === currentUserId ? t('sentencePage.you') : record.editor.username}
                    //                     </label>

                    //                     <div>
                    //                         {formatDate(record.updated_at)}
                    //                     </div>
                    //                 </div>

                    //                 <div>
                    //                     <label
                    //                         style={{
                    //                             fontSize: '16px',
                    //                             marginBottom: '10px',
                    //                             fontWeight: 600
                    //                         }}>
                    //                         {t('sentencePage.createdTime')}
                    //                     </label>
                    //                     <div>
                    //                         {formatDate(record.created_at)}
                    //                     </div>
                    //                 </div>
                    //             </div>
                    //         )
                    //     },
                    //     rowExpandable: record => { return !!record.editor?.id },
                    // }}
                    dataSource={dataSource}
                    columns={columns}
                    onChange={handleTableChange}
                    pagination={{
                        pageSize: paginationParams.page_size,
                        total: paginationParams.total_items,
                        current: paginationParams.current_page
                    }}
                    footer={() => (
                        <div style={{ float: "right" }}>
                            <div style={{ lineHeight: "32px" }}>
                                {`${t('total')} ${paginationParams.total_items} ${t('records').toLowerCase()}`}
                            </div>
                        </div>
                    )}>
                </Table>
            </Card>

            { allowImportFiles() ?
                <ImportFileModal
                    isModalImportVisible={isModalImportVisible}
                    setIsModalImportVisible={setIsModalImportVisible}
                    reloadSentenceData={setDataSource}
                    reloadSentencePaginationParams={setPaginationParams}
                    currentFilter={filter}
                    toast={toast}    
                >
                </ImportFileModal>
                : null
            }
            
            { isAdmin() ?
                <ConfirmDeleteModal
                    key={ 1 }
                    isVisible={ isConfirmDeleteModalVisible }
                    setVisible={ setIsConfirmDeleteModalVisible }
                    deleteData={ deleteData }
                    toast={ toast }
                    reloadSentenceData={ setDataSource }
                    reloadPaginationParams={ setPaginationParams }
                    currentFilter={ filter }
                    currentPagination = { paginationParams }
                    deleteAPI = {singleLanguageDataAPI.deleteById}
                    loadDataAPI = {singleLanguageDataAPI.get}
                /> 
                : null
            }
            <ToastContainer />
        </React.Fragment>
    );
});

export default SentenceReview;
