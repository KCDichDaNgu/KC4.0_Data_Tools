import './style.module.scss';

import React, { useEffect, useState, useRef } from 'react';
import PageTitle from '../../../layout/site-layout/main/PageTitle';
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
    Form,
} from "antd";

import SiteLayout from '../../../layout/site-layout';
import settingAPI from '../../../api/admin/setting';

import { useTranslation } from 'react-i18next';

import { STATUS_CODES } from '../../../constants';
import { useForm } from 'antd/lib/form/Form';

const SettingPage = (props) => {
    
    const { t } = useTranslation(['common']);

    const [form] = useForm();

    const updateFormRules = {
        content: {
            min_words_of_vietnamese_sentence: [
                {
                    required: true,
                    message: t('formMessages.errors.fieldRequired'),
                },
            ],
        }
    } 

    useEffect(() => {
        getSetting()
    }, [])

    const getSetting = async () => {
        let result = await settingAPI.get();

        if (result.code == STATUS_CODES.success) {
            form.setFieldsValue({content: result.data.content});
        }
    }

    const updateSetting = async (updatedData) => {

        let result = await settingAPI.update(updatedData);

        if (result.code == STATUS_CODES.success) {
            message.success(t('serverMessages.success.updateSuccess'))

            getSetting();
        }
    };

    return (
        <React.Fragment>
            <SiteLayout>
                <PageTitle
                    heading={ t('settingPage.title') }
                    // subheading='Create new content...'
                    icon='pe-7s-home icon-gradient bg-happy-itmeo'
                />

                <Card className='user-table-card'>

                    <Form 
                        form={ form }
                        onFinish={ updateSetting }>

                        <Row gutter={{ xs: 0, sm: 0, md: 24, lg: 32 }}>

                            <Col xs={ 24 } md={ 24 }>

                                <label>{ t('minWordsOfVietnameseSentence') }</label>

                                <Form.Item 
                                    name={ ['content', 'min_words_of_vietnamese_sentence'] }
                                    rules={ updateFormRules.content.min_words_of_vietnamese_sentence }>
                                    <Input className='user-input' /> 
                                </Form.Item>
                            </Col>
                        </Row>

                        <Button 
                            type="primary" 
                            htmlType="submit">
                            { t('update') }
                        </Button>
                    </Form>
                </Card>
            </SiteLayout>
        </React.Fragment>
    );
};

export default SettingPage;
