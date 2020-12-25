import React, { useEffect, useState, useRef } from "react";
import PageTitle from "../../Layout/SiteLayout/AppMain/PageTitle";
import paraSentenceAPI from "../../api/paraSentence";

import {
  Input,
  Table,
  Button,
  Popconfirm,
  Card,
  Dropdown,
  Menu,
  Select,
} from "antd";
import SiteLayout from "../../Layout/SiteLayout";

import "./Sentence.module.css";
import { set } from "numeral";
const moment = require("moment");

const SentencePage = (props) => {
  const [data, setData] = useState([
    {
      key: "1",
      id: 1,
      status: "Approved",
      domain: "vov.vn",
      lang_1: "en-US",
      lang_2: "vi-VI",
      text_1_lang:
        "He was chosen to serve as a political hostage in the Kingdom of Zhao",
      text_2_lang: "Ông phải làm con tin chính trị ở kinh đô nước Triệu",
      score: 0.4,
      last_update: 1608488868000,
    },
    {
      key: "2",
      id: 2,
      status: "Rejected",
      domain: "vov.vn",
      lang_1: "en-US",
      lang_2: "vi-VI",
      text_1_lang:
        "People happy for outcomes of Party Central Committee’s 14th session",
      text_2_lang:
        "Người dân cả nước phấn khởi trước kết quả Hội nghị Trung ương 14",
      score: 0.4,
      last_update: 1608488868000,
    },
    {
      key: "3",
      id: 3,
      status: "Approved",
      domain: "vnexpress.net",
      lang_1: "en-US",
      lang_2: "zh-CN",
      text_1_lang: "The programme of support for arts and crafts design",
      score: 0.9,
      text_2_lang: "扶持艺术和工艺设计项目",
      last_update: 1608488868000,
    },
    {
      key: "4",
      id: 4,
      status: "Rejected",
      domain: "vtv.vn",
      lang_1: "en-US",
      lang_2: "zh-CN",
      text_1_lang: "The Nazis steal the Ark and capture Indiana and Marion",
      score: 0.8,
      text_2_lang: "纳粹偷了法柜,并抓住了印第安纳和马里昂",
      last_update: 1608488868000,
    },
    {
      key: "5",
      id: 5,
      status: "Approved",
      domain: "vtv.vn",
      lang_1: "vi-VI",
      lang_2: "en-US",
      text_1_lang: "Có lẽ do hình thái di truyền của hệ thống miễn dịch.",
      text_2_lang:
        "It is probably due to the genetic morphology of the immune system.",
      score: 0.7,
      last_update: 1608488868000,
    },
    {
      key: "6",
      id: 6,
      status: "Approved",
      domain: "vnexpress.net",
      lang_1: "vi-VI",
      lang_2: "en-US",
      text_1_lang:
        "Các thiết kế không chính thống của Tiến sĩ Porsche ít được ưa chuộng.",
      text_2_lang: "Dr. Porsche 's unorthodox designs gathered little favour.",
      score: 0.6,
      last_update: 1608488868000,
    },
    {
      key: "7",
      id: 7,
      status: "Draft",
      domain: "vov.vn",
      lang_1: "vi-VI",
      lang_2: "pt-PT",
      text_1_lang: "Tôi gửi kèm cái bật lửa như một món quà chia tay.",
      text_2_lang: "Anexei o meu isqueiro como presente de despedida para ti",
      score: 0.7,
      last_update: 1608488868000,
    },
    {
      key: "8",
      id: 8,
      status: "Draft",
      domain: "vov.vn",
      lang_1: "zh-CN",
      lang_2: "vi-VI",
      text_1_lang:
        "1929年他毕业于托卢卡的科学和文学研究所,在那里他成为社会主义工党的代表和学生领袖。",
      text_2_lang:
        "Năm 1929, ông tốt nghiệp Học viện Khoa học và Văn học Toluca, nơi ông là một đại biểu và là lãnh đạo sinh viên của Đảng Lao động Xã hội Chủ nghĩa.",
      score: 0.9,
      last_update: 1608488868000,
    },
    {
      key: "9",
      id: 9,
      status: "Approved",
      domain: "vnexpress.net",
      lang_1: "zh-CN",
      lang_2: "vi-VI",
      text_1_lang: "新皇 登基 之前 别 让 宰相 接触 她",
      text_2_lang:
        "Giữ con bé tránh xa Thừa Tướng tới khi lễ lên ngôi kết thúc.",
      score: 0.7,
      last_update: 1608488868000,
    },
    {
      key: "10",
      id: 10,
      status: "Rejected",
      domain: "vov.vn",
      lang_1: "zh-CN",
      lang_2: "vi-VI",
      text_1_lang: "不過科學家仍然不清楚這些藍鯨在哪裡過冬。",
      text_2_lang:
        "Các nhà khoa học không biết những con cá voi xanh này sống ở đâu vào mùa đông.",
      score: 0.4,
      last_update: 1608488868000,
    },
  ]);
  const [dataSource, setDataSource] = useState(data);

  const [count, setCount] = useState(data.length + 1);
  const [value, setValue] = useState("");
  const [selectedDomain, setSeletedDomain] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    domain: "",
    lang1: "",
    lang2: "",
  });

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
      title: "Text 1",
      dataIndex: "text1",
      key: "text1",
    },
    {
      title: "Text 2",
      dataIndex: "text2",
      key: "text2",
    },
    {
      title: "Last Update",
      dataIndex: "updated_time",
      key: "updated_time",
      render: (last_update) => timeformat(last_update),
    },
    {
      title: "Score",
      dataIndex: "score[bert]",
      key: "score[bert]",
      sorter: (a, b) => a.score - b.score,
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      // render: () => (
      //     <Select defaultValue='Perfect' style={{ width: '200px' }}>
      //         {ratingOption}
      //     </Select>
      // ),
    },
    {
      title: "Action",
      dataIndex: "",
      key: "action",
      render: () => 
      <div>
        <Button type="primary" style={{background:'#F22D4E',borderColor:'#F22D4E' }}>Reject</Button>
        <Button type="primary" style={{ marginLeft: "4px",background:'#2CA189',borderColor:'#2CA189' }}>Approve</Button>
    </div>,
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
      placeholder="Search text..."
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
    setFilterOptions({ ...filterOptions, [key]: value });
    console.log(filterOptions);
  };

  const handleFilter = () => {
    // const filteredData = data.filter((item) => {
    //     for (var key in filterOptions) {
    //         if (item[key] === undefined || item[key] != filterOptions[key])
    //             return false;
    //     }
    //     return true;
    // });

    let filterParam = "";
    for (var key in filterOptions) {
      if (filterOptions[key] !== "") {
        if (filterParam === "") filterParam += "?";
        else filterParam += "&";
        filterParam += `${key}=${filterOptions[key]}`;
      }
    }

    paraSentenceAPI
      .filter(filterParam)
      .then((res) => setDataSource(res.data.data));
  };

  // let statusList = ['All', 'Draft', 'Approved', 'Rejected'];
  const [statusList, setStatusList] = useState([]);
  const [langList1, setLangList1] = useState([]);
  const [langList2, setLangList2] = useState([]);
  const [ratingList, setRatingList] = useState([]);

  // let langList = ['All', 'vi-VN', 'zh-CN', 'en-US', 'pt-PT'];

  // let ratingList = [
  //     'All',
  //     'Perfect',
  //     'Good',
  //     'Understand',
  //     'Understand Partially',
  //     'Cant Understand',
  // ];

  const statusOption = statusList.map((type) => {
    return <Option key={type}>{type}</Option>;
  });

  const lang1Option = langList1.map((lang) => {
    return <Option key={lang}>{lang}</Option>;
  });
  const lang2Option = langList2.map((lang) => {
    return <Option key={lang}>{lang}</Option>;
  });

  const ratingOption = ratingList.map((rating) => {
    return <Option key={rating}>{rating}</Option>;
  });

  useEffect(() => {
    paraSentenceAPI.getSentences().then((res) => {
      setDataSource(res.data.data);
    });
    paraSentenceAPI.getOptions().then((res) => {
      setStatusList(res.data.status);
      setLangList1(res.data.lang1);
      setLangList2(res.data.lang2);
      setRatingList(res.data.rating);
    });
  }, []);

  return (
    <React.Fragment>
      <SiteLayout>
        <PageTitle
          heading="Sentence"
          subheading="Create new content..."
          icon="pe-7s-home icon-gradient bg-happy-itmeo"
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
                <span style={{ marginRight: "10px" }}>Rating:</span>
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
              <div style={{ marginLeft: "30px", display: "inline-block" }}>
                <span style={{ marginRight: "10px" }}>Status:</span>
                <Select
                  showSearch
                  style={{
                    width: "150px",
                  }}
                  defaultValue={statusOption.lenth === 0 ? "" : statusOption[0]}
                  onChange={(value) => handleChange(value, "status")}
                >
                  {statusOption}
                </Select>
              </div>

              <Button
                showSearchshowSearch
                style={{ width: "100px", marginLeft: "30px", background: '#384AD7', borderColor: '#384AD7'}}
                type="primary"
                onClick={handleFilter}
              >
                Filter
              </Button>
            </div>

            {/* <div style={{ float: 'right' }}>
                            <Button style={{ marginLeft: '12px' }}>Add</Button>

                            <Button style={{ marginLeft: '12px' }}>
                                Approve
                            </Button>
                        </div> */}
          </div>
          <Table
            className="table-striped-rows"
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
            }}
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 5 }}
          ></Table>
        </Card>
      </SiteLayout>
    </React.Fragment>
  );
};

export default SentencePage;
