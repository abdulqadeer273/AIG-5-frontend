import "../App.css";
import React, { useEffect, useState } from "react";
import Header from "./Header";
import { Typography, Button, Input, Row, Col } from "antd";
import { Dna } from "react-loader-spinner";
import Form from "react-bootstrap/Form";
import { Link } from "react-router-dom";
import { SafetyOutlined } from "@ant-design/icons";
import axios from "../api/axios";
import SelectTopic from "./SelectTopic";
import MCQ from "./Mcq";
const { Title } = Typography;
const HEADING = {
  topic: "Topic",
  story: "Clinical vignette/scenario",
  variables: "List of variables in selected theme",
  questionCategories: "Question Categories",
  question: "Questions",
  Categories: "Question Categories",
  storyCategories: "Question Topic",
  Correct: "Correct Options",
  Correct1: "Correct Options",
  options: "Other Options",
  optionSection: "Distractor Options",
  previewButton: "Generate Items",
  generateButton: "Download TeX File",
  addQuestionCategory: "Add Question Category",
  addQuestion: "Add Question",
};
function AIGFive() {
  const [topic, setTopic] = useState("");
  const [topicData, setTopicData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [noOfMcqs, setNoOfMcqs] = useState(0);
  const [mcqItems, setMcqItems] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [possibleCombinations, setPossibleCombinations] = useState(0);
  const [showTopic, setShowTopic] = useState(false);
  const [showMcqLoader, setShowMcqLoader] = useState(false);
  const [casesList, setCasesList] = useState([])
  const [casesWiseCategories, setCasesWiseCategories] = useState([])
  useEffect(() => {
    axios
      .get("fetch_topic/")
      .then((res) => {
        const Data = res?.data?.topics?.map((item) => ({
          label: item.name,
          value: item.name,
        }));
        setTopicData(Data);
        setShowTopic(true)
      })
      .catch((err) => {
        setShowTopic(true);
      });
  }, []);
  useEffect(() => {
    axios
      .get("fetch_categories/")
      .then((res) => {
        const Data = res?.data?.map((item) => ({
          label: item.name,
          selected: false,
        }));
        setCategoryData(Data);
      })
      .catch((err) => { });
  }, []);
  useEffect(() => {
    setPossibleCombinations(0);
    setNoOfMcqs(0);
    let categories = [];
    for (let i = 0; i < categoryData.length; i++) {
      if (categoryData[i]?.selected === true) {
        categories.push(categoryData[i]?.label);
      }
    }
    if (categories.length > 0) {
      setShowMcqLoader(true);
      axios
        .post("checksentence/", {
          topic,
          categories,
        })
        .then((res) => {
          setShowMcqLoader(false);
          setPossibleCombinations(res.data.all_combinations);
          setCasesList(res.data.cases_list)
          setCasesWiseCategories(res.data.cases_category_list)

          if (
            res?.data?.all_combinations === 0
          ) {
            alert(
              "Sorry! We didn't find any case that has the codes fits with any story"
            );
            setNoOfMcqs(0);
          }
        })
        .catch((err) => {
          setShowMcqLoader(false);
        });
    }
  }, [categoryData, topic]);
  function onSubmitStories(e) {
    e.preventDefault();
    generate()
  }
  function generate() {
    setMcqItems([])
    let categories = [];
    for (let i = 0; i < categoryData.length; i++) {
      if (categoryData[i]?.selected === true) {
        categories.push(categoryData[i]?.label);
      }
    }
    if (noOfMcqs && categories.length > 0) {
      setShowLoader(true);
      axios
        .post("FetchMcqFromCases/", {
          topic,
          noOfMcqs,
          categories,
          casesList,
          casesWiseCategories
        })
        .then((res) => {
          console.log(res?.data);
          let data = res?.data;
          if (res?.data[0]?.all_questions) {
            let stories = [];
            for (let k = 0; k < casesList.length; k++) {
              stories.push(getAllStories(data[k]?.s, data[k]?.all_sets, data[k]?.variable_used));
            }
            let items = [];
            for (let k = 0; k < casesList.length; k++) {
              for (let i = 0; i < stories[k].length; i++) {
                let mcqBody = {
                  story: stories[k][i],
                  question: data[k]?.all_questions[i].question,
                  category: data[k]?.all_questions[i].category,
                  corectOption: data[k]?.all_questions[i].correct_option,
                  caseName:data[k]?.all_questions[i].case_name,
                  alternativeOptions:
                    data[k]?.all_questions[i].alternative_options,
                };
                items.push(mcqBody);
              }
            }
            setShowLoader(false);
            setMcqItems(items);
          } else {
            alert(
              `Sorry! We didn't find any case that fits to codes used in your story.`
            );
            setShowLoader(false);
          }
        })
        .catch((err) => {
          setShowLoader(false);
        });
    } else {
      alert("choose a category first");
    }
  }
  const updateFieldChanged = (index) => {
    let newArr = [...categoryData];
    newArr[index].selected = !newArr[index].selected;
    setCategoryData(newArr);
  };
  function getAllStories(storyParameter, setData, variables) {
    const allStories = [];
    for (let i = 0; i < setData.length; i++) {
      let s = storyParameter;
      let ageIndex;
      let genderIndex;
      if (s?.includes("(1)") && s?.includes("(2)")) {
        ageIndex = variables?.indexOf("1");
        genderIndex = variables?.indexOf("2");
      }
      for (let j = 0; j < setData[i].length; j++) {
        if (
          typeof ageIndex !== "undefined" &&
          typeof genderIndex !== "undefined"
        ) {
          if (setData[i][ageIndex] > 19 && j === genderIndex) {
            s = s.replace(
              "(" + variables[j] + ")",
              setData[i][j] === "male"
                ? "man"
                : setData[i][j] === "female"
                  ? "woman"
                  : setData[i][j]
            );
          } else {
            s = s.replace(
              "(" + variables[j] + ")",
              setData[i][j] === "male"
                ? "boy"
                : setData[i][j] === "female"
                  ? "girl"
                  : setData[i][j]
            );
          }
        } else {
          s = s.replace("(" + variables[j] + ")", setData[i][j]);
        }
      }
      allStories.push(s);
    }
    return allStories;
  }
  return (
    <>
      <main className="App">
        <Header name="Automatic Item Generator v.5 (AIG-5)" className="mb-5" />
        <div className="float-end"><Link to="/themes">
          <label
            htmlFor="files"
            className="btn me-2 themes"
            style={{
              backgroundColor: "lightgray",
              color: "black",
              padding: "6px 50px",
              margin: "24px 0",
              cursor: "pointer",
              borderRadius: "0.5rem",
            }}
          >
            Themes
          </label></Link>
          <Link to="/AIG">
            <label
              htmlFor="files"
              className="btn Go-to"
              style={{
                backgroundColor: "lightgray",
                color: "black",
                padding: "6px 50px",
                margin: "24px 0",
                cursor: "pointer",
                borderRadius: "0.5rem",
              }}
            >
              Go To Question Bank
            </label></Link></div>
        {!showTopic ? (
          <div className="text-center" style={{ marginLeft: "15rem" }}><Dna
            visible={true}
            height="60"
            width="80"
            ariaLabel="dna-loading"
            wrapperStyle={{}}
            wrapperClass="dna-wrapper"
            style={{ color: "white" }}
          /></div>
        ) : (
          <div className="main-bd" style={{ marginTop: "3rem" }}>
            <SelectTopic
              topic={topic}
              setTopic={setTopic}
              topicData={topicData}
            />
            {/* </div> */}
            {topic !== "" && (
              <div className="my-5">
                <Title level={3} className="mb-3">
                  {HEADING.questionCategories}:
                </Title>
                <div className="" style={{ display: "flex", flexWrap: "wrap" }}>
                  {categoryData?.map((elem, index) => {
                    return (
                      <div
                        key={index}
                        className="mb-2 col-xl-3 col-lg-4 col-md-4 col-12"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        <div style={{ display: "inline-block" }}>
                          <Form.Check
                            aria-label={`category ${index}`}
                            checked={elem?.selected}
                            onChange={() => updateFieldChanged(index)}
                          />
                        </div>
                        <div style={{ display: "inline-block" }}>
                          &nbsp;{elem?.label}&nbsp;&nbsp;
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {showMcqLoader && topic ? (
          <center>
            <Dna
              visible={true}
              height="60"
              width="80"
              ariaLabel="dna-loading"
              wrapperStyle={{}}
              wrapperClass="dna-wrapper"
              style={{ color: "white" }}
            />
          </center>
        ) : (
          <>
            {categoryData?.filter((elem) => elem.selected === true).length >
              0 && possibleCombinations !== 0 && (
                <>
                  <div>
                    <Row
                      style={{
                        verticalAalign: "middle",
                        marginBottom: "35px",
                      }}
                    >
                      <Col>
                        <h4 style={{ marginTop: "5px" }}>
                          Enter No of MCQs To Generate: &nbsp;{" "}
                        </h4>
                      </Col>
                      <form onSubmit={(e) => onSubmitStories(e)}>
                        <Col className="d-flex">
                          <Input
                            style={{
                              height: "40px",
                              width: "100px",
                              borderRadius: "0.5rem",
                            }}
                            placeholder={1 + " - " + possibleCombinations}
                            type="number"
                            min={1}
                            max={possibleCombinations}
                            name={noOfMcqs}
                            value={noOfMcqs !== 0 && noOfMcqs}
                            onChange={(e) =>
                              setNoOfMcqs(e.target.value)
                            }
                          />
                          &nbsp;
                          <Button
                            size="large" //TODO
                            icon={<SafetyOutlined />}
                            disabled={showLoader}
                            onClick={(e) => onSubmitStories(e)}
                            className="d-flex align-items-center "
                          >
                            <>{HEADING.previewButton} (Questions)</>
                          </Button>
                          {showLoader && (
                            <Dna
                              visible={true}
                              height="50"
                              width="80"
                              ariaLabel="dna-loading"
                              wrapperStyle={{}}
                              wrapperClass="dna-wrapper"
                              style={{ color: "white" }}
                            />
                          )}

                        </Col>
                      </form>
                    </Row>
                  </div>
                  {mcqItems.length > 0 && <MCQ MCQsItems={mcqItems} topic={topic} />}
                </>
              )}
          </>
        )}
      </main>
    </>
  );
}

export default AIGFive;
