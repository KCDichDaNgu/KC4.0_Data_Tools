import React, { useEffect, useState, useRef } from "react";
import PageTitle from "../../layout/site-layout/main/PageTitle";
import paraSentenceAPI from "../../api/paraSentence";

import {
  Input,
  Table,
  Button,
  Card,
  Select,
  Upload,
  message,
  Spin
} from "antd";
import { UploadOutlined } from '@ant-design/icons';
import SiteLayout from "../../layout/site-layout";

import "./Sentence.module.css";
import { set } from "numeral";

import { useTranslation } from 'react-i18next';

const moment = require("moment");

const { TextArea } = Input;
const { Option } = Select;

const SentencePage = (props) => {

  const { t } = useTranslation(['common']);
  
  const [dataSource, setDataSource] = useState([]);

  const [value, setValue] = useState("");
  const [selectedDomain, setSeletedDomain] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [paginationParams, setPaginationParams] = useState({});
  const [requestParams, setRequestParams] = useState({
    domain: "",
    lang1: "",
    lang2: "",
    sort_by: "",
    sort_order: "",
    page: ""
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  const timeformat = (last_update) => {
    var a = new Date(last_update * 1000);
    // var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = a.getMonth(); //months[a.getMonth()];
    var date = a.getDate();
    // var hour = a.getHours();
    // var min = a.getMinutes();
    // var sec = a.getSeconds();
    var time = date + "/" + month + "/" + year;
    return time;
  };

  const columns = [
    // {
    //   title: "IDs",
    //   dataIndex: "id",
    //   key: "id",
    //   sorter: (a, b) => a.id - b.id,
    // },
    {
      title: `${ t('sentence.text') } 1`,
      dataIndex: "text1",
      key: "text1",
      render: (text) => (
        <TextArea rows={4} value={text} />
      )
    },
    {
      title: `${ t('sentence.text') } 2`,
      dataIndex: "text2",
      key: "text2",
      render: (text) => (
        <TextArea rows={4} value={text} />
      )
    },
    {
      title: t('sentence.lastUpdate'),
      dataIndex: "updated_time",
      key: "updated_time",
      render: (updated_time) => (
        timeformat(updated_time)
      ),
      sorter: (a, b, sortOrder) => {},
      sortDirections: ['ascend', 'descend', 'ascend']
    },
    {
      title: t('sentence.score'),
      dataIndex: "score",
      key: "score.senAlign",
      render: (score) => Number(score['senAlign']).toFixed(2),
      sorter: (a, b, sortOrder) => {},
      sortDirections: ['ascend', 'descend', 'ascend']
    },
    {
      title: t('sentence.rating'),
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (
        <Select
          style={{
            width: "150px",
          }}
          value={ rating }
          // onChange={(value) => handleChange(value, "rating")}
          >
          {ratingOption}
        </Select>
      ),
    },
    // {
    //   title: t('sentence.action'),
    //   dataIndex: "",
    //   key: "action",
    //   render: () => 
    //     <div>
    //       <Button type="primary" style={{background:'#F22D4E',borderColor:'#F22D4E' }}>
    //         { t('sentence.reject') }
    //       </Button>
    //       <Button type="primary" style={{ marginLeft: "4px",background:'#2CA189',borderColor:'#2CA189' }}>
    //         { t('sentence.approve') }
    //       </Button>
    //   </div>,
    // },
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
      placeholder={ t('sentence.searchBox') }
      className="search-input-box"
      value={value}
      onChange={(e) => {
        const currValue = e.target.value;
        setValue(currValue);
        const filteredData = dataSource.filter((entry) => {
          if (
            entry.text1.includes(currValue) ||
            entry.text2.includes(currValue)
          )
            return true;
        });
        setDataSource(filteredData);
      }}
    />
  );

  const handleChange = (value, key) => {
    setRequestParams({ ...requestParams, [key]: value });
  };

  const handleFilter = () => {
    let params = {
      ...requestParams,
      page: 1
    }; // reset page to 1

    setRequestParams(params);

    paraSentenceAPI.getSentences(params).then((res) => {
      setDataSource(res.data.data)
      setPaginationParams(res.data.pagination);
    });
  };

  const [langList1, setLangList1] = useState([]);
  const [langList2, setLangList2] = useState([]);
  const [ratingList, setRatingList] = useState([]);

  const lang1Option = langList1.map((lang) => {
    return <Option key={lang}>{lang}</Option>;
  });
  const lang2Option = langList2.map((lang) => {
    return <Option key={lang}>{lang}</Option>;
  });

  const ratingOption = ratingList.map((rating) => {
    return <Option key={rating}>{ t(`sentence.${rating}`) }</Option>;
  });

  const uploadFile = {
    name: 'file',
    action: paraSentenceAPI.importFromFileUrl(),
    showUploadList: false,
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        setUploadingFile(true);
      }

      if (info.file.status === 'done') {
        setUploadingFile(false);

        let nSuccess = info.file.response.n_success;
        let nData = info.file.response.n_data;

        message.success(`${ t('sentence.imported') } ${ nSuccess }/${ nData }\
           ${ t('sentence.pairParaSentences') }`);

        // reload new results
        paraSentenceAPI.getSentences({}).then((res) => {
          setDataSource(res.data.data);
          setPaginationParams(res.data.pagination);
        });
      } else if (info.file.status === 'error') {
        setUploadingFile(false);

        message.error(`${ info.file.name } ${ t('sentence.uploadFailed') }`);
      }
    },
  };

  useEffect(() => {
    paraSentenceAPI.getSentences({}).then((res) => {
      setDataSource(res.data.data);
      setPaginationParams(res.data.pagination);
    });
    paraSentenceAPI.getOptions().then((res) => {
      setLangList1(res.data.lang1);
      setLangList2(res.data.lang2);
      setRatingList(res.data.rating);
    });
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    let params = {
      ...requestParams,
      sort_by: sorter['columnKey'],
      sort_order: sorter['order'],
      page: pagination['current']
    }

    setRequestParams(params);

    paraSentenceAPI.getSentences(params).then((res) => {
      setDataSource(res.data.data);
      setPaginationParams(res.data.pagination);
    });
  }

  return (
    <React.Fragment>
      <SiteLayout>
        <PageTitle
          heading={ t('sentence.title') }
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
                    { t('sentence.uploadFile') }
                  </Button>
                </Upload>
              </div>
            )
          }
        />

        <Card className="domain-table-card">
          <div className="header-controller">
            {FilterByNameInput}
            <div style={{ float: "left" }}>

              <div style={{ marginLeft: "30px", display: "inline-block" }}>
                <span style={{ marginRight: "10px" }}>Lang 1:</span>
                <Select
                  style={{
                    width: "100px",
                  }}
                  defaultValue={lang1Option.length === 0 ? "" : lang1Option[0]}
                  onChange={(value) => handleChange(value, "lang1")}
                >
                  {lang1Option}
                </Select>
              </div>
              <div style={{ marginLeft: "30px", display: "inline-block" }}>
                <span style={{ marginRight: "10px" }}>Lang 2:</span>
                <Select
                  showSearch
                  style={{
                    width: "100px",
                  }}
                  defaultValue={lang2Option.length === 0 ? "" : lang2Option[0]}
                  onChange={(value) => handleChange(value, "lang2")}
                >
                  {lang2Option}
                </Select>
              </div>
              <div style={{ marginLeft: "30px", display: "inline-block" }}>
                <span style={{ marginRight: "10px" }}>{ t('sentence.rating') }:</span>
                <Select
                  showSearch
                  style={{
                    width: "150px",
                  }}
                  defaultValue={
                    ratingOption.length === 0 ? "" : ratingOption[0]
                  }
                  onChange={(value) => handleChange(value, "rating")}
                >
                  {ratingOption}
                </Select>
              </div>

              <Button
                showsearchshowsearch="true"
                style={{ width: "100px", marginLeft: "30px", background: '#384AD7', borderColor: '#384AD7'}}
                type="primary"
                onClick={handleFilter}>
                { t('sentence.filter') }
              </Button>
            </div>
          </div>
          <Table
            className="table-striped-rows"
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
            }}
            dataSource={dataSource}
            columns={columns}
            onChange={handleTableChange}
            pagination={{ 
              pageSize: paginationParams.page_size,
              total: paginationParams.total_items,
              current: paginationParams.current_page
            }}
          ></Table>
        </Card>
      </SiteLayout>
    </React.Fragment>
  );
};

export default SentencePage;
