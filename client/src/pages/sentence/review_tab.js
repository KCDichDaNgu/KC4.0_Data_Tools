import './style.module.scss';

import 'moment/locale/vi';
import locale from 'antd/es/date-picker/locale/vi_VN';

import React, { forwardRef, useEffect, useState, useRef, useImperativeHandle } from 'react';
import paraSentenceAPI from '../../api/para-sentence';

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
    DatePicker,
    Divider
} from 'antd';

import { UploadOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { formatDate } from '../../utils/date';
import { clonedStore } from '../../store';

import ImportFileModal from './import-file-modal';
import { LANGS, STATUS_CODES } from '../../constants';
import { isAdmin, isReviewer } from '../../utils/auth';
import UserSelect from '../../components/user-select';
import CustomTextArea from '../../components/custom-textarea';

import assignmentAPI from '../../api/assignment';

const FileDownload = require('js-file-download');

const SentenceReview = forwardRef((props, ref) => {

    const { t } = useTranslation(['common']);

    const currentUserId = clonedStore.getState().User?.profile?.id;
    const currentUserRoles = clonedStore.getState().User?.profile?.roles || [];

    const [dataSource, setDataSource] = useState([]);
    const [paginationParams, setPaginationParams] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    
    const [filter, setFilter] = useState({
        domain: '',
        text1: '',
        text2: '',
        rating: 'unRated',
        lang1: 'vi',
        lang2: '',
        sortBy: '',
        sortOrder: '',
        page: '',
        updatedAt__fromDate: '',
        updatedAt__toDate: '',
        score__from: '',
        score__to: '',
        editorId: ''
    });

    // sử dụng useRef để gọi function setSelectedUser trong UserSelect,
    // sử dụng khi người dùng bấm xem chi tiết ở tab report, fill user_name vào select.
    const userSelectRef = useRef();

    useImperativeHandle(ref, () => ({

        setFilterEditorId(editor_id, editor_name, lang2, fromDate, toDate) {
            setTimeout(() => {
                let _filter = {
                    ...filter,
                    rating: 'all',
                    editorId: editor_id,
                    lang2: lang2,
                    updatedAt__fromDate: fromDate,
                    updatedAt__toDate: toDate
                };

                searchParaSentence(_filter);

                setFilter(_filter);

                userSelectRef.current.setPreSelectedUser(editor_id, editor_name);
            }, 1000);
        }

    }));
    
    const [isModalImportVisible, setIsModalImportVisible] = useState(false);

    const renderText = (key, paraSentence, index) => {

        let lastestContent = paraSentence.newest_para_sentence[key].content;
        let disabled = !isAllowedToEdit(paraSentence);

        return (
            <CustomTextArea
                className={ disabled && isAdminOnly() ? 'input-admin-disable' : '' }
                style={{ border: 'none' }}
                key={ paraSentence['id'] }
                autoSize
                defaultValue={ lastestContent }
                onPressEnter={ event => {
                    event.preventDefault();
                    updateParaSentence(paraSentence, key, event.target.value);
                }}
                onResize={({ width, height }) => {
                    return height + 10;
                }} 
                disabled={ disabled }
            />
        );
    }

    const renderRating = (rating, paraSentence, index) => {

        let lastestRating = paraSentence.newest_para_sentence.rating; // default notExist = unRated
        let disabled = !isAllowedToEdit(paraSentence);
        
        return (
            <Radio.Group
                key={ paraSentence['id'] } 
                value={ lastestRating }
                onChange={ event => updateParaSentence(paraSentence, 'rating', event.target.value) }
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
                                    { t(`sentencePage.${rating}`) }
                                </Radio.Button>
                            );
                        }
                    })
                }
            </Radio.Group>
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
            title: t(`Language.${filter.lang1}`) ,
            dataIndex: 'text1',
            key: 'text1',
            render: (text, paraSentence, index) => renderText('text1', paraSentence, index)
        },
        {
            title: filter.lang2 ? t(`Language.${filter.lang2}`) : 
                `${ t('Language.unknown') } 2`,
            dataIndex: 'text2',
            key: 'text2',
            render: (text, paraSentence, index) => renderText('text2', paraSentence, index)
        },
        {
            title: `${t('sentencePage.score')} / ${t('sentencePage.rating')}`,
            // dataIndex: 'score',
            key: 'score',
            render: (record, index) => {
                return (
                    <div style={{
                        width: 'fit-content'
                    }}>
                        <div style={{ 
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: 600,
                            marginBottom: '10px'
                        }}>
                            { Number(record.score.senAlign).toFixed(2) }
                        </div>
                        
                        <div>
                            { renderRating(record.rating, record, index) }
                        </div>
                    </div>
                )
            },
            sorter: (a, b, sortOrder) => { },
            width: '15%',
            sortDirections: ['ascend', 'descend', 'ascend']
        },
        {
            title: t('lastUpdatedDay'),
            key: 'updated_at',
            render: record => {
                return (
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>
                        { formatDate(record.updated_at) }
                    </div>
                )
            },
            sorter: (a, b, sortOrder) => { },
            width: '10%',
            sortDirections: ['ascend', 'descend', 'ascend']
        }
    ]; 

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

    const searchParaSentence = (customFilter) => {
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
        
        paraSentenceAPI.getSentences(newFilter).then(res => {
            setDataSource(res.data.data.para_sentences);
            setPaginationParams(res.data.data.pagination);
        });
    };
    
    const [langList2, setLangList2] = useState([]);
    
    const [ratingList, setRatingList] = useState([]);

    const ratingOption = [
        <Select.Option key='all'>{ t('sentencePage.all') }</Select.Option>
    ].concat(
        ratingList.map((rating) => {
            return <Select.Option key={rating}>{ t(`sentencePage.${rating}`) }</Select.Option>;
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
            
            let res1 = await paraSentenceAPI.getSentences(cloneFilter)

            setDataSource(res1.data.data.para_sentences);
            setPaginationParams(res1.data.data.pagination);
    
            let res2 = await paraSentenceAPI.getOptions()

            setRatingList(res2.data.data.rating);
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
        
        setSortedInfo(sorter)

        paraSentenceAPI.getSentences(params).then((res) => {
            setDataSource(res.data.data.para_sentences);
            setPaginationParams(res.data.data.pagination);
        });
    }

    const updateParaSentence = (paraSentence, key, value) => {

        let filterParams = {};

        filterParams[key] = value;

        paraSentenceAPI.updateParaSentence(paraSentence['id'], filterParams).then((res) => {
            if (res.data.code == process.env.REACT_APP_CODE_SUCCESS) {
                message.success(t('sentencePage.editedSuccess'));

                let params = {
                    ...filter,
                    sortBy: sortedInfo['columnKey'],
                    sortOrder: sortedInfo['order'],
                    page: paginationParams.current_page
                }

                paraSentenceAPI.getSentences(params).then((res) => {
                    setDataSource(res.data.data.para_sentences);
                    setPaginationParams(res.data.data.pagination);
                });
            } else {
                message.error(t(`sentencePage.${res.data.message}`));
            }
        });
    }

    const isAllowedToEdit = (paraSentence) => {
        // if current user roles contains admin only -> can not edit
        if (isAdminOnly()) return false;

        // if editted by reviewer and current user is editor -> can not edit
        return  !(paraSentence.editor && paraSentence.editor.roles &&
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

    const exportData = () => {
        paraSentenceAPI.exportFile(filter).then(res => {
            let lang1 = filter.lang1 || 'all';
            let lang2 = filter.lang2 || 'all';
            FileDownload(res.data, `${lang1}-${lang2}.csv`);
        });
    }

    return (
        <React.Fragment>
            <Card
                title={
                    <Row 
                        gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} 
                        style={{ position: 'relative' }}>

                        <Col
                            style={{ display: 'flex', alignItems: 'center' }}
                            xs={ 24 } md={ 4 }>

                            <div style={{ 
                                fontSize: '25px',
                                fontWeight: 600
                            }}>
                                { t('sentencePage.filter') }
                            </div>
                        </Col>

                        <Col className='import-export-buttons-wrapper' xs={ 24 } md={ 10 }>
                            <div style={{display: 'flex', flexWrap: 'wrap'}}>
                                {
                                    allowImportFiles() ? (
                                        <Button
                                            style={{ marginRight: '10px' }}
                                            onClick={ () => setIsModalImportVisible(!isModalImportVisible) } 
                                            icon={ <UploadOutlined /> }
                                        >
                                            { t('sentencePage.uploadFile') }
                                        </Button>
                                    ) : ''
                                }

                                {
                                    allowExport() ? (
                                        <Button onClick={ exportData }>
                                            { t('sentencePage.exportData') }
                                        </Button>
                                    ) : ''
                                }
                            </div>
                        </Col>

                        <Col style={{ paddingTop: 8, paddingBottom: 8 }} xs={ 24 } md={ 10 }>
                            <Input
                                placeholder={ t('sentencePage.searchBox') }
                                onChange={(e) => {
                                    handleFilterChange(e.target.value, 'text');
                                }}
                            />
                        </Col>
                    </Row>
                } 
                style={{ marginBottom: '40px' }}
            >

                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ isAdmin() ? 6 : 8 }>
                        <div style={{ 
                            marginBottom: '10px',
                            fontSize: '20px',
                            fontWeight: 500
                        }}>
                            { t('sentencePage.byRating') }
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

                    <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ isAdmin() ? 4 : 8 }>
                        <div style={{ 
                            marginBottom: '10px',
                            fontSize: '20px',
                            fontWeight: 500
                        }}>
                            { t('sentencePage.byScoreRange') }
                        </div>

                        <Input.Group compact>
                            <Input 
                                style={{ width: '50%' }} 
                                placeholder={ t('from') }
                                type='number'
                                onChange={ e => handleFilterChange(parseFloat(e.target.value), 'score__from') } 
                            />

                            <Input 
                                style={{ width: '50%' }} 
                                placeholder={ t('to') }
                                type='number'
                                onChange={ e => handleFilterChange(parseFloat(e.target.value), 'score__to') } 
                            />
                        </Input.Group>
                    </Col>

                    <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ isAdmin() ? 6 : 8 }>
                        <div style={{ 
                            marginBottom: '10px',
                            fontSize: '20px',
                            fontWeight: 500
                        }}>
                            { t('sentencePage.byUpdatedAt') }
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
                        />
                    </Col>

                    {
                        isAdmin() || isReviewer() ? (
                            <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ 4 }>
                                <div style={{ 
                                    marginBottom: '10px',
                                    fontSize: '20px',
                                    fontWeight: 500
                                }}>
                                    { t('sentencePage.byEditor') }
                                </div>

                                <UserSelect 
                                    ref={ userSelectRef }
                                    setSelectedUserId={ (editorId) => handleFilterChange(editorId, "editorId")}
                                    lang={ filter.lang2 }
                                />
                            </Col>
                        ) : ''
                    }

                    { 
                        isAdmin() ? (
                            <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ 4 }>
                                <div style={{ 
                                    marginBottom: '10px',
                                    fontSize: '20px',
                                    fontWeight: 500
                                }}>
                                    { t('sentencePage.byLang2') }
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
                        ) : null
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
                        onClick={ () => searchParaSentence() }
                    >
                        { t('sentencePage.search') }
                    </Button> 
                </div>
            </Card>

            <Card className='card-body-padding-0'>
                <Table
                    scroll={{ x: 'max-content' }}
                    rowKey={ record => record.id } 
                    rowClassName={ record => getTableRowClassName(record)}
                    expandable={{
                        expandedRowRender: record => {
                            return (
                                <div style={{
                                    padding: '20px'
                                }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label 
                                            style={{
                                                fontSize: '16px',
                                                marginBottom: '10px',
                                                fontWeight: 600
                                            }}>
                                            { t('originalText') } { t(record.original_para_sentence.text1.lang) }
                                        </label>
                                        <div>
                                            { record.original_para_sentence.text1.content }
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label 
                                            style={{
                                                fontSize: '16px',
                                                marginBottom: '10px',
                                                fontWeight: 600
                                            }}>
                                            { t('originalText') } { t(record.original_para_sentence.text2.lang) }
                                        </label>

                                        <div>
                                            { record.original_para_sentence.text2.content }
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label 
                                            style={{
                                                fontSize: '16px',
                                                marginBottom: '10px',
                                                fontWeight: 600
                                            }}>
                                            { t('sentencePage.lastUpdate') } { t('sentencePage.by') }
                                            &nbsp;{ record.editor?.id === currentUserId ? t('sentencePage.you') : record.editor.username }
                                        </label>
                                        
                                        <div>
                                            { formatDate(record.updated_at) }
                                        </div>
                                    </div>

                                    <div>
                                        <label 
                                            style={{
                                                fontSize: '16px',
                                                marginBottom: '10px',
                                                fontWeight: 600
                                            }}>
                                            { t('sentencePage.createdTime') } 
                                        </label>
                                        <div>
                                            { formatDate(record.created_at) }
                                        </div>
                                    </div>
                                </div>
                            )
                        },
                        rowExpandable: record => { return !!record.editor?.id },
                    }}
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
            
            { allowImportFiles() ? 
                <ImportFileModal 
                    isModalImportVisible={ isModalImportVisible }
                    setIsModalImportVisible={ setIsModalImportVisible }
                    reloadSentenceData={ setDataSource }
                    reloadSentencePaginationParams={ setPaginationParams }
                    currentFilter={ filter }>
                </ImportFileModal>
                : null 
            }
        </React.Fragment>
    );
});

export default SentenceReview;
