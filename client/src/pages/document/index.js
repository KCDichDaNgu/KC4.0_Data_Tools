import './style.module.scss';

import React, { useEffect, useState, useRef } from 'react';
import PageTitle from '../../layout/site-layout/main/PageTitle';
import {
    Input,
    Table,
    Button,
    Modal,
    Popconfirm,
    Card,
    message,
    Dropdown,
    Menu,
    Select,
    Radio,
    Row,
    Col,
    DatePicker
} from 'antd';
import SiteLayout from '../../layout/site-layout';

import { UploadOutlined, DeleteOutlined, ExclamationCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/date';
import { clonedStore } from '../../store';
import { isAdmin, isEditor, isReviewer } from '../../utils/auth';
import { LANGS, STATUS_CODES } from '../../constants';
import CustomTextArea from '../../components/custom-textarea';
import CustomCol from '../../components/custom-modal-column';
import locale from 'antd/es/date-picker/locale/vi_VN';
import UserSelect from '../../components/user-select';

import assignmentAPI from '../../api/assignment';
import ParaDocumentAPI from '../../api/document';
import AddingDocumentModal from './add-doc-modal';

const alignmentTypes = {
    fromNewPairs: 'fromNewPairs',
    fromSavedPairs: 'fromSavedPairs'
}

const { Option } = Select;

const moment = require('moment');

const DocumentPage = (props) => {

    const { t, i18n } = useTranslation(['common']);

    const currentUserId = clonedStore.getState().User?.profile?.id;
    const currentUserRoles = clonedStore.getState().User?.profile?.roles || [];

    const [dataSource, setDataSource] = useState([]);
    
    const [paginationParams, setPaginationParams] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});

    const [alignmentType, setAlignmentType] = useState(alignmentTypes.fromNewPairs)

    const [chosenDocForAlignment, setChosenDocForAlignment] = useState(null)

    const [filter, setFilter] = useState({
        domain: '',
        text1: '',
        text2: '',
        rating: 'unRated',
        lang1: 'vi',
        lang2: '',
        sortBy: 'created_at',
        sortOrder: 'descend',
        page: '',
        updatedAt__fromDate: '',
        updatedAt__toDate: '',
        score__from: '',
        score__to: '',
        creatorId: '',
        alignment_status: 'all'
    });

    // sử dụng useRef để gọi function setSelectedUser trong UserSelect,
    // sử dụng khi người dùng bấm xem chi tiết ở tab report, fill user_name vào select.
    const userSelectRef = useRef();

    const [langList2, setLangList2] = useState([]);
    const [ratingList, setRatingList] = useState([]);
    const [alignmentStatusList, setAlignmentStatusList] = useState([]);

    const [isAddingModalVisible, setIsAddingModalVisible] = useState(false);

    const ratingOption = [
        <Select.Option key='all'>{ t('documentPage.all') }</Select.Option>
    ].concat(
        ratingList.map((rating) => {
            return <Select.Option key={rating}>{ t(`documentPage.${rating}`) }</Select.Option>;
        })
    );

    const alignmentStatusOptions = [
        <Select.Option key='all'>{ t('documentPage.all') }</Select.Option>
    ].concat(
        alignmentStatusList.map((status) => {
            return <Select.Option key={status}>{ t(`documentPage.${status}`) }</Select.Option>;
        })
    );

    useEffect(() => {

        const fetchData = async () => {

            let cloneFilter = JSON.parse(JSON.stringify(filter))

            if (isAdmin()) {
                setLangList2([
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

                setLangList2(langs)

                cloneFilter = {
                    ...filter,
                    lang2: langs[0]?.value
                }

                setFilter(cloneFilter)
            }
            
            let res1 = await ParaDocumentAPI.getDocuments(cloneFilter)

            setDataSource(res1.data.data.para_documents);
            setPaginationParams(res1.data.data.pagination);
    
            let res2 = await ParaDocumentAPI.getOptions()

            setRatingList(res2.data.data.rating);
            setAlignmentStatusList(res2.data.data.alignment_status);
        }

        fetchData()
    }, []);

    const isAllowedToEdit = (paraDocument) => {
        // if current user roles contains admin only -> can not edit
        if (isAdminOnly()) return false;

        // if editted by reviewer and current user is editor -> can not edit
        return  !(paraDocument.editor && paraDocument.editor.roles &&
            (paraDocument.editor.roles.includes('admin') || paraDocument.editor.roles.includes('reviewer')) &&
            currentUserRoles.includes('member')) 
    }
    
    const isAdminOnly = () => {
        return currentUserRoles.length == 1 && isAdmin();
    }

    const getTableRowClassName = (paraDocument) => {

        let className = '';

        if (isAllowedToEdit(paraDocument)) {
            if (!paraDocument.editor?.id) className = '';
            else if (paraDocument.editor.id === currentUserId) className = 'edited-by-my-self';
            else if (paraDocument.editor.id !== currentUserId) className = 'edited-by-someone';
        }

        return className;
    }

    const columns = [
        {
            title: t(`Language.${filter.lang1}`) ,
            dataIndex: 'text1',
            key: 'text1',
            render: (text, paraDocument, index) => {
                return (
                    <React.Fragment>
                        { renderText('text1', paraDocument, index) }
                        <Button
                            type='link'
                            onClick={ () => showFullDocModal(paraDocument) }
                            style={{
                                position: 'absolute',
                                bottom: '4px',
                                padding: 0,
                                zIndex: 1 
                            }}
                        >
                            { t('documentPage.showFull') }
                        </Button>
                    </React.Fragment>
                );
            }
        },
        {
            title: filter.lang2 ? t(`Language.${filter.lang2}`) : 
                `${ t('Language.unknown') } 2`,
            dataIndex: 'text2',
            key: 'text2',
            render: (text, paraDocument, index) => renderText('text2', paraDocument, index)
        },
        {
            title: t('documentPage.information'),
            // dataIndex: 'creator',
            key: 'information',
            render: (record) => (
                <div>
                    { 
                        record.creator.id ? record.creator.username : t(`documentPage.${record.created_by}`)
                    } ({ formatDate(record.updated_at) })
                </div>
            ),
            align: 'center'
        },
        {
            title: `${t('documentPage.score')} / ${t('documentPage.rating')}`,
            // dataIndex: 'score',
            key: 'score',
            render: (record, index) => {
                return (
                    <div style={{
                        width: '100%',
                    }}>
                        <div style={{ 
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: 600,
                        }}>
                            { Number(record.score?.docAlign).toFixed(2) }
                        </div>
                        
                        <div>
                            { renderRating(record.rating, record, index) }
                        </div>
                    </div>
                )
            },
            sorter: (a, b, sortOrder) => { },
            width: '15%',
            sortDirections: ['ascend', 'descend', 'ascend'],
            align: 'center'
        },
        {
            title: t('documentPage.status'),
            dataIndex: 'alignment_status',
            key: 'score',
            render: (alignment_status, record, index) => {
                return (
                    <div style={{ textAlign: 'center' }}>
                        { renderAlignmentStatus(alignment_status, record, index) }
                    </div>
                )
            },
            align: 'center'
        },
        {
            title: t('documentPage.delete'),
            dataIndex: "delete",
            key: "delete",
            render: (row_value, paraDocument) => (
                <Button 
                    disabled={ !isAllowedToEdit(paraDocument) }
                    type="link" 
                    icon={<DeleteOutlined />} 
                    size='small'
                    onClick={() => openModelConfirmDelete(paraDocument)}
                    block>
                </Button>
                
            ),
            width: '5%',
            align: 'center'
        }
    ];

    const openModelConfirmDelete = (paraDocument) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: (
                <>
                    <p>
                        {t('documentPage.confirmDeleteContent')}
                    </p>
                </>
            ),
            onOk() {
                deleteParaDocument(paraDocument);
            }
        });
    }

    const deleteParaDocument = (paraDocument) => {
        ParaDocumentAPI.delete(paraDocument['id']).then(res => {
            if (res.data.code == process.env.REACT_APP_CODE_SUCCESS) {
                message.success(t('documentPage.deletedSuccess'));
                searchParaDocument();
            } else {
                message.error(t('documentPage.deletedFailure'));
            }
        })
    }

    const showFullDocModal = (paraDocument) => {
        Modal.info({
            content: (
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <CustomCol
                        lang={
                            t(`Language.${paraDocument.newest_para_document['text1'].lang}`)
                        }
                        documentContent={
                            paraDocument.newest_para_document['text1'].content
                        }
                        style={{ marginBottom: '20px' }}
                    />

                    <CustomCol
                        lang={
                            t(`Language.${paraDocument.newest_para_document['text2'].lang}`)
                        }
                        documentContent={
                            paraDocument.newest_para_document['text2'].content
                        }
                    />
                </Row>
            ),
            okText: t('documentPage.okText'),
            width: '80vw',
            style: { maxWidth: '950px' },
            icon: null,
            centered: true
        })
    }

    const renderText = (key, paraDocument, index) => {

        let lastestContent = paraDocument.newest_para_document[key].content;
        const maxChar = 100;
        const exceedMaxChar = lastestContent.length > maxChar;
        let disabled = !isAllowedToEdit(paraDocument);

        return (
            <CustomTextArea
                className={ disabled && isAdminOnly() ? 'input-admin-disable' : '' }
                style={{ border: 'none' }}
                key={ paraDocument['id'] }
                autoSize
                defaultValue={
                    exceedMaxChar
                    ? `${lastestContent.substring(0, maxChar + 1)}...`
                    : lastestContent
                }
                onPressEnter={ event => {
                    event.preventDefault();
                    updateParaDocument(paraDocument, key, event.target.value);
                }}
                onResize={({ width, height }) => {
                    return height + 10;
                }} 
                disabled={ true }
            />
        );
    }

    const renderRating = (rating, paraDocument, index) => {

        let lastestRating = paraDocument.newest_para_document.rating; // default notExist = unRated
        let disabled = !isAllowedToEdit(paraDocument);
        
        return (
            <Radio.Group
                key={ paraDocument['id'] } 
                value={ lastestRating }
                onChange={ event => updateParaDocument(paraDocument, 'rating', event.target.value) }
                disabled={ disabled }>
                {
                    ratingList.map((rating) => {
                        if (rating == 'unRated') {
                            if (lastestRating == 'unRated') {
                                return (
                                    <Radio.Button key={ rating } value={ rating }>?</Radio.Button>
                                );
                            }
                        } else {
                            return (
                                <Radio.Button key={ rating } value={ rating }>
                                    { t(`documentPage.${rating}`) }
                                </Radio.Button>
                            );
                        }
                    })
                }
            </Radio.Group>
        );
    }

    const renderAlignmentStatus = (status, paraDocument, index) => {

        if (status === 'not_aligned_yet') {
            
            if (paraDocument.newest_para_document.rating === 'good') {
                return (
                    <Button 
                        key={ paraDocument.id }
                        disabled={ !isAllowedToEdit(paraDocument) }
                        onClick={ () => {
                            setChosenDocForAlignment(paraDocument)
                            setAlignmentType(alignmentTypes.fromSavedPairs)
                            setIsAddingModalVisible(!isAddingModalVisible) }
                        } 
                        type='primary'>
                        { t('documentPage.align') }
                    </Button>
                );
            } else {
                return (<></>);
            }
        } else {
            return (
                <div className="text-center">
                    <i>
                        ({ t('documentPage.aligned') })
                    </i>
                </div>
            );
        }
    }

    const handleFilterChange = (searchData, key) => {
        
        if (key == 'text') {
            setFilter({
                ...filter,
                text1: searchData,
                text2: searchData
            })
        } else if (key == 'updatedAt') {
        
            let fromDate = searchData == null ? null : searchData[0].valueOf();
            let toDate = searchData == null ? null : searchData[1].valueOf();

            fromDate = new Date(fromDate);
            fromDate.setHours(0,0,0,0);
            fromDate = fromDate.getTime();

            toDate = new Date(toDate);
            toDate.setHours(0,0,0,0);
            toDate = toDate.getTime();

            setFilter({
                ...filter,
                updatedAt__fromDate: fromDate,
                updatedAt__toDate: toDate
            })

        } else {
            setFilter({
                ...filter,
                [key]: searchData
            })
        }
    };

    const searchParaDocument = (customFilter) => {
        let newFilter = {};

        if (customFilter === undefined) {
            newFilter = {
                ...filter,
                page: 1
            }
    
            setFilter(newFilter)
            
            for (const key in newFilter) {
                if (!newFilter[key]) delete newFilter[key];
            }
        } else {
            newFilter = customFilter;
        }
        
        ParaDocumentAPI.getDocuments(newFilter).then(res => {
            setDataSource(res.data.data.para_documents);
            setPaginationParams(res.data.data.pagination);
        });
    };

    const handleTableChange = (pagination, filters, sorter) => {

        let params = {
            ...filter,
            sortBy: sorter['columnKey'],
            sortOrder: sorter['order'],
            page: pagination['current']
        }
        
        setSortedInfo(sorter)

        ParaDocumentAPI.getDocuments(params).then((res) => {
            setDataSource(res.data.data.para_documents);
            setPaginationParams(res.data.data.pagination);
        });
    }

    const updateParaDocument = (paraDocument, key, value) => {

        let filterParams = {};

        filterParams[key] = value;

        ParaDocumentAPI.updateParaDocument(paraDocument['id'], filterParams).then((res) => {
            if (res.data.code == process.env.REACT_APP_CODE_SUCCESS) {
                message.success(t('documentPage.editedSuccess'));

                let params = {
                    ...filter,
                    sortBy: sortedInfo['columnKey'],
                    sortOrder: sortedInfo['order'],
                    page: paginationParams.current_page
                }

                ParaDocumentAPI.getDocuments(params).then((res) => {
                    setDataSource(res.data.data.para_documents);
                    setPaginationParams(res.data.data.pagination);
                });
            } else {
                message.error(t(`documentPage.${res.data.message}`));
            }
        });
    }

    let langList = [t('documentPage.all'), 'vi-VN', 'zh-CN', 'en-US', 'pt-PT'];

    const statusOption = (
        <>
            <Option key='draft'>{ t('documentPage.draft') }</Option>
            <Option key='approved'>{ t('documentPage.approved') }</Option>
            <Option key='rejected'>{ t('documentPage.rejected') }</Option>
        </>
    ); 

    return (
        <React.Fragment>
            <SiteLayout>
                <PageTitle
                    heading={ t('documentPage.title') }
                    icon='pe-7s-home icon-gradient bg-happy-itmeo'
                />

                <AddingDocumentModal 
                    isAddingModalVisible={ isAddingModalVisible }
                    reloadDocumentData={ setDataSource }
                    reloadDocumentPaginationParams={ setPaginationParams }
                    currentFilter={ filter }
                    alignmentType={ alignmentType }
                    chosenDocForAlignment={ chosenDocForAlignment }
                    setIsAddingModalVisible={ setIsAddingModalVisible }>
                </AddingDocumentModal>

                <Card
                    title={
                        <Row 
                            gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} 
                            style={{ position: 'relative' }}>

                            <Col style={{ display: 'flex', alignItems: 'center' }} xs={ 24 } md={ 4 }>

                                <div style={{ 
                                    fontSize: '25px',
                                    fontWeight: 600
                                }}>
                                    { t('documentPage.filter') }
                                </div>
                            </Col>

                            <Col className='import-button-wrapper' xs={ 24 } md={ 10 }>
                                {
                                    isAdmin() || isReviewer() || isEditor() ? (
                                        <Button
                                            style={{display: "flex", alignItems: "center", fontSize: "15px"}} 
                                            onClick={ () => {
                                                setChosenDocForAlignment({})
                                                setAlignmentType(alignmentTypes.fromNewPairs)
                                                setIsAddingModalVisible(!isAddingModalVisible) 
                                            }} 
                                            icon={ <UploadOutlined /> }>
                                            { t('documentPage.uploadFile') }
                                        </Button>
                                    ) : <></>
                                }
                            </Col>

                            <Col style={{ paddingTop: 8, paddingBottom: 8 }} xs={ 24 } md={ 10 }>
                                <Input
                                    placeholder={ t('documentPage.searchBox') }
                                    onChange={(e) => {
                                        handleFilterChange(e.target.value, 'text');
                                    }}
                                />
                            </Col>
                        </Row>
                    } 
                    style={{ marginBottom: '40px' }}>

                    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                        <Col
                            style={{ marginBottom: '20px' }}
                            xs={ 24 }
                            md={ isAdmin() || isReviewer() ? 6 : 8 }
                        >
                            <div style={{ 
                                marginBottom: '10px',
                                fontSize: '20px',
                                fontWeight: 500
                            }}>
                                { t('documentPage.byRating') }
                            </div>

                            <Select
                                showSearch
                                style={{
                                    width: '100%',
                                }}
                                value={ filter.rating }
                                onChange={ value => handleFilterChange(value, 'rating') }
                            >
                                { ratingOption }
                            </Select>
                        </Col>

                        { 
                            isAdmin() ? (
                                <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ 4 }>
                                    <div style={{ 
                                        marginBottom: '10px',
                                        fontSize: '20px',
                                        fontWeight: 500
                                    }}>
                                        { t('documentPage.byLang2') }
                                    </div>
                                    
                                    <Select
                                        showSearch
                                        style={{
                                            width: '100%',
                                        }}
                                        options={ langList2.map(e => {
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
                                        value={ filter.lang2 }
                                        // defaultValue={ langList2[0]?.value }
                                        onChange={ value => handleFilterChange(value, 'lang2') }
                                    />
                                </Col>
                            ) : ''
                        }

                        <Col
                            style={{ marginBottom: '20px' }}
                            xs={ 24 }
                            md={ isAdmin() ? 4 : isReviewer() ? 6 : 8 }
                        >
                            <div style={{ 
                                marginBottom: '10px',
                                fontSize: '20px',
                                fontWeight: 500
                            }}>
                                { t('documentPage.byAlignmentStatus') }
                            </div>

                            <Select
                                showSearch
                                style={{
                                    width: '100%',
                                }}
                                value={ filter.alignment_status }
                                onChange={ value => handleFilterChange(value, 'alignment_status') }
                            >
                                { alignmentStatusOptions }
                            </Select>
                        </Col>

                        <Col
                            style={{ marginBottom: '20px' }}
                            xs={ 24 }
                            md={ isAdmin() || isReviewer() ? 6 : 8 }
                        >
                            <div style={{ 
                                marginBottom: '10px',
                                fontSize: '20px',
                                fontWeight: 500
                            }}>
                                { t('documentPage.byUpdatedAt') }
                            </div>

                            <DatePicker.RangePicker 
                                style={{ width: '100%' }}
                                locale={ locale }
                                allowClear={ true }
                                value={
                                    filter.updatedAt__fromDate && filter.updatedAt__toDate ? [
                                        moment(filter.updatedAt__fromDate), 
                                        moment(filter.updatedAt__toDate),
                                    ] : null 
                                }
                                onChange={ date => handleFilterChange(date, 'updatedAt') }
                                separator={<ArrowRightOutlined style={{display: "flex", color: "#bfbfbf"}}/>}
                            />
                        </Col>
                        
                        {
                            isAdmin() || isReviewer() ? (
                                <Col
                                    style={{ marginBottom: '20px' }}
                                    xs={ 24 } md={ isReviewer() ? 6 : 4 }
                                >
                                    <div style={{ 
                                        marginBottom: '10px',
                                        fontSize: '20px',
                                        fontWeight: 500
                                    }}>
                                        { t('documentPage.byCreator') }
                                    </div>

                                    <UserSelect 
                                        ref={ userSelectRef }
                                        setSelectedUserId={ (creatorId) => handleFilterChange(creatorId, "creator_id")}
                                        lang={ filter.lang2 }
                                    />
                                </Col>
                            ) : ''
                        }
                    </Row>

                    <div style={{ 
                        float: 'right'
                    }}>
                            
                        <Button
                            showsearchshowsearch='true'
                            style={{ 
                                width: '100px', 
                                background: '#384AD7', 
                                borderColor: '#384AD7'
                            }}
                            type='primary'
                            onClick={ () => searchParaDocument() }
                        >
                            { t('documentPage.search') }
                        </Button> 
                    </div>
                </Card>

                <Card className='domain-table-card'>
                    <Table
                        scroll={{ x: 'max-content' }}
                        rowKey={ record => record.id } 
                        rowClassName={ record => getTableRowClassName(record)}
                        // rowSelection={{
                        //     type: 'checkbox',
                        //     ...rowSelection,
                        // }}
                        dataSource={ dataSource }
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

export default DocumentPage;
