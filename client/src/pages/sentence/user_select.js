import React, { Component, useEffect, useState } from 'react';
import VirtualizedSelect from 'react-virtualized-select';

import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';

import { useTranslation } from 'react-i18next';

import adminUserAPI from '../../api/admin/user';

const UserSelect = (props) => {
    const { t } = useTranslation(['common']);

    const { setSelectedUserId } = props;

    const [selectedUser, setSelectedUser] = useState();
    const [userList, setUserList] = useState({
        total: 0,
        items: [],
        page: 1,
        perPage: 10
    })
    const [searchTerm, setSearchTerm] = useState('')
    
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            let params = {
                'pagination__page': 1,
                'pagination__perPage': userList.perPage,
                'username': searchTerm
            };

            adminUserAPI.search(params).then(res => {
                setUserList(res.data);
            });
        }, 750)
    
        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm])

    const addOptions = () => {
        let params = {
            'pagination__page': userList.page + 1,
            'pagination__perPage': userList.perPage,
            'username': searchTerm
        };

        adminUserAPI.search(params).then(res => {
            console.log(res);
            setUserList({
                items: [...userList.items, ...res.data.items],
                page: res.data.page,
                perPage: res.data.perPage,
                total: res.data.total
            });
        });
    }

    const handleChange = (value) => {
        setSelectedUser(value);
        if (value === null) setSelectedUserId(null);
        else setSelectedUserId(value.id);
    }

    const handleOpen = () => {
        adminUserAPI.search({}).then(res => {
            setUserList(res.data);
        });
    }

    return (
        <React.Fragment>
            <VirtualizedSelect
                value={ selectedUser }
                options={ userList.items }
                labelKey='username'
                valueKey='id'
                onOpen={ handleOpen }
                onChange={ handleChange }
                onMenuScrollToBottom={ addOptions }
                onInputChange={ (value) => setSearchTerm(value) }
                placeholder={ t('sentencePage.searchByEditor') }
                noResultsText={ t('sentencePage.noMoreResults') }
            />
        </React.Fragment>
    );
}

export default UserSelect;
