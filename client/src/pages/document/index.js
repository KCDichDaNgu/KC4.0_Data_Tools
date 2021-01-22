import './style.module.scss';

import React, { useEffect, useState, useRef } from 'react';
import PageTitle from '../../layout/site-layout/main/PageTitle';
import {
    Input,
    Table,
    Button,
    Popconfirm,
    Card,
    Dropdown,
    Menu,
    Select,
} from 'antd';
import SiteLayout from '../../layout/site-layout';

import { UploadOutlined } from '@ant-design/icons';
import { ImportDocModal } from './import-doc-modal';
import { useTranslation } from 'react-i18next';

const moment = require('moment');

const DocumentPage = (props) => {
    const { t, i18n } = useTranslation(['common']);

    const [data, setData] = useState([
        {
            key: '1',
            id: 1,
            domain: 'vov.vn',
            status: t('documentPage.draft'),
            lang_1: 'en-US',
            lang_2: 'vi-VI',
            text_1_lang:
                'He was chosen to serve as a political hostage in the Kingdom of Zhao',
            text_2_lang: 'Ông phải làm con tin chính trị ở kinh đô nước Triệu',
            score: 0.4,
            last_update: 1608488868000,
        },
        {
            key: '2',
            id: 2,
            domain: 'vov.vn',
            status: t('documentPage.draft'),
            lang_1: 'en-US',
            lang_2: 'vi-VI',
            text_1_lang:
                'People happy for outcomes of Party Central Committee’s 14th session',
            text_2_lang:
                'Người dân cả nước phấn khởi trước kết quả Hội nghị Trung ương 14',
            score: 0.4,
            last_update: 1608488868000,
        },
        {
            key: '3',
            id: 3,
            domain: 'vnexpress.net',
            status: t('documentPage.approved'),
            lang_1: 'en-US',
            lang_2: 'zh-CN',
            text_1_lang: 'The programme of support for arts and crafts design',
            score: 0.9,
            text_2_lang: '扶持艺术和工艺设计项目',
            last_update: 1608488868000,
        },
        {
            key: '4',
            id: 4,
            domain: 'vtv.vn',
            status: t('documentPage.rejected'),
            lang_1: 'en-US',
            lang_2: 'zh-CN',
            text_1_lang:
                'The Nazis steal the Ark and capture Indiana and Marion',
            score: 0.8,
            text_2_lang: '纳粹偷了法柜,并抓住了印第安纳和马里昂',
            last_update: 1608488868000,
        },
        {
            key: '5',
            id: 5,
            domain: 'vtv.vn',
            status: t('documentPage.rejected'),
            lang_1: 'vi-VI',
            lang_2: 'en-US',
            text_1_lang: 'Có lẽ do hình thái di truyền của hệ thống miễn dịch.',
            text_2_lang:
                'It is probably due to the genetic morphology of the immune system.',
            score: 0.7,
            last_update: 1608488868000,
        },
        {
            key: '6',
            id: 6,
            domain: 'vnexpress.net',
            status: t('documentPage.rejected'),
            lang_1: 'vi-VI',
            lang_2: 'en-US',
            text_1_lang:
                'Các thiết kế không chính thống của Tiến sĩ Porsche ít được ưa chuộng.',
            text_2_lang:
                "Dr. Porsche 's unorthodox designs gathered little favour.",
            score: 0.6,
            last_update: 1608488868000,
        },
        {
            key: '7',
            id: 7,
            domain: 'vov.vn',
            status: t('documentPage.approved'),
            lang_1: 'vi-VI',
            lang_2: 'pt-PT',
            text_1_lang: 'Tôi gửi kèm cái bật lửa như một món quà chia tay.',
            text_2_lang:
                'Anexei o meu isqueiro como presente de despedida para ti',
            score: 0.7,
            last_update: 1608488868000,
        },
        {
            key: '8',
            id: 8,
            domain: 'vov.vn',
            status: t('documentPage.rejected'),
            lang_1: 'zh-CN',
            lang_2: 'vi-VI',
            text_1_lang:
                '1929年他毕业于托卢卡的科学和文学研究所,在那里他成为社会主义工党的代表和学生领袖。',
            text_2_lang:
                'Năm 1929, ông tốt nghiệp Học viện Khoa học và Văn học Toluca, nơi ông là một đại biểu và là lãnh đạo sinh viên của Đảng Lao động Xã hội Chủ nghĩa.',
            score: 0.9,
            last_update: 1608488868000,
        },
        {
            key: '9',
            id: 9,
            domain: 'vnexpress.net',
            status: t('documentPage.approved'),
            lang_1: 'zh-CN',
            lang_2: 'vi-VI',
            text_1_lang: '新皇 登基 之前 别 让 宰相 接触 她',
            text_2_lang:
                'Giữ con bé tránh xa Thừa Tướng tới khi lễ lên ngôi kết thúc.',
            score: 0.7,
            last_update: 1608488868000,
        },
        {
            key: '10',
            id: 10,
            domain: 'vov.vn',
            status: t('documentPage.draft'),
            lang_1: 'zh-CN',
            lang_2: 'vi-VI',
            text_1_lang: '不過科學家仍然不清楚這些藍鯨在哪裡過冬。',
            text_2_lang:
                'Các nhà khoa học không biết những con cá voi xanh này sống ở đâu vào mùa đông.',
            score: 0.4,
            last_update: 1608488868000,
        },
    ]);
    const [dataSource, setDataSource] = useState(data);
    const [count, setCount] = useState(data.length + 1);
    const [value, setValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [filterOptions, setFilterOptions] = useState({
        domain: '',
        lang1: '',
        lang2: '',
    });

    const [isModalImportVisible, setIsModalImportVisible] = useState(false);

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
            title: `${ t('documentPage.text') } 1`,
            dataIndex: 'text_1_lang',
            key: 'text_1_lang',
        },
        {
            title: `${ t('documentPage.text') } 2`,
            dataIndex: 'text_2_lang',
            key: 'text_2_lang',
        },
        {
            title: t('documentPage.lastUpdate'),
            dataIndex: 'last_update',
            key: 'last_update',
            render: (last_update) => timeformat(last_update),
            sorter: (a, b) => a.last_update - b.last_update,
        },
        {
            title: t('documentPage.score'),
            dataIndex: 'score',
            key: 'score',
            sorter: (a, b) => a.score - b.score,
        },
        {
            title: t('documentPage.action'),
            dataIndex: '',
            key: 'action',
            render: () => <Button type='primary'>{ t('documentPage.senAlign') }</Button>,
        },
        {
            title: t('documentPage.status'),
            dataIndex: 'status',
            key: 'status',
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
            placeholder={ t('documentPage.searchBox') }
            className='search-input-box'
            value={value}
            onChange={(e) => {
                const currValue = e.target.value;
                setValue(currValue);
                const filteredData = data.filter((entry) => {
                    if (
                        entry.text_1_lang.includes(currValue) ||
                        entry.text_2_lang.includes(currValue)
                    )
                        return true;
                });
                setDataSource(filteredData);
            }}
        />
    );

    const handleChange = (value, key) => {
        setFilterOptions({ ...filterOptions, [key]: value });
        console.log(filterOptions);
    };

    const handleFilter = () => {
        const filteredData = data.filter((item) => {
            for (var key in filterOptions) {
                if (item[key] === undefined || item[key] != filterOptions[key])
                    return false;
            }
            return true;
        });
        setDataSource(filteredData);
    };

    let domainList = [...new Set(data.map((data) => data.domain))];
    domainList = [t('documentPage.all'), t('documentPage.noDomain')].concat(domainList);

    let langList = [t('documentPage.all'), 'vi-VN', 'zh-CN', 'en-US', 'pt-PT'];

    const domainOption = domainList.map((domain) => {
        return <Option key={domain}>{domain}</Option>;
    });

    const lang1Option = langList.map((lang) => {
        return <Option key={lang}>{lang}</Option>;
    });

    const lang2Option = langList.map((lang) => {
        return <Option key={lang}>{lang}</Option>;
    });

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
                    // subheading={ t('documentPage.createNewContent') }
                    icon='pe-7s-home icon-gradient bg-happy-itmeo'
                    customComponent={
                        <Button 
                            style={{ marginLeft: '10px' }}
                            onClick={ () => setIsModalImportVisible(!isModalImportVisible) } 
                            icon={ <UploadOutlined /> }>
                            { t('sentencePage.uploadFile') }
                        </Button>
                    }
                />

                <ImportDocModal 
                    isModalImportVisible={ isModalImportVisible }
                    setIsModalImportVisible={ setIsModalImportVisible }>
                </ImportDocModal>

                <Card className='domain-table-card'>
                    <div className='header-controller'>
                        {FilterByNameInput}
                        <div style={{ float: 'left' }}>
                            <div
                                style={{
                                    display: 'inline-block',
                                    marginLeft: '30px',
                                }}>
                                <div> { t('documentPage.selectDomain') }:</div>
                                <Select
                                    showSearch
                                    style={{ width: '300px' }}
                                    defaultValue={ t('documentPage.all') }
                                    onChange={(value) =>
                                        handleChange(value, 'domain')
                                    }>
                                    {domainOption}
                                </Select>
                            </div>
                            <div
                                style={{
                                    display: 'inline-block',
                                    marginLeft: '30px',
                                }}>
                                <div>Select lang 1</div>
                                <Select
                                    style={{ width: '100px' }}
                                    defaultValue={'vi-VN'}
                                    onChange={(value) =>
                                        handleChange(value, 'lang1')
                                    }>
                                    {lang1Option}
                                </Select>
                            </div>
                            <div
                                style={{
                                    display: 'inline-block',
                                    marginLeft: '30px',
                                }}>
                                <div>Select lang 2</div>
                                <Select
                                    showSearch
                                    style={{ width: '100px' }}
                                    defaultValue={'en-US'}
                                    onChange={(value) =>
                                        handleChange(value, 'lang2')
                                    }>
                                    {lang2Option}
                                </Select>
                            </div>
                            <div
                                style={{
                                    display: 'inline-block',
                                    marginLeft: '30px',
                                }}>
                                <div>{ t('documentPage.selectStatus') }</div>
                                <Select
                                    showSearch
                                    style={{ minWidth: '100px' }}
                                    defaultValue={ t('documentPage.draft') }
                                    onChange={(value) =>
                                        handleChange(value, 'status')
                                    }>
                                    {statusOption}
                                </Select>
                            </div>

                            <Button
                                showSearchshowSearch
                                style={{ width: '100px', marginLeft: '30px' }}
                                type='primary'
                                onClick={handleFilter}>
                                { t('documentPage.filter') }
                            </Button>
                        </div>

                        <div style={{ float: 'right' }}>
                            <Button style={{ marginLeft: '12px' }}>
                                { t('documentPage.add') }
                            </Button>

                            <Button style={{ marginLeft: '12px' }}>
                                { t('documentPage.approve') }
                            </Button>

                            <Button style={{ marginLeft: '12px' }}>
                                { t('documentPage.reject') }
                            </Button>
                        </div>
                    </div>

                    <Table
                        className='table-striped-rows'
                        rowSelection={{
                            type: 'checkbox',
                            ...rowSelection,
                        }}
                        dataSource={dataSource}
                        columns={columns}
                        pagination={{ pageSize: 5 }}></Table>
                </Card>
            </SiteLayout>
        </React.Fragment>
    );
};

export default DocumentPage;
