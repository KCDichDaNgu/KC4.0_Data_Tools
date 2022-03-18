import './style.module.scss';

import React, { useEffect, useState } from 'react';
import PageTitle from '../../../layout/site-layout/main/PageTitle';
import {
    Table,
    Tooltip,
    Card,
} from "antd";

import {
    CloseCircleFilled,
    WarningFilled,
    CheckCircleFilled,
    ReloadOutlined,
    SyncOutlined,
    LoadingOutlined
} from "@ant-design/icons"

import SiteLayout from '../../../layout/site-layout';

import { useTranslation } from 'react-i18next';

import { customAxios } from '../../../utils/custom-axios'

const vi_lo_url = process.env.REACT_APP_SENT_ALIGN_LO_API
const vi_km_url = process.env.REACT_APP_SENT_ALIGN_KM_API
const vi_zh_url = process.env.REACT_APP_SENT_ALIGN_ZH_API
const detect_lang_url = process.env.REACT_APP_LANG_DETECTOR_API

const vi_lo_manager = process.env.REACT_APP_SENT_ALIGN_LO_API_MANAGER ?? ','
const vi_km_manager = process.env.REACT_APP_SENT_ALIGN_KM_API_MANAGER ?? ','
const vi_zh_manager = process.env.REACT_APP_SENT_ALIGN_ZH_API_MANAGER ?? ','
const detect_lang_manager = process.env.REACT_APP_LANG_DETECTOR_API_MANAGER ?? ','

