import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { Row, Col, Select, Button } from "antd";
const SelectCategory = ({ addCategory, categoriesFields }) => {
    const [questionCategories, setQuestionCategories] = useState([]);
    const [category, setCategory] = useState('');
    const [question, setQuestion] = useState('');
    const [userData, setUserData] = useState([]);
    useEffect(() => {
        axios.get('question_category_mcq_list/'
        ).then(res => {
            const Data = res?.data?.map((item) => ({
                label: item.mcq_category,
                value: item.mcq_category
            }));
            setUserData(Data)
            setQuestionCategories(res?.data)
        }).catch(err => {
        })
    }, [])
    const onChange = (value) => {
        setCategory(value)
    };

    const HandleAdd = () => {
        addCategory(category, setCategory)
        setCategory('')
    }
    return (
        <>
            <div className='mainDiv ml-5' style={{ marginLeft: "1rem" }}>

                <Row gutter={8} className="mb-2">
                    <Col flex="1" className="filtersDiv">
                        <Row gutter={8} className="mb-2" >
                            <Col flex="0.5">


                                <Select
                                    style={{ height: "35px", width: "100%" }}
                                    showSearch
                                    value={category}
                                    name={category}
                                    placeholder="Select a person"
                                    optionFilterProp="children"
                                    onChange={onChange}
                                    // onSearch={onSearch}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={userData}
                                />
                                {/* <select
                    style={{ height: "35px" }}
                    className="categoryOptions"
                    name={category}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value=''>choose...</option>
                    {questionCategories?.map(
                      (obj, index) => {
                        return (
                          <>{!categoriesFields.includes(obj.mcq_category) && <option key={index} value={obj.mcq_category
                          }>{obj.mcq_category
                            }
                          </option>}</>
                        )
                      }
                    )}
                  </select> */}
                            </Col>
                            {/* <Col flex="2">
                              <label>Question</label>
                              <select
                                  style={{ height: "35px" }}
                                  className="categoryOptions"
                                  name={question}
                                  value={question}
                                  onChange={(e)=>setQuestion(e.target.value)}
                              >
                                  <option value=''>choose...</option>
                                  {questionCategories?.map(
                                      (obj, index) => (
                                          <option key={index} value={obj.question
                                          }>{obj.question
                                          }
                                          </option>
                                      )
                                  )}
                              </select>
                          </Col> */}
                            <Col>
                                <Button
                                    type="dashed"
                                    onClick={() => HandleAdd()}
                                    style={{ height: "35px", width: '100%', borderRadius: "0.5rem" }}
                                    disabled={!category}
                                // icon={<PlusOutlined />}
                                >
                                    Add
                                </Button>
                            </Col>
                        </Row>

                    </Col>
                </Row>
            </div>
        </>
    )
}
export default SelectCategory