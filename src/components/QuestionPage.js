import React from "react";
import { Typography, Input, Row, Col, Button, Select } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import { Puff } from "react-loader-spinner";
import { useState } from "react";
const Main = ({
  mcqCategory,
  questionCategory,
  noOfMcq,
  showCat,
  showCatRef,
  categories,
  HandleChange,
  HandleRemove,
  setMcqCategory,
  setQuestionCategory,
  setNoOfMcq,
  num,
  puff,
  userData,
  userData1,
}) => {
  const onCategoryChange = (value) => {
    // console.log(`selected ${value}`);
    setMcqCategory(value);
  };
  const onQuestionCategoryChange = (value) => {
    // console.log(`selected ${value}`);
    setQuestionCategory(value);
  };

  return (
    <>
      <div className="mainDiv">
        <Row gutter={8} className="mb-2">
          <Col flex="1" className="filtersDiv">
            <center className="mb-4">
              <h3 className="AddFilters mt-5" style={{ color: "white" }}>
                Apply Filters To Download MCQs From Question Bank
              </h3>
            </center>
            <Row gutter={8} className="mb-2">
              <Col className="col-lg-3 col-md-3 col-12">
                <label className="mb-2" style={{ color: "white" }}>Question Topic</label>
                <br />
                <Select
                  style={{ width: "100%" }}
                  showSearch
                  value={mcqCategory}
                  name={mcqCategory}
                  placeholder="Select a person"
                  optionFilterProp="children"
                  onChange={onCategoryChange}
                  // onSearch={onSearch}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={userData}
                />
              </Col>
              <Col className="col-lg-4 col-md-4 col-12 mt-lg-0 mt-md-0 mt-2">
                <label className="mb-2" style={{ color: "white" }}>Question Category</label>
                <Select
                  style={{ width: "100%" }}
                  showSearch
                  value={questionCategory}
                  name={questionCategory}
                  placeholder="Select a person"
                  optionFilterProp="children"
                  onChange={onQuestionCategoryChange}
                  // onSearch={onSearch}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={userData1}
                />
              </Col>

              <Col className="col-lg-5 col-md-5 col-12 mt-lg-0 mt-md-0 mt-2">
                <label className="mb-2" style={{ color: "white" }}>Select No of MCQs and Click Add</label>
                <div className="d-flex">
                  <Input
                    style={{ height: "32px", width: "100%", border: "1px solid #D9D9D9" }}
                    placeholder={
                      mcqCategory &&
                      `1-${num()?.map((elem) => {
                        if (elem.questionCategory__name === questionCategory) {
                          return elem?.num_mcqs;
                        }
                      })}`
                    }
                    type="number"
                    className="categoryOptions"
                    name={noOfMcq}
                    value={noOfMcq}
                    ref={showCatRef}
                    onChange={(e) => {
                      if (e.target.value <= num()) setNoOfMcq(e.target.value);
                    }}
                  />
                  <Button
                    className="ms-1"
                    style={{
                      height: "33px",
                      width: "auto",
                      borderRadius: "0.5rem",
                    }}
                    onClick={HandleChange}
                    disabled={!noOfMcq || !mcqCategory}
                  >
                    {puff ? (
                      <Puff
                        height="25"
                        width="25"
                        radisu={1}
                        color="black"
                        ariaLabel="puff-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                        visible={true}
                      />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              </Col>
              {/* <Col flex='0.1' style={{ marginTop: "22px" }}>
                                
                            </Col> */}
            </Row>
            {showCat.length !== 0 && (
              <>
                <h3 className="mt-5" style={{color:"white"}}>Filters</h3>
                <label className="mb-2" style={{color:"white"}}>Question Topic:</label>
              </>
            )}
            <div style={{ display: "flex" }}>
              {showCat.map((el, index) => (
                < div key={index} className="me-1">
                  <span className="ant-tag d-flex align-items-center">
                    {el.question_category} &nbsp;({el.numberOfMCQs})
                    <CloseCircleFilled
                      className="anticon anticon-close ant-tag-close-icon ms-1"
                      onClick={() => HandleRemove(index)}
                    />
                  </span>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </div >
    </>
  );
};
export default Main;