const ToolStatus = (props) => {
    
    const { t } = useTranslation(['common']);

    const status = [
        {
            icon: <CloseCircleFilled/>,
            text: "toolStatus.stopping",
            class: "tool-icon tool-stopping"
        },{
            icon: <WarningFilled/>,
            text: "toolStatus.error",
            class: "tool-icon tool-error"
        },{
            icon: <CheckCircleFilled/>,
            text: "toolStatus.running",
            class: "tool-icon tool-running"
        }]
    const default_vi_lo = {
        id: 1,
        name: "Gióng hàng Việt Lào",
        url: vi_lo_url,
        manager: vi_lo_manager.split(",")[0],
        phone: vi_lo_manager.split(",")[1],
        status: 2,
        isLoading: false,
        update: data => setVi_lo({...vi_lo, ...data}),
        check: async function(){
            this.update({isLoading: true})
            const res = await customAxios({
                method: 'post',
                url: `${vi_lo_url}/scores/sentences`,
                data: {
                    source: "Kiểm tra",
                    target: "ກວດສອບ",
                    type: 'vl',
                    sort: true
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            this.update({isLoading: false, status: checkResponse(res)})
        }
    }
    const default_vi_km = {
        id: 2,
        name: "Gióng hàng Việt Khmer",
        url: vi_km_url,
        manager: vi_km_manager.split(",")[0],
        phone: vi_km_manager.split(",")[1],
        status: 2,
        isLoading: false,
        update: data => setVi_km({...vi_km, ...data}),
        check: async function(){
            this.update({isLoading: true})
            const res = await customAxios({
                method: 'post',
                url: `${vi_km_url}/sen_align`,
                data: {
                    lg: "km",
                    doc_source: "Kiểm tra",
                    doc_target: "ពិនិត្យ"
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            this.update({isLoading: false, status: checkResponse(res)})
        }
    }
    const default_vi_zh = {
        id: 3,
        name: "Gióng hàng Việt Trung",
        url: vi_zh_url,
        manager: vi_zh_manager.split(",")[0],
        phone: vi_zh_manager.split(",")[1],
        status: 2,
        isLoading: false,
        update: data => setVi_zh({...vi_zh, ...data}),
        check: async function(){
            this.update({isLoading: true})
            const res = await customAxios({
                method: 'post',
                url: `${vi_zh_url}/sentences_align`,
                data: {
                    source: "Kiểm tra",
                    target: "查看",
                    type: 'vi-zh'
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            this.update({isLoading: false, status: checkResponse(res)})
        }
    }
    const default_detect_lang = {
        id: 4,
        name: "Phát hiện ngôn ngữ",
        url: detect_lang_url,
        manager: detect_lang_manager.split(",")[0],
        phone: detect_lang_manager.split(",")[1],
        status: 2,
        isLoading: false,
        update: data => setDetect_lang({...detect_lang, ...data}),
        check: async function(){
            this.update({isLoading: true})
            const res = await customAxios({
                method: 'post',
                url: `${detect_lang_url}/detect_lang`,
                data: {
                    data: "Kiểm tra"
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            let currentStatus = checkResponse(res)
            if (res.data.data?.status === false || res.data.data?.lang === null) currentStatus = 1
            this.update({isLoading: false, status: currentStatus})
        }
    }

    const checkResponse = response => {
        if (undefined === response || null === response)
            return 0
        if (response.status && response.status === 200){
            return 2
        }
        if (response.status && response.status !== 200){
            return 1
        }
        return 0
    }
    
    const [vi_lo, setVi_lo] = useState(default_vi_lo)
    const [vi_km, setVi_km] = useState(default_vi_km)
    const [vi_zh, setVi_zh] = useState(default_vi_zh)
    const [detect_lang, setDetect_lang] = useState(default_detect_lang)

    const data = [vi_lo, vi_km, vi_zh, detect_lang]

    const columns = [
        {
            title: t("toolStatus.table.name"),
            dataIndex: "name"
        },
        {
            title: t("toolStatus.table.url"),
            dataIndex: "url",
            render: (data, record) => {
                return (
                    <div
                        id={`tool-url-${record.id}`}
                        onClick={() => {
                            navigator.clipboard.writeText(data)
                            window.getSelection().selectAllChildren(
                                document.getElementById(`tool-url-${record.id}`)
                            );
                        }}
                        style={{cursor: 'default'}}
                    >
                        <Tooltip title={"Copy"}>
                            { data }
                        </Tooltip>
                    </div>
                )
            }
        },
        {
            title: t("toolStatus.table.manager"),
            dataIndex: "manager",
            align: "center",
            render: (data, record) => {
                return (
                    <div
                        id={`manager-name-${record.id}`}
                        onClick={() => {
                            navigator.clipboard.writeText(data)
                            window.getSelection().selectAllChildren(
                                document.getElementById(`manager-name-${record.id}`)
                            );
                        }}
                        style={{cursor: 'default'}}
                    >
                        <Tooltip title={"Copy"}>
                            { data }
                        </Tooltip>
                    </div>
                )
            }
        },
        {
            title: t("toolStatus.table.phone"),
            dataIndex: "phone",
            align: "center",
            render: (data, record) => {
                return (
                    <div
                        id={`manager-phone-${record.id}`}
                        onClick={() => {
                            navigator.clipboard.writeText(data)
                            window.getSelection().selectAllChildren(
                                document.getElementById(`manager-phone-${record.id}`)
                            );
                        }}
                        style={{cursor: 'default'}}
                    >
                        <Tooltip title={"Copy"}>
                            { data }
                        </Tooltip>
                    </div>
                )
            }
        },
        {
            title: t("toolStatus.table.status"),
            dataIndex: "status",
            align: "center",
            render: (data, record) => {
                return (
                    <div className={status[data].class}>
                        <Tooltip title={t(record.isLoading? "toolStatus.table.checking" : status[data].text)}>
                            {record.isLoading? <LoadingOutlined style={{color: "#40A9FF"}}/> : status[data].icon}
                        </Tooltip>
                    </div>
                )
            }
        },
        {
            align: "center",
            render: data => {
                return (
                    <div className="tool-icon">
                        <Tooltip title={t(data.isLoading? "toolStatus.table.checking" : "toolStatus.table.recheck")}>
                            <div 
                                onClick={async () => {
                                    if (!data.isLoading){
                                        await data.check()
                                    }
                                }} 
                                className={data.isLoading? "tool-icon-loading" : "reload-button"}
                            >
                                {data.isLoading? <SyncOutlined/> : <ReloadOutlined/>}
                            </div>
                        </Tooltip>
                    </div>
                )
            }
        }
    ]

    useEffect(() => {
        const init = () => {
            vi_lo.check()
            vi_km.check()
            vi_zh.check()
            detect_lang.check()
        }
        init()
    }, [])

    return (
        <React.Fragment>
            <SiteLayout>
                <PageTitle
                    heading={ t('toolStatus.title') }
                    // subheading='Create new content...'
                    icon='pe-7s-home icon-gradient bg-happy-itmeo'
                />

                <Card className='user-table-card'>
                    <Table
                        columns={columns}
                        dataSource={data}
                    />
                </Card>
            </SiteLayout>
        </React.Fragment>
    );
};

export default ToolStatus;