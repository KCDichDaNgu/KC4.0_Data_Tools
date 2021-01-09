import React, { useEffect, useState } from "react";

import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Select from 'react-dropdown-select';

import {
    Button, Form,
    FormGroup, Label,
    Input, FormText,
    FormFeedback,
    Row, Col,
    Card, CardBody,
    CardHeader,
    CustomInput,
    UncontrolledCollapse,
    CardFooter
} from 'reactstrap';

import PageTitle from '../../../Layout/SiteLayout/AppMain/PageTitle';
import SiteLayout from '../../../Layout/SiteLayout';

import contentAPI from '../../../api/admin/content';

import { toast } from 'react-toastify';

const models = {
    'paraphrase/substitute_word_by_ppdb_synonym': {
        label: 'paraphrase/substitute_word_by_ppdb_synonym',
        type: 'substitute_word_by_ppdb_synonym',
        desc: `Substitute word by PPDB's synonym`
    },
    'paraphrase/rewrite_by_gpt2': {
        label: 'paraphrase/rewrite_by_gpt2',
        type: 'rewrite_by_gpt2',
        desc: 'Rewrite by Gpt2'
    },
    'paraphrase/insert_word_by_contextual_word_embeddings': {
        label: 'paraphrase/insert_word_by_contextual_word_embeddings',
        type: 'insert_word_by_contextual_word_embeddings',
        desc: 'Insert word by contextual word embeddings'
    },
}

const DownloadLogPage = (props) => {

    const modelOpts = [
        { 
            name: 'GPT2 Walmart', 
            value: 'gpt2-walmart' 
        },
        { 
            name: `Substitute word by PPDB's synonym`, 
            value: 'paraphrase/substitute_word_by_ppdb_synonym' 
        },
        { 
            name: 'Rewrite by Gpt2', 
            value: 'paraphrase/rewrite_by_gpt2' 
        },
        { 
            name: 'Insert word by contextual word embeddings', 
            value: 'paraphrase/insert_word_by_contextual_word_embeddings' 
        },
    ];

    let [ downloadLink, setDownloadLink ] = useState('');
    let [ selectedModel, setSelectedModel ] = useState([{ 
        name: 'GPT2 Walmart', 
        value: 'gpt2-walmart' 
    }])
    
    useEffect(() => {
        document.title = 'Download Data';
    });

    const getDownloadLink = async () => { 
        
        let result = await contentAPI.getDownloadLink({
            modelName: selectedModel[0].value 
        });

        try {

            if (result.code == 1) {
                toast['success']('Your link is ready');
    
                setDownloadLink(`${process.env.REACT_APP_SERVER_ENDPOINT}/${result.data.link}`);
            } else {
                toast['error']('Something wrong!');
            }

        } catch(e) {
            toast['error']('Something wrong!');
        }
    };

    return (
        <React.Fragment>
            
            <SiteLayout>
                   
                <PageTitle
                    heading="Download Data"
                    subheading="Get all data as csv"
                    icon="pe-7s-download icon-gradient bg-happy-itmeo"
                />

                <Card>
                    <CardHeader>
                        Download options
                    </CardHeader>

                    <CardBody>

                        <Label style={{
                            fontWeight: 700
                        }}>
                            Please select a model for downloading data
                        </Label>

                        <Select
                            style={{
                                width: '50%'
                            }}
                            options={ modelOpts }
                            values={ selectedModel }
                            labelField="name"
                            valueField="value"
                            searchBy="name"
                            name="selecteModel"
                            onChange={(selectedOpt) => {
                                setSelectedModel(selectedOpt)
                            }}
                        />
                        
                    </CardBody>

                    <CardFooter>
                        <div style={{ textAlign: 'center' }}>
                            <button
                                className="btn btn-primary btn-lg" 
                                onClick={ getDownloadLink }
                                style={{ fontWeight: 600 }}>
                                Get Download Link
                            </button>
                        </div>
                        
                        {
                            downloadLink.length > 0 ? (
                                <div 
                                    className="ml-3"
                                    style={{ 
                                        textAlign: 'center'
                                    }}>

                                    <a 
                                        href={ downloadLink } 
                                        target="_blank" 
                                        download>
                                        Click here to download csv file
                                    </a>
                                </div>
                            ) : <></>
                        }
                    </CardFooter>
                </Card>

            </SiteLayout>
        </React.Fragment>
    );
}

export default connect(null, {})(DownloadLogPage);
