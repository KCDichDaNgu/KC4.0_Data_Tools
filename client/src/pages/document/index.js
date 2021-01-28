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
    Dropdown,
    Menu,
    Select,
    Radio,
    Row,
    Col,
    DatePicker
} from 'antd';
import SiteLayout from '../../layout/site-layout';

import { UploadOutlined } from '@ant-design/icons';
import ImportDocModal from './import-doc-modal';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/date';
import { clonedStore } from '../../store';
import { isAdmin, isReviewer } from '../../utils/auth';
import CustomTextArea from '../../components/custom-textarea';
import CustomCol from '../../components/custom-modal-column';


const { Option } = Select;

const moment = require('moment');

const DocumentPage = (props) => {
    const { t, i18n } = useTranslation(['common']);

    const currentUserId = clonedStore.getState().User?.profile?.id;
    const currentUserRoles = clonedStore.getState().User?.profile?.roles || [];

    const data = [
        {
          "created_at": 1611130955, 
          "creator_id": "admin#firstname admin#lastname", 
          "editor": {
            "id": null, 
            "roles": null, 
            "username": null
          }, 
          "id": "6007e84b6dedcbecbda649db", 
          "last_history_record_id": null, 
          "newest_para_sentence": {
            "hash_content": "41a1fb7eaf3a96985a820fad5cb8be38", 
            "rating": "unRated", 
            "text1": {
              "content": "\"\u0110\u1ebfn v\u1edbi M\u1ed9c Ch\u00e2u , du kh\u00e1ch \u0111\u01b0\u1ee3c ho\u00e0 m\u00ecnh v\u00e0o kh\u00f4ng gian v\u0103n ho\u00e1 mang \u0111\u1eadm n\u00e9t \u0111\u1ed9c \u0111\u00e1o c\u1ee7a \u0111\u1ed3ng b\u00e0o c\u00e1c d\u00e2n t\u1ed9c Th\u00e1i , M\u00f4ng tr\u00ean mi\u1ec1n th\u1ea3o nguy\u00ean xanh .\"", 
              "lang": "vi"
            }, 
            "text2": {
              "content": "\u1798\u1780\u178a\u179b\u17cb Moc Chau \u17a2\u17d2\u1793\u1780\u1791\u17c1\u179f\u1785\u179a\u1794\u17b6\u1793\u179f\u1798\u17d2\u179a\u1794\u1781\u17d2\u179b\u17bd\u1793\u1785\u17bc\u179b\u1780\u17d2\u1793\u17bb\u1784\u179b\u17c6\u17a0\u179c\u1794\u17d2\u1794\u1792\u1798\u17cc \u178a\u17c2\u179b\u1798\u17b6\u1793\u179b\u1780\u17d2\u1781\u178e\u17c8\u1796\u17b7\u179f\u17c1\u179f\u179a\u1794\u179f\u17cb\u1787\u1793\u1787\u17b6\u178f\u17b7\u1797\u17b6\u1782\u1787\u17b6\u178f\u17b7\u1790\u17c3 \u1793\u17b7\u1784 Mong \u1793\u17c5\u179b\u17be\u179c\u17b6\u179b\u179f\u17d2\u1798\u17c5\u1796\u178e\u17cc\u1781\u17c0\u179c\u179f\u17d2\u179a\u1784\u17b6\u178f\u17cb\u17d4", 
              "lang": "km"
            }
          }, 
          "original_para_sentence": {
            "hash_content": "41a1fb7eaf3a96985a820fad5cb8be38", 
            "rating": "unRated", 
            "text1": {
              "content": "\"\u0110\u1ebfn v\u1edbi M\u1ed9c Ch\u00e2u , du kh\u00e1ch \u0111\u01b0\u1ee3c ho\u00e0 m\u00ecnh v\u00e0o kh\u00f4ng gian v\u0103n ho\u00e1 mang \u0111\u1eadm n\u00e9t \u0111\u1ed9c \u0111\u00e1o c\u1ee7a \u0111\u1ed3ng b\u00e0o c\u00e1c d\u00e2n t\u1ed9c Th\u00e1i , M\u00f4ng tr\u00ean mi\u1ec1n th\u1ea3o nguy\u00ean xanh .\"", 
              "lang": "vi"
            }, 
            "text2": {
              "content": "\u1798\u1780\u178a\u179b\u17cb Moc Chau \u17a2\u17d2\u1793\u1780\u1791\u17c1\u179f\u1785\u179a\u1794\u17b6\u1793\u179f\u1798\u17d2\u179a\u1794\u1781\u17d2\u179b\u17bd\u1793\u1785\u17bc\u179b\u1780\u17d2\u1793\u17bb\u1784\u179b\u17c6\u17a0\u179c\u1794\u17d2\u1794\u1792\u1798\u17cc \u178a\u17c2\u179b\u1798\u17b6\u1793\u179b\u1780\u17d2\u1781\u178e\u17c8\u1796\u17b7\u179f\u17c1\u179f\u179a\u1794\u179f\u17cb\u1787\u1793\u1787\u17b6\u178f\u17b7\u1797\u17b6\u1782\u1787\u17b6\u178f\u17b7\u1790\u17c3 \u1793\u17b7\u1784 Mong \u1793\u17c5\u179b\u17be\u179c\u17b6\u179b\u179f\u17d2\u1798\u17c5\u1796\u178e\u17cc\u1781\u17c0\u179c\u179f\u17d2\u179a\u1784\u17b6\u178f\u17cb\u17d4", 
              "lang": "km"
            }
          }, 
          "para_document_id": null, 
          "score": {
            "senAlign": 0.739553273
          }, 
          "updated_at": 1611130905, 
          "view_due_date": null, 
          "viewer_id": "None"
        }, 
        {
          "created_at": 1611130955, 
          "creator_id": "admin#firstname admin#lastname", 
          "editor": {
            "id": null, 
            "roles": null, 
            "username": null
          }, 
          "id": "6007e84b6dedcbecbda649dc", 
          "last_history_record_id": null, 
          "newest_para_sentence": {
            "hash_content": "b6db0912c447f004908bff118e61f603", 
            "rating": "unRated", 
            "text1": {
              "content": "\"\u0110\u1ebfn v\u1edbi M\u1ed9c Ch\u00e2u , du kh\u00e1ch \u0111\u01b0\u1ee3c ho\u00e0 m\u00ecnh v\u00e0o kh\u00f4ng gian v\u0103n ho\u00e1 mang \u0111\u1eadm n\u00e9t \u0111\u1ed9c \u0111\u00e1o c\u1ee7a \u0111\u1ed3ng b\u00e0o c\u00e1c d\u00e2n t\u1ed9c Th\u00e1i , M\u00f4ng tr\u00ean mi\u1ec1n th\u1ea3o nguy\u00ean xanh .\"", 
              "lang": "vi"
            }, 
            "text2": {
              "content": "\u1799\u17c4\u1784\u178f\u17b6\u1798\u179b\u17c4\u1780\u179f\u17d2\u179a\u17b8 Nguyen Thi Hoa \u17a2\u1793\u17bb\u1794\u17d2\u179a\u1792\u17b6\u1793\u1782\u178e\u17c8\u1780\u1798\u17d2\u1798\u17b6\u1792\u17b7\u1780\u17b6\u179a\u1794\u17d2\u179a\u1787\u17b6\u1787\u1793\u179f\u17d2\u179a\u17bb\u1780 Moc Chau \u17b1\u17d2\u1799\u178a\u17b9\u1784\u1790\u17b6 \u178f\u17d2\u179a\u17b9\u1798\u178f\u17c2\u1780\u17d2\u1793\u17bb\u1784\u1781\u17c2\u178f\u17bb\u179b\u17b6\u1794\u17c9\u17bb\u178e\u17d2\u178e\u17c4\u17c7  Moc Chau \u1794\u17b6\u1793\u179f\u17d2\u179c\u17b6\u1782\u1798\u1793\u17cd\u1797\u17d2\u1789\u17c0\u179c\u1791\u17c1\u179f\u1785\u179a\u178e\u17cd\u1787\u17b6\u1784 \u17e7\u17e5.\u17e0\u17e0\u17e0 \u1793\u17b6\u1780\u17cb \u1798\u1780\u1791\u179f\u17d2\u179f\u1793\u17b6\u1793\u17b7\u1784\u1791\u1791\u17bd\u179b\u1794\u1791\u1796\u17b7\u179f\u17c4\u1792\u1793\u17cd\u17d4", 
              "lang": "km"
            }
          }, 
          "original_para_sentence": {
            "hash_content": "b6db0912c447f004908bff118e61f603", 
            "rating": "unRated", 
            "text1": {
              "content": "\"\u0110\u1ebfn v\u1edbi M\u1ed9c Ch\u00e2u , du kh\u00e1ch \u0111\u01b0\u1ee3c ho\u00e0 m\u00ecnh v\u00e0o kh\u00f4ng gian v\u0103n ho\u00e1 mang \u0111\u1eadm n\u00e9t \u0111\u1ed9c \u0111\u00e1o c\u1ee7a \u0111\u1ed3ng b\u00e0o c\u00e1c d\u00e2n t\u1ed9c Th\u00e1i , M\u00f4ng tr\u00ean mi\u1ec1n th\u1ea3o nguy\u00ean xanh .\"", 
              "lang": "vi"
            }, 
            "text2": {
              "content": "\u1799\u17c4\u1784\u178f\u17b6\u1798\u179b\u17c4\u1780\u179f\u17d2\u179a\u17b8 Nguyen Thi Hoa \u17a2\u1793\u17bb\u1794\u17d2\u179a\u1792\u17b6\u1793\u1782\u178e\u17c8\u1780\u1798\u17d2\u1798\u17b6\u1792\u17b7\u1780\u17b6\u179a\u1794\u17d2\u179a\u1787\u17b6\u1787\u1793\u179f\u17d2\u179a\u17bb\u1780 Moc Chau \u17b1\u17d2\u1799\u178a\u17b9\u1784\u1790\u17b6 \u178f\u17d2\u179a\u17b9\u1798\u178f\u17c2\u1780\u17d2\u1793\u17bb\u1784\u1781\u17c2\u178f\u17bb\u179b\u17b6\u1794\u17c9\u17bb\u178e\u17d2\u178e\u17c4\u17c7  Moc Chau \u1794\u17b6\u1793\u179f\u17d2\u179c\u17b6\u1782\u1798\u1793\u17cd\u1797\u17d2\u1789\u17c0\u179c\u1791\u17c1\u179f\u1785\u179a\u178e\u17cd\u1787\u17b6\u1784 \u17e7\u17e5.\u17e0\u17e0\u17e0 \u1793\u17b6\u1780\u17cb \u1798\u1780\u1791\u179f\u17d2\u179f\u1793\u17b6\u1793\u17b7\u1784\u1791\u1791\u17bd\u179b\u1794\u1791\u1796\u17b7\u179f\u17c4\u1792\u1793\u17cd\u17d4", 
              "lang": "km"
            }
          }, 
          "para_document_id": null, 
          "score": {
            "senAlign": 0.731288671
          }, 
          "updated_at": 1611130905, 
          "view_due_date": null, 
          "viewer_id": "None"
        }, 
        {
          "created_at": 1611130955, 
          "creator_id": "admin#firstname admin#lastname", 
          "editor": {
            "id": null, 
            "roles": null, 
            "username": null
          }, 
          "id": "6007e84b6dedcbecbda649dd", 
          "last_history_record_id": null, 
          "newest_para_sentence": {
            "hash_content": "2f5bb05ba5ff6597d77b3748fdacf89d", 
            "rating": "unRated", 
            "text1": {
              "content": "\"\u0110\u1ebfn v\u1edbi M\u1ed9c Ch\u00e2u , du kh\u00e1ch \u0111\u01b0\u1ee3c ho\u00e0 m\u00ecnh v\u00e0o kh\u00f4ng gian v\u0103n ho\u00e1 mang \u0111\u1eadm n\u00e9t \u0111\u1ed9c \u0111\u00e1o c\u1ee7a \u0111\u1ed3ng b\u00e0o c\u00e1c d\u00e2n t\u1ed9c Th\u00e1i , M\u00f4ng tr\u00ean mi\u1ec1n th\u1ea3o nguy\u00ean xanh .\"", 
              "lang": "vi"
            }, 
            "text2": {
              "content": "\u1798\u17d2\u1799\u17c9\u17b6\u1784\u179c\u17b7\u1789\u1791\u17c0\u178f \u1780\u17d2\u179a\u17bb\u1798\u17a0\u17ca\u17bb\u1793\u1791\u17c1\u179f\u1785\u179a\u178e\u17cd\u1793\u17b6\u1793\u17b6 \u178f\u17d2\u179a\u17bc\u179c\u1798\u17b6\u1793\u1791\u17b7\u179f\u178a\u17c5\u1791\u17c1\u179f\u1785\u179a\u178e\u17cd \u1793\u17b7\u1784\u1798\u17b6\u1793\u1799\u17bb\u1791\u17d2\u1792\u179f\u17b6\u179f\u17d2\u179a\u17d2\u178f\u1787\u17b6\u1780\u17cb\u179f\u17d2\u178f\u17c2\u1784\u1795\u1784\u178a\u17c2\u179a \u1796\u17c4\u179b\u1782\u17ba \u1792\u17d2\u179c\u17be\u1799\u17c9\u17b6\u1784\u1798\u17c9\u17c1\u1785\u178a\u17be\u1798\u17d2\u1794\u17b8\u1795\u17d2\u179f\u1796\u17d2\u179c\u1795\u17d2\u179f\u17b6\u1799\u179a\u17bc\u1794\u1797\u17b6\u1796\u179a\u1794\u179f\u17cb Moc Chau \u1780\u17cf\u178a\u17bc\u1785\u1787\u17b6\u1797\u17b6\u1796\u179a\u179f\u17cb\u179a\u17b6\u1799\u179a\u17b6\u1780\u17cb\u1791\u17b6\u1780\u17cb\u179a\u1794\u179f\u17cb\u1794\u17d2\u179a\u1787\u17b6\u1787\u1793\u1793\u17c5\u1791\u17b8\u1793\u17c1\u17c7\u17b2\u17d2\u1799\u1780\u17b6\u1793\u178f\u17c2\u1791\u17bc\u179b\u17c6\u1791\u17bc\u179b\u17b6\u1799\u17d4", 
              "lang": "km"
            }
          }, 
          "original_para_sentence": {
            "hash_content": "2f5bb05ba5ff6597d77b3748fdacf89d", 
            "rating": "unRated", 
            "text1": {
              "content": "\"\u0110\u1ebfn v\u1edbi M\u1ed9c Ch\u00e2u , du kh\u00e1ch \u0111\u01b0\u1ee3c ho\u00e0 m\u00ecnh v\u00e0o kh\u00f4ng gian v\u0103n ho\u00e1 mang \u0111\u1eadm n\u00e9t \u0111\u1ed9c \u0111\u00e1o c\u1ee7a \u0111\u1ed3ng b\u00e0o c\u00e1c d\u00e2n t\u1ed9c Th\u00e1i , M\u00f4ng tr\u00ean mi\u1ec1n th\u1ea3o nguy\u00ean xanh .\"", 
              "lang": "vi"
            }, 
            "text2": {
              "content": "\u1798\u17d2\u1799\u17c9\u17b6\u1784\u179c\u17b7\u1789\u1791\u17c0\u178f \u1780\u17d2\u179a\u17bb\u1798\u17a0\u17ca\u17bb\u1793\u1791\u17c1\u179f\u1785\u179a\u178e\u17cd\u1793\u17b6\u1793\u17b6 \u178f\u17d2\u179a\u17bc\u179c\u1798\u17b6\u1793\u1791\u17b7\u179f\u178a\u17c5\u1791\u17c1\u179f\u1785\u179a\u178e\u17cd \u1793\u17b7\u1784\u1798\u17b6\u1793\u1799\u17bb\u1791\u17d2\u1792\u179f\u17b6\u179f\u17d2\u179a\u17d2\u178f\u1787\u17b6\u1780\u17cb\u179f\u17d2\u178f\u17c2\u1784\u1795\u1784\u178a\u17c2\u179a \u1796\u17c4\u179b\u1782\u17ba \u1792\u17d2\u179c\u17be\u1799\u17c9\u17b6\u1784\u1798\u17c9\u17c1\u1785\u178a\u17be\u1798\u17d2\u1794\u17b8\u1795\u17d2\u179f\u1796\u17d2\u179c\u1795\u17d2\u179f\u17b6\u1799\u179a\u17bc\u1794\u1797\u17b6\u1796\u179a\u1794\u179f\u17cb Moc Chau \u1780\u17cf\u178a\u17bc\u1785\u1787\u17b6\u1797\u17b6\u1796\u179a\u179f\u17cb\u179a\u17b6\u1799\u179a\u17b6\u1780\u17cb\u1791\u17b6\u1780\u17cb\u179a\u1794\u179f\u17cb\u1794\u17d2\u179a\u1787\u17b6\u1787\u1793\u1793\u17c5\u1791\u17b8\u1793\u17c1\u17c7\u17b2\u17d2\u1799\u1780\u17b6\u1793\u178f\u17c2\u1791\u17bc\u179b\u17c6\u1791\u17bc\u179b\u17b6\u1799\u17d4", 
              "lang": "km"
            }
          }, 
          "para_document_id": null, 
          "score": {
            "senAlign": 0.728810906
          }, 
          "updated_at": 1611130905, 
          "view_due_date": null, 
          "viewer_id": "None"
        }, 
        {
          "created_at": 1611130955, 
          "creator_id": "admin#firstname admin#lastname", 
          "editor": {
            "id": null, 
            "roles": null, 
            "username": null
          }, 
          "id": "6007e84b6dedcbecbda649de", 
          "last_history_record_id": null, 
          "newest_para_sentence": {
            "hash_content": "89fb5382375dba770e487b024914f163", 
            "rating": "unRated", 
            "text1": {
              "content": "\"\u0110\u1ebfn v\u1edbi M\u1ed9c Ch\u00e2u , du kh\u00e1ch \u0111\u01b0\u1ee3c ho\u00e0 m\u00ecnh v\u00e0o kh\u00f4ng gian v\u0103n ho\u00e1 mang \u0111\u1eadm n\u00e9t \u0111\u1ed9c \u0111\u00e1o c\u1ee7a \u0111\u1ed3ng b\u00e0o c\u00e1c d\u00e2n t\u1ed9c Th\u00e1i , M\u00f4ng tr\u00ean mi\u1ec1n th\u1ea3o nguy\u00ean xanh .\"", 
              "lang": "vi"
            }, 
            "text2": {
              "content": "\u1793\u17c5 Moc Chau \u1795\u17d2\u179b\u17c2\u1796\u17d2\u179a\u17bc\u1793 \u178f\u17d2\u179a\u17bc\u179c\u1794\u17b6\u1793\u178a\u17b6\u17c6\u1793\u17c5\u178f\u17b6\u1798\u1785\u17c6\u1780\u17b6\u179a \u1796\u17c1\u179b\u1781\u17d2\u179b\u17c7 \u178a\u17be\u1798\u1796\u17d2\u179a\u17bc\u1793\u1782\u17d2\u179a\u1794\u178a\u178e\u17d2\u178f\u1794\u17cb\u1797\u17bc\u1798\u17b7\u1798\u17bd\u1799\u1791\u17b6\u17c6\u1784\u1798\u17bc\u179b \u178a\u17bc\u1785\u17d2\u1793\u17c1\u17c7\u1793\u17c5\u1796\u17c1\u179b\u178a\u17c2\u179b\u1796\u17d2\u179a\u17bc\u1793\u179a\u17b8\u1780\u179f\u17d2\u1782\u17bb\u17c7\u179f\u17d2\u1782\u17b6\u1799 \u1798\u17b6\u1793\u1793\u17d0\u1799\u1790\u17b6 \u1796\u17bb\u17c6\u1798\u17b6\u1793\u1795\u17d2\u1780\u17b6\u178e\u17b6\u178a\u17c2\u179b\u17a0\u17ca\u17b6\u1793\u1794\u1784\u17d2\u17a2\u17bd\u178f\u179f\u1798\u17d2\u179a\u17b6\u179f\u17cb\u17a1\u17be\u1799\u17d4", 
              "lang": "km"
            }
          }, 
          "original_para_sentence": {
            "hash_content": "89fb5382375dba770e487b024914f163", 
            "rating": "unRated", 
            "text1": {
              "content": "\"\u0110\u1ebfn v\u1edbi M\u1ed9c Ch\u00e2u , du kh\u00e1ch \u0111\u01b0\u1ee3c ho\u00e0 m\u00ecnh v\u00e0o kh\u00f4ng gian v\u0103n ho\u00e1 mang \u0111\u1eadm n\u00e9t \u0111\u1ed9c \u0111\u00e1o c\u1ee7a \u0111\u1ed3ng b\u00e0o c\u00e1c d\u00e2n t\u1ed9c Th\u00e1i , M\u00f4ng tr\u00ean mi\u1ec1n th\u1ea3o nguy\u00ean xanh .\"", 
              "lang": "vi"
            }, 
            "text2": {
              "content": "\u1793\u17c5 Moc Chau \u1795\u17d2\u179b\u17c2\u1796\u17d2\u179a\u17bc\u1793 \u178f\u17d2\u179a\u17bc\u179c\u1794\u17b6\u1793\u178a\u17b6\u17c6\u1793\u17c5\u178f\u17b6\u1798\u1785\u17c6\u1780\u17b6\u179a \u1796\u17c1\u179b\u1781\u17d2\u179b\u17c7 \u178a\u17be\u1798\u1796\u17d2\u179a\u17bc\u1793\u1782\u17d2\u179a\u1794\u178a\u178e\u17d2\u178f\u1794\u17cb\u1797\u17bc\u1798\u17b7\u1798\u17bd\u1799\u1791\u17b6\u17c6\u1784\u1798\u17bc\u179b \u178a\u17bc\u1785\u17d2\u1793\u17c1\u17c7\u1793\u17c5\u1796\u17c1\u179b\u178a\u17c2\u179b\u1796\u17d2\u179a\u17bc\u1793\u179a\u17b8\u1780\u179f\u17d2\u1782\u17bb\u17c7\u179f\u17d2\u1782\u17b6\u1799 \u1798\u17b6\u1793\u1793\u17d0\u1799\u1790\u17b6 \u1796\u17bb\u17c6\u1798\u17b6\u1793\u1795\u17d2\u1780\u17b6\u178e\u17b6\u178a\u17c2\u179b\u17a0\u17ca\u17b6\u1793\u1794\u1784\u17d2\u17a2\u17bd\u178f\u179f\u1798\u17d2\u179a\u17b6\u179f\u17cb\u17a1\u17be\u1799\u17d4", 
              "lang": "km"
            }
          }, 
          "para_document_id": null, 
          "score": {
            "senAlign": 0.713172913
          }, 
          "updated_at": 1611130905, 
          "view_due_date": null, 
          "viewer_id": "None"
        }, 
        {
          "created_at": 1611130955, 
          "creator_id": "admin#firstname admin#lastname", 
          "editor": {
            "id": null, 
            "roles": null, 
            "username": null
          }, 
          "id": "6007e84b6dedcbecbda649df", 
          "last_history_record_id": null, 
          "newest_para_sentence": {
            "hash_content": "ece480cb831060576f24df32cafb9c42", 
            "rating": "unRated", 
            "text1": {
              "content": "\"\u0110i\u1ec1u n\u00e0y h\u1ee9a h\u1eb9n nhi\u1ec1u k\u1ebft qu\u1ea3 kh\u1ea3 quan v\u1ec1 ho\u1ea1t \u0111\u1ed9ng du l\u1ecbch trong m\u1ed9t n\u0103m \u0111\u01b0\u1ee3c \u0111\u00e1nh gi\u00e1 l\u00e0 kh\u00f3 kh\u0103n , c\u00f9ng v\u1edbi nhi\u1ec1u ng\u00e0nh kinh t\u1ebf kh\u00e1c do \u1ea3nh h\u01b0\u1edfng t\u1eeb \u0111\u1ea1i d\u1ecbch Covid-19 : \u0110\u1ec3 ph\u00e1t tri\u1ec3n t\u1ed1t h\u01a1n du l\u1ecbch trong giai \u0111o\u1ea1n t\u1edbi th\u00ec m\u1ed9t trong nh\u1eefng nhi\u1ec7m v\u1ee5 \u0111\u1eb7t ra cho ch\u00fang t\u00f4i l\u00e0 l\u00e0m th\u1ebf n\u00e0o c\u00e1c \u0111i\u1ec3m \u0111\u1ebfn du l\u1ecbch c\u1ee7a M\u1ed9c Ch\u00e2u ph\u1ea3i qu\u1ea3n l\u00fd t\u1ed1t , c\u0169ng nh\u01b0 l\u00e0 ph\u00e1t huy t\u1ed1t h\u01a1n n\u1eefa vai tr\u00f2 c\u1ee7a c\u00e1c \u0111i\u1ec3m \u0111\u1ebfn du l\u1ecbch ; c\u00e1c c\u01a1 s\u1edf kinh doanh du l\u1ecbch c\u0169ng ph\u1ea3i c\u00f3 chi\u1ebfn l\u01b0\u1ee3c cho m\u00ecnh \u0111\u1ec3 l\u00e0m th\u1ebf n\u00e0o \u0111\u00f3 h\u00ecnh \u1ea3nh c\u1ee7a M\u1ed9c Ch\u00e2u s\u1ebd \u0111\u1ebfn \u0111\u01b0\u1ee3c v\u1edbi \u0111\u00f4ng \u0111\u1ea3o ng\u01b0\u1eddi d\u00e2n h\u01a1n v\u00e0 nh\u01b0 v\u1eady th\u00ec ch\u00fang t\u00f4i hy v\u1ecdng r\u1eb1ng sau d\u1ecbch Covid-19 th\u00ec du l\u1ecbch M\u1ed9c Ch\u00e2u s\u1ebd ph\u1ee5c h\u1ed3i m\u1ed9t c\u00e1ch nhanh ch\u00f3ng .\"", 
              "lang": "vi"
            }, 
            "text2": {
              "content": "\u1798\u17d2\u1799\u17c9\u17b6\u1784\u179c\u17b7\u1789\u1791\u17c0\u178f \u1780\u17d2\u179a\u17bb\u1798\u17a0\u17ca\u17bb\u1793\u1791\u17c1\u179f\u1785\u179a\u178e\u17cd\u1793\u17b6\u1793\u17b6 \u178f\u17d2\u179a\u17bc\u179c\u1798\u17b6\u1793\u1791\u17b7\u179f\u178a\u17c5\u1791\u17c1\u179f\u1785\u179a\u178e\u17cd \u1793\u17b7\u1784\u1798\u17b6\u1793\u1799\u17bb\u1791\u17d2\u1792\u179f\u17b6\u179f\u17d2\u179a\u17d2\u178f\u1787\u17b6\u1780\u17cb\u179f\u17d2\u178f\u17c2\u1784\u1795\u1784\u178a\u17c2\u179a \u1796\u17c4\u179b\u1782\u17ba \u1792\u17d2\u179c\u17be\u1799\u17c9\u17b6\u1784\u1798\u17c9\u17c1\u1785\u178a\u17be\u1798\u17d2\u1794\u17b8\u1795\u17d2\u179f\u1796\u17d2\u179c\u1795\u17d2\u179f\u17b6\u1799\u179a\u17bc\u1794\u1797\u17b6\u1796\u179a\u1794\u179f\u17cb Moc Chau \u1780\u17cf\u178a\u17bc\u1785\u1787\u17b6\u1797\u17b6\u1796\u179a\u179f\u17cb\u179a\u17b6\u1799\u179a\u17b6\u1780\u17cb\u1791\u17b6\u1780\u17cb\u179a\u1794\u179f\u17cb\u1794\u17d2\u179a\u1787\u17b6\u1787\u1793\u1793\u17c5\u1791\u17b8\u1793\u17c1\u17c7\u17b2\u17d2\u1799\u1780\u17b6\u1793\u178f\u17c2\u1791\u17bc\u179b\u17c6\u1791\u17bc\u179b\u17b6\u1799\u17d4", 
              "lang": "km"
            }
          }, 
          "original_para_sentence": {
            "hash_content": "ece480cb831060576f24df32cafb9c42", 
            "rating": "unRated", 
            "text1": {
              "content": "\"\u0110i\u1ec1u n\u00e0y h\u1ee9a h\u1eb9n nhi\u1ec1u k\u1ebft qu\u1ea3 kh\u1ea3 quan v\u1ec1 ho\u1ea1t \u0111\u1ed9ng du l\u1ecbch trong m\u1ed9t n\u0103m \u0111\u01b0\u1ee3c \u0111\u00e1nh gi\u00e1 l\u00e0 kh\u00f3 kh\u0103n , c\u00f9ng v\u1edbi nhi\u1ec1u ng\u00e0nh kinh t\u1ebf kh\u00e1c do \u1ea3nh h\u01b0\u1edfng t\u1eeb \u0111\u1ea1i d\u1ecbch Covid-19 : \u0110\u1ec3 ph\u00e1t tri\u1ec3n t\u1ed1t h\u01a1n du l\u1ecbch trong giai \u0111o\u1ea1n t\u1edbi th\u00ec m\u1ed9t trong nh\u1eefng nhi\u1ec7m v\u1ee5 \u0111\u1eb7t ra cho ch\u00fang t\u00f4i l\u00e0 l\u00e0m th\u1ebf n\u00e0o c\u00e1c \u0111i\u1ec3m \u0111\u1ebfn du l\u1ecbch c\u1ee7a M\u1ed9c Ch\u00e2u ph\u1ea3i qu\u1ea3n l\u00fd t\u1ed1t , c\u0169ng nh\u01b0 l\u00e0 ph\u00e1t huy t\u1ed1t h\u01a1n n\u1eefa vai tr\u00f2 c\u1ee7a c\u00e1c \u0111i\u1ec3m \u0111\u1ebfn du l\u1ecbch ; c\u00e1c c\u01a1 s\u1edf kinh doanh du l\u1ecbch c\u0169ng ph\u1ea3i c\u00f3 chi\u1ebfn l\u01b0\u1ee3c cho m\u00ecnh \u0111\u1ec3 l\u00e0m th\u1ebf n\u00e0o \u0111\u00f3 h\u00ecnh \u1ea3nh c\u1ee7a M\u1ed9c Ch\u00e2u s\u1ebd \u0111\u1ebfn \u0111\u01b0\u1ee3c v\u1edbi \u0111\u00f4ng \u0111\u1ea3o ng\u01b0\u1eddi d\u00e2n h\u01a1n v\u00e0 nh\u01b0 v\u1eady th\u00ec ch\u00fang t\u00f4i hy v\u1ecdng r\u1eb1ng sau d\u1ecbch Covid-19 th\u00ec du l\u1ecbch M\u1ed9c Ch\u00e2u s\u1ebd ph\u1ee5c h\u1ed3i m\u1ed9t c\u00e1ch nhanh ch\u00f3ng .\"", 
              "lang": "vi"
            }, 
            "text2": {
              "content": "\u1798\u17d2\u1799\u17c9\u17b6\u1784\u179c\u17b7\u1789\u1791\u17c0\u178f \u1780\u17d2\u179a\u17bb\u1798\u17a0\u17ca\u17bb\u1793\u1791\u17c1\u179f\u1785\u179a\u178e\u17cd\u1793\u17b6\u1793\u17b6 \u178f\u17d2\u179a\u17bc\u179c\u1798\u17b6\u1793\u1791\u17b7\u179f\u178a\u17c5\u1791\u17c1\u179f\u1785\u179a\u178e\u17cd \u1793\u17b7\u1784\u1798\u17b6\u1793\u1799\u17bb\u1791\u17d2\u1792\u179f\u17b6\u179f\u17d2\u179a\u17d2\u178f\u1787\u17b6\u1780\u17cb\u179f\u17d2\u178f\u17c2\u1784\u1795\u1784\u178a\u17c2\u179a \u1796\u17c4\u179b\u1782\u17ba \u1792\u17d2\u179c\u17be\u1799\u17c9\u17b6\u1784\u1798\u17c9\u17c1\u1785\u178a\u17be\u1798\u17d2\u1794\u17b8\u1795\u17d2\u179f\u1796\u17d2\u179c\u1795\u17d2\u179f\u17b6\u1799\u179a\u17bc\u1794\u1797\u17b6\u1796\u179a\u1794\u179f\u17cb Moc Chau \u1780\u17cf\u178a\u17bc\u1785\u1787\u17b6\u1797\u17b6\u1796\u179a\u179f\u17cb\u179a\u17b6\u1799\u179a\u17b6\u1780\u17cb\u1791\u17b6\u1780\u17cb\u179a\u1794\u179f\u17cb\u1794\u17d2\u179a\u1787\u17b6\u1787\u1793\u1793\u17c5\u1791\u17b8\u1793\u17c1\u17c7\u17b2\u17d2\u1799\u1780\u17b6\u1793\u178f\u17c2\u1791\u17bc\u179b\u17c6\u1791\u17bc\u179b\u17b6\u1799\u17d4", 
              "lang": "km"
            }
          }, 
          "para_document_id": null, 
          "score": {
            "senAlign": 0.766545773
          }, 
          "updated_at": 1611130905, 
          "view_due_date": null, 
          "viewer_id": "None"
        }
      ];
    const [dataSource, setDataSource] = useState(data);
    const [count, setCount] = useState(data.length + 1);
    const [value, setValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);
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
    const [ratingList, setRatingList] = useState([]);

    const ratingOption = [
        <Select.Option key='all'>{ t('sentencePage.all') }</Select.Option>
    ].concat(
        ratingList.map((rating) => {
            return <Select.Option key={rating}>{ t(`sentencePage.${rating}`) }</Select.Option>;
        })
    );

    const isAllowedToEdit = (paraSentence) => {
        return true;
        // // if current user roles contains admin only -> can not edit
        // if (isAdminOnly()) return false;

        // // if editted by reviewer and current user is editor -> can not edit
        // return  !(paraSentence.editor && paraSentence.editor.roles &&
        //     (paraSentence.editor.roles.includes('admin') || paraSentence.editor.roles.includes('reviewer')) &&
        //     currentUserRoles.includes('member')) 
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

    const [isModalImportVisible, setIsModalImportVisible] = useState(false);

    const timeformat = (last_update) => {
        const d = new Date(last_update);
        return moment(d).format('DD/MM/YYYY');
    };

    const columns = [
        {
            title: t(`Language.${filter.lang1}`) ,
            dataIndex: 'text1',
            key: 'text1',
            render: (text, paraSentence, index) => {
                return (
                    <React.Fragment>
                        { renderText('text1', paraSentence, index) }
                        <Button
                            type='link'
                            onClick={ () => showFullDocModal(paraSentence) }
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
            title: t('sentencePage.lastUpdate'),
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

    const showFullDocModal = (paraDocument) => {
        Modal.info({
            content: (
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <CustomCol
                        lang={
                            t(`Language.${paraDocument.newest_para_sentence['text1'].lang}`)
                        }
                        documentContent={
                            paraDocument.newest_para_sentence['text1'].content
                        }
                        style={{ marginBottom: '20px' }}
                    />

                    <CustomCol
                        lang={
                            t(`Language.${paraDocument.newest_para_sentence['text2'].lang}`)
                        }
                        documentContent={
                            paraDocument.newest_para_sentence['text2'].content
                        }
                    />
                </Row>
            ),
            width: '80vw',
            style: { maxWidth: '950px' },
            icon: null
        })
    }

    const renderText = (key, paraSentence, index) => {

        let lastestContent = paraSentence.newest_para_sentence[key].content;
        const maxChar = 100;
        const exceedMaxChar = lastestContent.length > maxChar;
        let disabled = !isAllowedToEdit(paraSentence);

        return (
            <CustomTextArea
                className={ disabled && isAdminOnly() ? 'input-admin-disable' : '' }
                style={{ border: 'none' }}
                key={ paraSentence['id'] }
                autoSize
                defaultValue={
                    exceedMaxChar
                    ? `${lastestContent.substring(0, maxChar + 1)}...`
                    : lastestContent
                }
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
                    {/* <div className='header-controller'>
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
                    </div> */}

                    <Table
                        className='table-striped-rows'
                        // rowSelection={{
                        //     type: 'checkbox',
                        //     ...rowSelection,
                        // }}
                        dataSource={data}
                        columns={columns}
                        pagination={{ pageSize: 5 }}>
                    </Table>
                </Card>
            </SiteLayout>
        </React.Fragment>
    );
};

export default DocumentPage;
