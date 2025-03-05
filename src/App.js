import "./App.css";
import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import StoryInput from "./components/StoryInput";
import { Typography, Button, Input, Row, Col, Spin } from "antd";
import { Dna } from "react-loader-spinner";
import { Alert, Space } from "antd";
import Form from "react-bootstrap/Form";
import { Link, useNavigate } from "react-router-dom";
import { SafetyOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "./api/axios";
import SelectTopic from "./components/SelectTopic";
import MCQ from "./components/Mcq";
import ScrollButton from "./components/ScrollButton";
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
function App(props) {
  const navigate = useNavigate();
  const [story, setStory] = useState([""]);
  const [fields, setFields] = useState([]);
  const [storyInputRef, setStoryInputRef] = useState([]);
  const [topic, setTopic] = useState("");
  const [topicData, setTopicData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [variables, setVariables] = useState([]);
  const [variableAlert, setVariableAlert] = useState("");
  const [noOfMcqs, setNoOfMcqs] = useState(0);
  const [mcqItems, setMcqItems] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [possibleCombinations, setPossibleCombinations] = useState(0);
  const [codes, setCodes] = useState([]);
  const [showTopic, setShowTopic] = useState(false);
  const [casesList, setCasesList] = useState([]);
  const [showMcqLoader, setShowMcqLoader] = useState(false);
  const [splitStory, setSplitStory] = useState(true);
  const [variableCount, setVariableCount] = useState()
  useEffect(() => {
    onStoryInputSubmit();
    axios
      .get("fetch_topic/")
      .then((res) => {
        const Data = res?.data?.topics?.map((item) => ({
          label: item.name,
          value: item.name,
        }));
        setTopicData(Data);
        setShowTopic(true)
        setVariableCount(res?.data?.variables_count)
      })
      .catch((err) => {
        setShowTopic(true);
      });
  }, []);
  useEffect(() => {
    onStoryInputSubmit();
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
    axios.get("fetch_variable_by_topic/").then((res) => {
      // console.log(res.data, "data");
      setVariables(res.data?.variables);
      setCodes(res?.data?.variables?.map((elem) => elem.code));
    });
  }, [topic]);
  useEffect(() => {
    setMcqItems([])
    setPossibleCombinations(0)
  }, [story])
  useEffect(() => {
    setPossibleCombinations(0);
    setNoOfMcqs(0);
    setShowMcqLoader(true);
    let variableUsed = [];
    for (let i = 0; i < Object.keys(fields).length; i++) {
      variableUsed.push(Object.keys(fields)[i]);
    }
    let storyVar = [];
    for (let s = 0; s < story.length; s++) {
      let variableArray = [];
      for (let j = 0; j < variableUsed.length; j++) {
        if (story[s].includes(`(${variableUsed[j]})`)) {
          variableArray.push(variableUsed[j]);
        }
      }
      storyVar.push(variableArray);
    }
    let categories = [];
    for (let i = 0; i < categoryData.length; i++) {
      if (categoryData[i]?.selected === true) {
        categories.push(categoryData[i]?.label);
      }
    }
    axios
      .post("possible_combinations/", {
        topic,
        variableUsed,
        categories,
        storyVar,
      })
      .then((res) => {
        setShowMcqLoader(false);
        if (splitStory &&
          res?.data?.data[0]?.cases_list?.length > 0 &&
          splitStory === true &&
          variableUsed.length !== 0
        ) {
          MakeNewStory();
        } else {
          const min = res?.data?.data?.reduce(
            (acc, obj) =>
              obj.all_combinations < acc ? obj.all_combinations : acc,
            Infinity
          );
          setPossibleCombinations(min);
          setCasesList(res?.data?.data);
          if (
            res?.data?.data[0]?.all_combinations === 0 &&
            variableUsed.length !== 0
          ) {
            alert(
              "Sorry! We didn't find any case that fits to codes used in your story."
            );
            setNoOfMcqs(0);
          }
        }
      })
      .catch((err) => {
        setShowMcqLoader(false);
      });
  }, [fields]);
  function MakeNewStory() {
    let array = [...story]
    let baseStr1 = array[0]
    // const regex = new RegExp(`\\.([^\\.]*\\(${`(${max_key})`}\\)[^\\.]*)\\.`, "g");
    // let hasText = regex.test(newStory);
    // if (hasText) {
    //   array.push(newStory.replace(regex, "."));
    //   console.log(array);
    //   // setStory(array)
    //   // setSplitStory(false)
    // }
    let arr = []
    for (let i = 11; i < 14; i++) {
      let regex = new RegExp(`\\.([^\\.]*\\(${`(${i})`}\\)[^\\.]*)\\.`, "g");
      if (baseStr1.match(regex)) {
        let matchedText = baseStr1.match(regex)[0].replace(/\. (\w+)/, "$1");
        console.log(matchedText, 'matchedText')
        if (/^\.\s/.test(matchedText)) {
          matchedText = matchedText.replace(/^\.\s/, "");
        }
        arr.push(matchedText)
      }
    }
    console.log(arr, 'arr')
    const combinations = [];
    for (let i = 11; i < 25; i++) {
      const regex = new RegExp(`\\.([^\\.]*\\(${`(${i})`}\\)[^\\.]*)\\.`, "g");
      let hasText = regex.test(baseStr1);
      if (hasText) {
        baseStr1 = baseStr1.replace(regex, ".")
      }
    }
    console.log(baseStr1, 'baseStr1')
    for (let i = 0; i < (2 ** arr.length); i++) {
      let str = baseStr1;
      for (let j = 0; j < arr.length; j++) {
        if (i & (1 << j)) {
          str += ` ${arr[j]}`;
        }
      }
      combinations.push(str);
    }
    setStory(combinations)
    setSplitStory(false)
    onStoryInputSubmit()
  }
  function onSubmitStories(e) {
    e.preventDefault();
    generate()
  }
  function generate() {
    setMcqItems([])
    let variableUsed = [];
    for (let i = 0; i < Object.keys(fields).length; i++) {
      variableUsed.push(Object.keys(fields)[i]);
    }
    let storyVar = [];
    for (let s = 0; s < story.length; s++) {
      let variableArray = [];
      for (let j = 0; j < variableUsed.length; j++) {
        if (story[s].includes(`(${variableUsed[j]})`)) {
          // console.log(variableUsed[j])
          variableArray.push(variableUsed[j])
        }
      }
      storyVar.push(variableArray);
    }
    let categories = [];
    for (let i = 0; i < categoryData.length; i++) {
      if (categoryData[i]?.selected === true) {
        categories.push(categoryData[i]?.label);
      }
    }
    if (noOfMcqs && categories.length > 0) {
      setShowLoader(true);
      axios
        .post("fetch_question_by_cases/", {
          topic,
          variableUsed,
          noOfMcqs,
          categories,
          casesList,
          storyVar,
        })
        .then((res) => {
          console.log(res?.data);
          let data = res?.data;
          if (res?.data[0]?.all_questions) {
            let stories = [];
            for (let i = 0; i < Object.keys(story).length; i++) {
              let storyParameter = story[Object.keys(story)[i]];
              stories.push(getAllStories(storyParameter, data[i]?.all_sets, data[i]?.variable_used));
            }
            let items = [];
            for (let k = 0; k < Object.keys(story).length; k++) {
              for (let i = 0; i < stories[k].length; i++) {
                let mcqBody = {
                  story: stories[k][i],
                  question: data[k]?.all_questions[i].question,
                  category: data[k]?.all_questions[i].category,
                  corectOption: data[k]?.all_questions[i].correct_option,
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
  function removeElAtIndex(arr, index) {
    return arr.slice(0, index).concat(arr.slice(index + 1));
  }
  function onStoryInputSubmit() {
    setMcqItems([])
    setFields([]);
    setVariableAlert("");
    const newFields = {};
    let string = "";
    story.map((itemstory, i) => {
      let item = (itemstory || "[]").trim().match(/\([a-z0-9_-]+\)/gi) || [];
      // console.log(item, "item");
      let nonExistingVariables = [];
      for (let i = 0; i < item.length; i++) {
        if (!codes.includes(parseInt(item[i].slice(1, item[i].length - 1)))) {
          nonExistingVariables.push(item[i].slice(1, item[i].length - 1));
        }
      }
      if (nonExistingVariables.length > 0) {
        string = nonExistingVariables.map((i) => i).join(", ");
      }
      item &&
        item
          .map((el) => el.slice(1, el.length - 1))
          .forEach((el) => {
            newFields[el] = fields[el] || [];
          });
      return null;
    });
    if (string !== "") {
      setVariableAlert(string);
    } else {
      setFields(newFields);
    }
  }
  function onStoryInputChange(index, newVal) {
    const newStory = story.slice();
    newStory[index] = newVal;
    setStory(newStory);
  }
  function onStoryRemove(index) {
    setStory(removeElAtIndex(story, index));
    setStoryInputRef(removeElAtIndex(storyInputRef, index));
  }
  function onStoryInputSaveRef(index, ref) {
    let arr = storyInputRef;
    arr[index] = ref;
    setStoryInputRef(arr);
  }
  function onStoryInputAdd() {
    setStory(story.concat(""));
    storyInputRef[story.length - 1].focus();
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
  function handleClick(event, link) {
    if (event.ctrlKey) {
      event.preventDefault(); // Prevents the default behavior of opening the link in the same tab
      window.open(link, "_blank"); // Opens the link in a new tab
    } else {
      navigate(link);
    }
  }
  return (
    <>
      <main className="App">
        <Header name="Automatic Item Generator v.4 (AIG-4)" className="mb-5" />
        {/* <label htmlFor="files" className="btn" style={{ backgroundColor: "#333", color: "#fff", padding: "12px 32px", margin: "4px 2px", cursor: "pointer", borderRadius: "2rem" }}>Import MCQ Template</label> */}
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
            {variables?.length > 0 &&
              categoryData?.filter((elem) => elem.selected === true).length >
              0 && (
                <div className="my-5">
                  <Title level={3} className="mb-3">
                    {HEADING.variables}:
                  </Title>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {variables?.length > 0 &&
                      variables?.map((elem, index) => {
                        return (
                          <>
                            <div
                              className="mb-2 col-xl-3 col-lg-4 col-md-4 col-12"
                              key={index}
                              style={{
                                // flexBasis: "25%",
                                whiteSpace: "nowrap",
                                // padding: "5px 0",
                              }}
                            >
                              {elem?.name} ({elem?.code})&nbsp;
                            </div>
                          </>
                        );
                      })}
                  </div>
                </div>
              )}
            {categoryData?.filter((elem) => elem.selected === true).length >
              0 && (
                <div className="my-5">
                  <Title level={3} className="mb-3">
                    {HEADING.story}:
                  </Title>
                  {variableAlert && (
                    <Space style={{ marginBottom: "0.5rem" }}>
                      <Alert
                        style={{}}
                        message={`variable(s) do(es) not exist against following code(s) ${variableAlert}`}
                        type="error"
                        showIcon
                        closable
                      />
                    </Space>
                  )}
                  {story.map((el, index) => (
                    <div key={index}>
                      <StoryInput
                        value={el}
                        index={index}
                        onSaveRef={onStoryInputSaveRef}
                        onRemove={onStoryRemove}
                        onInputChange={onStoryInputChange}
                      />
                    </div>
                  ))}
                  <div className="d-flex">
                    <Button
                      className="d-flex align-items-center justify-content-center me-1"
                      type="dashed"
                      onClick={onStoryInputAdd}
                      style={{ width: "30%" }}
                      icon={<PlusOutlined />}
                    >
                      Add Story
                    </Button>
                    <Button
                      className="d-flex align-items-center justify-content-center process"
                      type="dashed"
                      onClick={onStoryInputSubmit}
                      style={{ width: "20%" }}
                    >
                      Process Vignette
                    </Button>
                  </div>
                </div>
              )}
          </div>
        )}
        {/* {<SelectCategory />} */}
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
              0 && (
                <>
                  {Object.keys(fields).length > 0 &&
                    possibleCombinations !== 0 && (
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
                                placeholder={story.length + " - " + possibleCombinations}
                                type="number"
                                min={story.length}
                                max={possibleCombinations}
                                name={noOfMcqs}
                                value={noOfMcqs !== 0 && noOfMcqs}
                                onChange={(e) => {
                                  if (e.target.value <= possibleCombinations) {
                                    setNoOfMcqs(e.target.value);
                                  }
                                }}
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
                    )}
                  {mcqItems.length > 0 && <MCQ MCQsItems={mcqItems} topic={topic} />}
                </>
              )}
          </>
        )}
      </main>
    </>
  );
}

export default App;
