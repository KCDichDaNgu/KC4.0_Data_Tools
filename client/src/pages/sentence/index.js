import "./style.module.scss";

import React, { useEffect, useState, useRef } from "react";
import PageTitle from "../../layout/site-layout/main/PageTitle";
import paraSentenceAPI from "../../api/para-sentence";

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
    Modal
} from "antd";

import { UploadOutlined } from '@ant-design/icons';
import SiteLayout from "../../layout/site-layout";

import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/date';
import { clonedStore } from '../../store';

const { TextArea } = Input;
const { Option } = Select;

const UserRole2Idx = {
    null: 0,
    'member': 1,
    'reviewer': 2,
    'admin': 2
};

const Idx2UserRole = {
    0: null,
    1: 'member',
    2: 'reviewer'
}

const getHighestUserRole = (userRoles) => {
    let userRoleValues = userRoles.map((role, idx) => {
        return UserRole2Idx[role];
    });

    return Idx2UserRole[Math.max.apply(Math, userRoleValues)]; 
}

const SentencePage = (props) => {

    const { t } = useTranslation(['common']);

    const currentUserId = clonedStore.getState().User?.profile?.id;
    const currentUserRoles = clonedStore.getState().User?.profile?.roles;

    const [dataSource, setDataSource] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [paginationParams, setPaginationParams] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [filter, setFilter] = useState({
        domain: "",
        rating: 'unRated',
        lang1: "vi",
        lang2: "",
        sort_by: "",
        sort_order: "",
        page: ""
    });

    const [uploadingFile, setUploadingFile] = useState(false);
    const [isModalImportVisible, setIsModalImportVisible] = useState(false);
    const [importStatus, setImportStatus] = useState({});

    const renderText = (key, paraSentence, index) => {

        let lastUpdated = paraSentence.newest_para_sentence[key].content;
        let disabled = edittedByHigherUserRole(paraSentence);

        return (
            <TextArea
                key={paraSentence['id']}
                autoSize
                showCount
                defaultValue={ lastUpdated }
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

        let lastUpdated = paraSentence.newest_para_sentence.rating; // default notExist = unRated
        let disabled = edittedByHigherUserRole(paraSentence);

        return (
            <Radio.Group
                key={ paraSentence['id'] } 
                value={ lastUpdated }
                onChange={ event => updateParaSentence(paraSentence, "rating", event.target.value) }
                disabled={ disabled }>
                {
                    ratingList.map((rating) => {
                        if (rating == 'unRated') {
                            if (lastUpdated == 'unRated') {
                                return (
                                    <Radio.Button key={ rating } value={ rating }>?</Radio.Button>
                                );
                            }
                        } else {
                            return (
                                <Radio.Button key={ rating } value={ rating }>
                                    { t(`sentence.${rating}`) }
                                </Radio.Button>
                            );
                        }
                    })
                }
            </Radio.Group>
        );
    }

    const columns = [
        {
            title: `${t('sentencePage.text')} 1`,
            dataIndex: "text1",
            key: "text1",
            render: (text, paraSentence, index) => renderText('text1', paraSentence, index)
        },
        {
            title: `${t('sentencePage.text')} 2`,
            dataIndex: "text2",
            key: "text2",
            render: (text, paraSentence, index) => renderText('text2', paraSentence, index)
        },
        // {
        //     title: t('sentencePage.lastUpdate'),
        //     // dataIndex: "updated_at",
        //     key: "updated_at",
        //     render: (record) => {
        //         // formatDate(updated_at)
        //         console.log(record)
        //     },
        //     sorter: (a, b, sortOrder) => { },
        //     sortDirections: ['ascend', 'descend', 'ascend']
        // },
        {
            title: `${t('sentencePage.score')} / ${t('sentencePage.rating')}`,
            // dataIndex: "score",
            key: "score",
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
            width: '20%',
            sortDirections: ['ascend', 'descend', 'ascend']
        },
        // {
        //     title: t('sentencePage.rating'),
        //     dataIndex: "rating",
        //     key: "rating",
        //     render: (rating, paraSentence, index) => renderRating(rating, paraSentence, index),
        // }
    ];

    const handleChange = (searchInput, key) => {
        if (key == 'text') {
            setFilter({ ...filter, text1: searchInput, text2: searchInput });
        } else {
            setFilter({ ...filter, [key]: searchInput });
        }
    };

    const handleFilter = () => {
        let params = {
            ...filter,
            page: 1
        }; // reset page to 1

        setFilter(params);

        paraSentenceAPI.getSentences(params).then((res) => {
            setDataSource(res.data.data.para_sentences);
            setPaginationParams(res.data.data.pagination);
        });
    };

    const [langList1, setLangList1] = useState([]);
    const [langList2, setLangList2] = useState([]);
    const [ratingList, setRatingList] = useState([]);

    const lang1Option = [
        <Option key='all'>{t('sentencePage.all')}</Option>
    ].concat(
        langList1.map((lang) => {
            return <Option key={lang}>{lang}</Option>;
        })
    );

    const lang2Option = [
        <Option key='all'>{t('sentencePage.all')}</Option>
    ].concat(
        langList2.map((lang) => {
            return <Option key={lang}>{lang}</Option>;
        })
    );

    const ratingOption = [
        <Option key='all'>{t('sentencePage.all')}</Option>
    ].concat(
        ratingList.map((rating) => {
            return <Option key={rating}>{t(`sentence.${rating}`)}</Option>;
        })
    );

    const uploadFile = {
        name: 'file',
        customRequest: ({onProgress, onSuccess, onError, file}) => {
            paraSentenceAPI.importFromFile(onProgress, onSuccess, onError, file)
        },
        showUploadList: false,
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {

            if (info.file.status !== 'uploading') setUploadingFile(true);

            if (info.file.status === 'done') {
                setUploadingFile(false);

                // let nSuccess = info.file.response.data.n_success;
                // let nData = info.file.response.data.n_data;

                setImportStatus(info.file.response.data.data);
                setIsModalImportVisible(true);
                // message.success(`${t('sentencePage.imported')} ${nSuccess}/${nData} ${t('sentencePage.pairParaSentences')}`);
                
                // reload new results
                paraSentenceAPI.getSentences(filter).then((res) => {
                    setDataSource(res.data.data.para_sentences);
                    setPaginationParams(res.data.data.pagination);
                });
            } else if (info.file.status === 'error') {
                setUploadingFile(false);

                message.error(`${info.file.name} ${t('sentencePage.uploadFailed')}`);
            }
        },
    };

    useEffect(() => {
        paraSentenceAPI.getSentences(filter).then((res) => {
            setDataSource(res.data.data.para_sentences);
            setPaginationParams(res.data.data.pagination);
        });

        paraSentenceAPI.getOptions().then((res) => {
            setLangList1(res.data.data.lang1);
            setLangList2(res.data.data.lang2);
            setRatingList(res.data.data.rating);
        });
    }, []);

    const handleTableChange = (pagination, filters, sorter) => {
        
        let params = {
            ...filter,
            sort_by: sorter['columnKey'],
            sort_order: sorter['order'],
            page: pagination['current']
        }

        setFilter(params);
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
                    sort_by: sortedInfo['columnKey'],
                    sort_order: sortedInfo['order'],
                    page: paginationParams.current_page
                }

                paraSentenceAPI.getSentences(params).then((res) => {
                    setDataSource(res.data.data.para_sentences);
                    setPaginationParams(res.data.data.pagination);
                });
            } else {
                message.error(t(`sentence.${res.data.message}`));
            }
        });
    }

    const edittedByHigherUserRole = (paraSentence) => {
        // if editted by reviewer and current user is editor -> can not edit
        let highestUserRole = getHighestUserRole(currentUserRoles);
        // return UserRole2Idx[highestUserRole] < UserRole2Idx[paraSentence.editor.roles];
        return  (paraSentence.editor && paraSentence.editor.roles &&
            (paraSentence.editor.roles.includes('admin') || paraSentence.editor.roles.includes('reviewer')) &&
            highestUserRole === 'member') 
    }

    const getTableRowClassName = (paraSentence) => {
        let className = "";

        if (!edittedByHigherUserRole(paraSentence)) {
            if (!paraSentence.editor?.id) className = '';
            else if (paraSentence.editor.id === currentUserId) className = 'edited-by-my-self';
            else if (paraSentence.editor.id !== currentUserId) className = 'edited-by-someone';
        }
        
        // if (edittedByHigherUserRole(paraSentence)) className += ' disabled-row';

        return className;
    }

    return (
        <React.Fragment>
            <SiteLayout>
                <PageTitle
                    heading={t('sentencePage.title')}
                    icon="pe-7s-home icon-gradient bg-happy-itmeo"
                    customComponent={
                        (
                            <div>
                                {
                                    uploadingFile ? (
                                        <Spin />
                                    ) : ''
                                }
                                <Upload {...uploadFile}>
                                    <Button icon={<UploadOutlined />}>
                                        {t('sentencePage.uploadFile')}
                                    </Button>
                                </Upload>
                            </div>
                        )
                    }
                />

                <Card 
                    title={ 
                        <div
                            style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                            <div 
                                style={{ 
                                    fontSize: '25px',
                                    fontWeight: 600
                                }}>
                                { t('sentencePage.filter') }
                            </div>

                            <Button
                                showsearchshowsearch="true"
                                style={{ 
                                    width: "100px", 
                                    marginLeft: "30px", 
                                    background: '#384AD7', 
                                    borderColor: '#384AD7',
                                    float: 'right'
                                }}
                                type="primary"
                                onClick={ handleFilter }>
                                { t('sentencePage.search') }
                            </Button> 
                        </div>
                    } 
                    style={{ marginBottom: '40px' }}>

                    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                        <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ 6 }>
                            <div 
                                style={{ 
                                    marginBottom: "10px",
                                    fontSize: '20px',
                                    fontWeight: 500
                                }}>
                                { t('sentencePage.by_text') }
                            </div>
                            <Input
                                placeholder={ t('sentencePage.searchBox') }
                                value={ searchInput }
                                onChange={(e) => {

                                    const currValue = e.target.value;

                                    setSearchInput(currValue);
                                    handleChange(currValue, "text");
                                }}
                            />
                        </Col>

                        <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ 6 }>
                            <div style={{ 
                                marginBottom: "10px",
                                fontSize: '20px',
                                fontWeight: 500
                            }}>
                                { t('sentencePage.by_rating') }
                            </div>

                            <Select
                                showSearch
                                style={{
                                    width: '100%',
                                }}
                                defaultValue={ filter.rating }
                                onChange={ value => handleChange(value, "rating") }
                            >
                                {ratingOption}
                            </Select>
                        </Col>

                        <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ 6 }>
                            <div style={{ 
                                marginBottom: "10px",
                                fontSize: '20px',
                                fontWeight: 500
                            }}>
                                { t('sentencePage.by_lang_1') }
                            </div>

                            <Select
                                style={{
                                    width: '100%',
                                }}
                                defaultValue={ lang1Option.length === 0 ? "" : lang1Option[0] }
                                onChange={ value => handleChange(value, "lang1")}
                            >
                                { lang1Option }
                            </Select>
                        </Col>

                        <Col style={{ marginBottom: '20px' }} xs={ 24 } md={ 6 }>
                            <div style={{ 
                                marginBottom: "10px",
                                fontSize: '20px',
                                fontWeight: 500
                            }}>
                                { t('sentencePage.by_lang_2') }
                            </div>

                            <Select
                                showSearch
                                style={{
                                    width: '100%',
                                }}
                                defaultValue={lang2Option.length === 0 ? "" : lang2Option[0]}
                                onChange={ value => handleChange(value, "lang2") }
                            >
                                {lang2Option}
                            </Select>
                        </Col>
                    </Row>
                </Card>

                <Card className='card-body-padding-0'>
                    <Table
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

                <Modal 
                    title={ t('sentencePage.resultUpdateData') } 
                    visible={ isModalImportVisible } 
                    footer={[
                        <Button 
                            key="ok"
                            type="primary"
                            onClick={() => setIsModalImportVisible(false)}>
                            { t('sentencePage.ok') }
                        </Button>
                    ]}>
                    <p>
                        - { t('sentencePage.imported') } { importStatus.nSuccess }/{ importStatus.nData } { t('sentencePage.pairParaSentences') }.
                    </p>
                    <p>
                        - { importStatus.nErrorHashExists }/{ importStatus.nData } { t('sentencePage.duplicatedRecords') }.
                    </p>
                </Modal>
            </SiteLayout>
        </React.Fragment>
    );
};

export default SentencePage;
