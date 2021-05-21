import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import VirtualizedSelect from 'react-virtualized-select';

import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';

import { useTranslation } from 'react-i18next';

import dataFieldAPI from '../api/data-field';

const DataFieldSelect = forwardRef((props, ref) => {
    const { t } = useTranslation(['common']);

    const { setSelectedDataFieldId } = props;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDataField, setSelectedDataField] = useState();
    const [dataFieldList, setDataFieldList] = useState({
        total: 0,
        items: [],
        page: 1,
        perPage: 10
    });

    useImperativeHandle(ref, () => ({

        setPreSelectedDataField(data_field_id, name) {
            if (data_field_id === null) {
                setSelectedDataField(null);
            } else {
                setSelectedDataField({
                    id: data_field_id,
                    name: name
                });
            }
        }

    }));
    
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            let params = {
                'pagination__page': 1,
                'pagination__perPage': dataFieldList.perPage,
                'name': searchTerm,
            };
            
            dataFieldAPI.search(params).then(res => {
                res.data.items.forEach(item => {
                    if (item.name === t("defaultField")) {
                        handleChange(item);
                    }
                });
                setDataFieldList(res.data);
            });
        }, 750)
    
        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm]);

    const addOptions = async () => {
        let params = {
            'pagination__page': dataFieldList.page + 1,
            'pagination__perPage': dataFieldList.perPage,
            'name': searchTerm
        };

        try {
            let res = await dataFieldAPI.search(params);

            setDataFieldList({
                items: [...dataFieldList.items, ...res.data.items],
                page: res.data.page,
                perPage: res.data.perPage,
                total: res.data.total
            });
        } catch (err) {

        }
        
    } 

    const handleChange = (value) => {
        setSelectedDataField(value);
        
        if (value === null) setSelectedDataFieldId(null);
        else setSelectedDataFieldId(value.id);
    }

    const handleOpen = () => {
        dataFieldAPI.search({
            'name': searchTerm
        }).then(res => {
            setDataFieldList(res.data);
        });
    }

    return (
        <React.Fragment>
            <VirtualizedSelect
                value={ selectedDataField }
                options={ dataFieldList.items }
                labelKey='name'
                valueKey='id'
                onOpen={ handleOpen }
                onChange={ handleChange }
                searchPromptText="awrwer"
                onMenuScrollToBottom={ addOptions }
                onInputChange={ (value) => setSearchTerm(value) }
                placeholder={ t('dataField') }
                noResultsText={ t('sentencePage.noMoreResults') }
            />
        </React.Fragment>
    );
});

export default DataFieldSelect;
