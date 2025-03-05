import { SafetyOutlined, DownloadOutlined, PlusOutlined, } from "@ant-design/icons";
import { Input, Button } from "antd";
import axios from "../api/axios";
import React, { useEffect } from "react";
import { useState, createRef } from "react";
import { Breadcrumb, Col, Row, Form } from "react-bootstrap";
import { Dna } from "react-loader-spinner";
import Header from "./Header";
import CategorySection from "../utils/CategorySection";
import QuestionInput from "../utils/QuestionInput";
import { Link, useNavigate, useParams } from "react-router-dom";
import OtherVariables from "./VariableComponent";
import CorrectCategoryOption from "./CorrectCategoryOption";
import DistractCategoryOption from "./DistractCategoryOption";
import { saveAs } from "file-saver";
import Accordion from "react-bootstrap/Accordion";
import LoadingBar from 'react-top-loading-bar'
import MultiSelect from "./MultiSelect";
import { Typography } from "@mui/material";
export const AddCase = (props) => {
  const HEADING = {
    addVariables: "Add Variables",
    age: "Age Range",
    sex: "Gender",
    topic: "Topic",
    story: "Clinical Vignette/Scenario",
    variables: "Variables",
    questionCategories: "Question Categories",
    question: "Questions",
    Categories: "Add Categories",
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
  const [genderSelect, setGenderSelect] = useState(["both", "male", "female"]);
  const [questionCategories, setQuestionCategories] = useState([]);
  const [setInputRangeValue] = useState(0);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const [caseName, setCaseName] = useState("");
  const [otherVariables, setOtherVariables] = useState([]);
  const [variables, setVariables] = useState([]);
  const [variableName, setVariableName] = useState("");
  const [existingValueError, setExistingValueError] = useState(false);
  const [inputVisible, setInputVisible] = useState({});
  const [chipInputRef, setChipInputRef] = useState({});
  const [inputValue, setInputValue] = useState({});
  const [categoriesFields, setCategoriesFields] = useState([]);
  const [question, setQuestion] = useState([]);
  const [questionCategoryValue, setQuestionCategoryValue] = useState([]);
  const [questionTagsValue, setQuestionTagsValue] = useState([]);
  const [questionInputRef] = useState({});
  const [tagfields] = useState({});
  const [answers, setAnswers] = useState({});
  const [correctMultipleOptions, setCorrectMultipleOptions] = useState({});
  const [correctMultipleOptionsInputRef, setCorrectMultipleOptionsInputRef] =
    useState({});
  const [answerInputRef, setAnswerInputRef] = useState({});
  const [boy, setBoy] = useState(true);
  const [girl, setGirl] = useState(true);
  const [both, setBoth] = useState(true);
  const [imported, setImported] = useState(false);
  const [codesData, setCodesData] = useState();
  let { theme } = useParams();
  const navigate = useNavigate();
  const [multiSelectValues, setMultiSelectValues] = useState([]);
  const [progress, setProgress] = useState(30)
  const [showPage, setShowPage] = useState(false)
  const themeName = theme.replace(/%20/g, " ");
  const genderSelectFunction = (gen, str) => {
    var array = [...genderSelect]; // make a separate copy of the array
    var index = array.indexOf(str);
    if (index !== -1) {
      array.splice(index, 1);
      setGenderSelect(array);
    }
    // if (gen) {
    //     setGenderSelect(pre => pre !== 'boy')
    // }
    else {
      array.push(str);
      setGenderSelect(array);
    }
  };
  const onAfterChange = (value) => {
    setMin(value[0]);
    setMax(value[1]);
  };
  useEffect(() => {
    axios
      .get("question_category_mcq_list/")
      .then((res) => {
        const Data = res?.data?.map((item) => ({
          label: item.mcq_category,
          value: item.mcq_category,
        }));
        setQuestionCategories(res?.data);
        setProgress(100);
        setShowPage(true)
      })
      .catch((err) => { });
  }, [axios]);
  useEffect(() => {
    axios.get("fetch-variables/").then((res) => {
      // setVariables(res?.data?.variables)
      const Data = res?.data?.variables?.map((item) => ({
        label: `${item.name} (${item.code})`,
        value: `${item.name} (${item.code})`,
      }));
      setCodesData(Data);
    });
  }, []);
  useEffect(
    () => {
      if (genderSelect?.length === 1) {
        let g = genderSelect[0]
        const newData = { ...correctMultipleOptions };
        for (const [key, value] of Object.entries(newData)) {
          newData[key] = value.map((item) => {
            return { ...item, gender: g };
          });
        }
        const newData1 = { ...answers };
        for (const [key, value] of Object.entries(newData1)) {
          newData1[key] = value.map((item) => {
            return { ...item, gender: g };
          });
        }
        setCorrectMultipleOptions(newData);
        setAnswers(newData1);
      }
    }, [genderSelect]
  )
  function handleClick(event, link) {
    if (event.ctrlKey) {
      event.preventDefault(); // Prevents the default behavior of opening the link in the same tab
      window.open(link, "_blank"); // Opens the link in a new tab
    } else {
      if (link.includes("cases/")) {
        console.log(link.replace("cases/", ""), 'replaced one')
        navigate(link.replace("cases/", ""))
      } else {
        navigate(link)
      }
    }
  }
  function HandleSaveCase() {
    let gender = [];
    if (boy) {
      gender.push("male");
    }
    if (girl) {
      gender.push("female");
    }
    if (both) {
      gender.push("both");
    }
    let invalidCase;
    if (gender?.length > 0) {
      if (gender?.length === 1 && gender[0] !== "both") {
        // console.log(answers, 'answers')
        invalidCase = oneGenderCase(gender[0])
      } else {
        invalidCase = validCase()
      }
      if (!invalidCase?.status) {
        alert(`Please make sure you have added options correctly against ${invalidCase?.categoryName}`)
        return;
      }
    }
    let listOfVariables = {};
    for (let i = 0; i < Object.keys(otherVariables)?.length; i++) {
      let item =
        (Object.keys(otherVariables)[i] || "")
          .trim()
          .match(/\([a-z0-9_-]+\)/gi)?.[0] || "";
      listOfVariables[item.slice(1, item.length - 1)] =
        Object.values(otherVariables)[i];
    }
    let body = {
      topic: theme,
      caseName: caseName,
      ageRange: [min, max],
      gender: gender,
      variables: listOfVariables,
      categoriesFields: categoriesFields,
      questions: question,
      questionCategoryValue: questionCategoryValue,
      option: answers,
      correctMultipleOptions: correctMultipleOptions,
    };
    axios
      .post("save_case/", body)
      .then((res) => {
        // console.log(res.data.status, 400);
        if (res.data.status === 200) {
          navigate(`/${themeName}/cases`);
        }
        if (res.data.status === 400) {
          alert("case with this name already exists");
        }
      })
      .catch((err) => { });
  }
  const handleAddVariable = () => {
    setExistingValueError(false);
    if (Object.keys(otherVariables).find((elem) => elem === variableName)) {
      setExistingValueError(true);
    } else {
      setOtherVariables((prevValues) => {
        return { ...prevValues, [variableName]: [] };
      });
      setVariableName("");
      setChipInputRef((prevRefs) => {
        return { ...prevRefs, [variableName]: [createRef()] };
      });
    }
  };
  const handleAddVariableForMultiSelect = () => {
    for (let i = 0; i < multiSelectValues.length; i++) {
      if (
        multiSelectValues[i] !== "" &&
        !Object.keys(otherVariables)?.includes(multiSelectValues[i])
      ) {
        setOtherVariables((prevValues) => {
          return { ...prevValues, [multiSelectValues[i]]: [] };
        });
        setChipInputRef((prevRefs) => {
          return { ...prevRefs, [multiSelectValues[i]]: [createRef()] };
        });
      }
    }
    for (let j = 0; j < Object.keys(otherVariables)?.length; j++) {
      if (!multiSelectValues.includes(Object.keys(otherVariables)[j])) {
        let key = Object.keys(otherVariables)[j];
        const newState = { ...otherVariables };
        delete newState[key];
        setOtherVariables(newState);
        const tempState = { ...chipInputRef };
        delete tempState[key];
        setChipInputRef(tempState);
      }
    }
  };
  const onChipInputChange = (field, newVal) => {
    const newInputValue = { ...inputValue };
    newInputValue[field] = newVal;
    setInputValue(newInputValue);
  };
  const onChipInputToggleVisb = (field, visible) => {
    const newInputVisible = { ...inputVisible };
    newInputVisible[field] = visible;
    setInputVisible(newInputVisible);
    setTimeout(() => {
      const inputRef = chipInputRef[field][0];
      if (inputRef && inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };
  const onChipInputSubmit = (field) => {
    let newFields = otherVariables[field];
    if (
      inputValue[field] &&
      otherVariables[field].indexOf(inputValue[field]) === -1
    ) {
      newFields = otherVariables[field].concat(
        (inputValue[field] || "").trim()
      );
    }
    const newFullFields = { ...otherVariables };
    newFullFields[field] = newFields;
    setOtherVariables(newFullFields);
    const newInputValue = { ...inputValue };
    newInputValue[field] = "";
    setInputValue(newInputValue);
    setInputVisible((prevState) => ({
      ...prevState,
      ...(inputValue[field] ? {} : { [field]: false }),
    }));
  };
  const onChipRemove = (field, tag) => {
    const newFullFields = { ...otherVariables };
    newFullFields[field] = otherVariables[field].filter((el) => el !== tag);
    setOtherVariables(newFullFields);
  };
  const addCategory = (questionCategories) => {
    let newFields = [...categoriesFields];
    const newAnswers = { ...answers };
    const newCMO = { ...correctMultipleOptions };
    const newCorrectMultipleOptionsInputRef = {
      ...correctMultipleOptionsInputRef,
    };
    const newAnswerInputRef = { ...answerInputRef };

    for (let i = 0; i < questionCategories.length; i++) {
      const category = questionCategories[i];
      const value = category?.mcq_category;

      if (category?.selected && value) {
        if (!newFields.includes(value)) {
          newFields.push(value);
          newAnswers[value] = [{}];
          newCMO[value] = [{}];
          newCorrectMultipleOptionsInputRef[value] = [createRef()];
          newAnswerInputRef[value] = [createRef()];
        } else {
          continue;
        }
      }
      else {
        newFields = newFields.filter(elem => elem !== value)
      }
    }
    setCategoriesFields(newFields);
    setAnswers(newAnswers);
    setCorrectMultipleOptions(newCMO);
    setCorrectMultipleOptionsInputRef(newCorrectMultipleOptionsInputRef);
    setAnswerInputRef(newAnswerInputRef);
  };

  const onAddQuestion = (questionCategories) => {
    let tempQuestions = [];
    let tempCategoryValues = [];
    for (let i = 0; i < questionCategories.length; i++) {
      if (questionCategories[i]?.selected === true) {
        let tempCategory = questionCategories[i]?.mcq_category;
        for (
          let j = 0;
          j < questionCategories[i]?.results_question?.length;
          j++
        ) {
          let tempQuestion =
            questionCategories[i]?.results_question[j]?.question;
          if (!tempQuestions.includes(tempQuestion)) {
            tempQuestions.push(tempQuestion);
            tempCategoryValues.push(tempCategory);
          }
        }
      }
    }
    setQuestion(tempQuestions);
    setQuestionCategoryValue(tempCategoryValues);
  };
  const questionTagsValueChangefun = (index, val) => {
    let tagValue = [...questionTagsValue];
    tagValue = [val];
    setQuestionTagsValue(tagValue);
  };
  const questionCategoryValueChangefun = (index, val) => {
    let questionCategories = [...questionCategoryValue];
    questionCategories[index] = val;
    setQuestionCategoryValue(questionCategories);
    // const { questionCategoryValue: questionCategories } = this.state;
    // questionCategories[index] = val;
    // this.setState({
    //     questionCategoryValue: questionCategories,
    // });
  };
  const onQuestionInputSaveRef = (index, ref) => {
    questionInputRef[index] = ref;
  };
  function removeElAtIndex(arr, index) {
    return arr.slice(0, index).concat(arr.slice(index + 1));
  }
  function getOccurrence(array, value) {
    return array.filter((v) => v === value).length;
  }
  const onQuestionRemove = (index) => {
    let category = questionCategoryValue[index];
    setQuestion(removeElAtIndex(question, index));
    setQuestionCategoryValue(removeElAtIndex(questionCategoryValue, index));
    const occurence = getOccurrence(questionCategoryValue, category);
    if (occurence === 1) {
      const categoryIndex = categoriesFields.indexOf(category);
      setCategoriesFields(removeElAtIndex(categoriesFields, categoryIndex));
      const target = { ...answers };
      delete target[category];
      setAnswers(target);
      const target1 = { ...correctMultipleOptions };
      delete target1[category];
      setCorrectMultipleOptions(target1);
    }
  };
  const onQuestionInputChange = (index, newVal) => {
    const newQuestion = question.slice();
    newQuestion[index] = newVal;
    setQuestion(newQuestion);
  };
  const onCorrectMultipleOptionsInputSaveRef = (index, ref) => {
    correctMultipleOptionsInputRef[index] = ref;
  };
  function removeOptionElAtIndex(arr, category, index) {
    arr[category].splice(index, 1);
    return arr;
  }
  const onCorrectMultipleOptionsRemove = (category, index) => {
    const newArr = { ...correctMultipleOptions };
    newArr?.[category]?.splice(index, 1);
    setCorrectMultipleOptions(newArr);
    setCorrectMultipleOptionsInputRef(
      removeOptionElAtIndex(correctMultipleOptionsInputRef, category, index)
    );
  };
  const onCorrectMultipleOptionsInputChange = (category, index, e) => {
    const newAnswers = { ...correctMultipleOptions };
    const { name, value } = e.target;
    newAnswers[category][index] = {
      ...newAnswers?.[category][index],
      [name]: value,
    };
    setCorrectMultipleOptions(newAnswers);
  };
  const onCorrectMultipleOptionsInputAdd = (index, category) => {
    let newRefs;
    setCorrectMultipleOptionsInputRef((prevRefs) => {
      newRefs = [...prevRefs[category], createRef()];
      return { ...prevRefs, [category]: newRefs };
    });
    const newCorrectMultipleOptions = { ...correctMultipleOptions };
    const newArr = newCorrectMultipleOptions[category];
    newArr.push({});
    newCorrectMultipleOptions[category] = newArr;
    setCorrectMultipleOptions(newCorrectMultipleOptions);
    setTimeout(() => {
      const inputRef = newRefs[newRefs.length - 1];
      if (inputRef && inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };
  const onCorrectMultipleOptionsLoad = (category, index, newVal, key) => {
    const newAnswers = { ...correctMultipleOptions };
    newAnswers[category][index][key] = newVal;
    setCorrectMultipleOptions(newAnswers);
  };
  const onAnswerInputSaveRef = (index, ref) => {
    answerInputRef[index] = ref;
  };
  const onAnswerRemove = (category, index) => {
    const newArr = { ...answers };
    newArr?.[category]?.splice(index, 1);
    setAnswers(newArr);
    setAnswerInputRef(removeOptionElAtIndex(answerInputRef, category, index));
  };
  const onAnswersInputChange = (category, index, e) => {
    const newAnswers = { ...answers };
    const { name, value } = e.target;
    newAnswers[category][index] = {
      ...newAnswers?.[category][index],
      [name]: value,
    };
    setAnswers(newAnswers);
  };
  const onAnswersInputAdd = (index, category) => {
    const newAnswers = { ...answers };
    const newArr = newAnswers[category];
    newArr.push({});
    newAnswers[category] = newArr;
    setAnswers(newAnswers);
    let newRefs;
    setAnswerInputRef((prevRefs) => {
      newRefs = [...prevRefs[category], createRef()];
      return { ...prevRefs, [category]: newRefs };
    });
    setTimeout(() => {
      const inputRef = newRefs[newRefs.length - 1];
      if (inputRef && inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };
  const onAnswersLoad = (category, index, newVal, key) => {
    const newAnswers = { ...answers };
    newAnswers[category][index][key] = newVal;
    setAnswers(newAnswers);
  };
  function downloadFile() {
    let str = {
      imported: true,
      caseName: caseName,
      theme: theme,
      min: min,
      max: max,
      otherVariables: otherVariables,
      categoriesFields: categoriesFields,
      question: question,
      questionCategoryValue: questionCategoryValue,
      correctMultipleOptions: correctMultipleOptions,
      answers: answers,
      genderSelect: genderSelect,
    };
    const blob = new Blob([JSON.stringify(str)], { type: "application/js" });
    saveAs(blob, `${caseName}.conf`);
  }
  function CategoryCheck(questionCategoryValues) {
    let array = questionCategoryValues?.filter(
      (value, index, array) => array.indexOf(value) === index
    );
    // console.log(array, "array");
    for (let i = 0; i < array.length; i++) {
      let arr = [...questionCategories];
      let index = arr.findIndex((elem) => elem?.mcq_category === array[i]);
      if (!questionCategories[index]) {
        return {
          status: true,
          category: array[index],
        };
      }
    }
    return { status: false };
  }
  function oneGenderCase(g) {
    let validCorrectOption;
    let validIncorrectOption;
    for (let i = 0; i < categoriesFields?.length; i++) {
      let totalNumberOfCorrectOptions = correctMultipleOptions[categoriesFields[i]]?.filter(elem => elem.gender === g && elem.title !== "")
      if (totalNumberOfCorrectOptions?.length > 0) {
        validCorrectOption = true;
      } else {
        validCorrectOption = false;
      }
      let totalNumberOfInCorrectOptions = answers[categoriesFields[i]]?.filter(elem => elem.gender === g && elem.title !== "")
      if (totalNumberOfInCorrectOptions?.length > 3) {
        validIncorrectOption = true;
      } else {
        validIncorrectOption = false;
      }
      if (!validCorrectOption || !validIncorrectOption) {
        return { status: false, categoryName: categoriesFields[i] }
      }
    }
    return { status: true }
  }
  function validCase() {
    let validCorrectOption;
    let validIncorrectOption;
    for (let i = 0; i < categoriesFields?.length; i++) {
      let totalNumberOfCorrectOptionsForMale = correctMultipleOptions[categoriesFields[i]]?.filter(elem => elem.gender === "male" && elem.title !== "")
      let totalNumberOfCorrectOptionsForFemale = correctMultipleOptions[categoriesFields[i]]?.filter(elem => elem.gender === "female" && elem.title !== "")
      let totalNumberOfCorrectOptionsForBoth = correctMultipleOptions[categoriesFields[i]]?.filter(elem => elem.gender === "both" && elem.title !== "")
      if (totalNumberOfCorrectOptionsForBoth?.length > 0) {
        validCorrectOption = true;
      } else {
        if (totalNumberOfCorrectOptionsForMale?.length > 0 && totalNumberOfCorrectOptionsForFemale?.length > 0) {
          validCorrectOption = true;
        } else {
          validCorrectOption = false;
        }
      }
      let totalNumberOfInCorrectOptionsForMale = answers[categoriesFields[i]]?.filter(elem => elem.gender === "male" && elem.title !== "")
      let totalNumberOfInCorrectOptionsForFemale = answers[categoriesFields[i]]?.filter(elem => elem.gender === "female" && elem.title !== "")
      let totalNumberOfInCorrectOptionsForBoth = answers[categoriesFields[i]]?.filter(elem => elem.gender === "both" && elem.title !== "")
      if (totalNumberOfInCorrectOptionsForBoth?.length > 3) {
        validIncorrectOption = true;
      } else {
        if (totalNumberOfInCorrectOptionsForMale?.length > 3 && totalNumberOfInCorrectOptionsForFemale?.length > 3) {
          validIncorrectOption = true;
        } else {
          validIncorrectOption = false;
        }
      }
      if (!validCorrectOption || !validIncorrectOption) {
        return { status: false, categoryName: categoriesFields[i] }
      }
    }
    return { status: true }
  }
  const showFile = (e) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      var safi = JSON.parse(e.target.result);
      // console.log(safi, "safi");
      let checkCategory = CategoryCheck(safi?.questionCategoryValue);
      if (checkCategory?.status) {
        alert(`please add Categories and Questions first`);
      } else {
        // variable ref
        let variablesRef = {};
        for (let i = 0; i < Object.keys(safi?.otherVariables).length; i++) {
          variablesRef[Object.keys(safi?.otherVariables)[i]] = [createRef()];
        }
        // console.log(variablesRef, "check2");
        // correctoptionsref
        let correctOptionsInputRef = {};
        for (
          let i = 0;
          i < Object.keys(safi?.correctMultipleOptions).length;
          i++
        ) {
          let refsArray = [];
          for (
            let j = 0;
            j < Object.values(safi?.correctMultipleOptions)[i].length;
            j++
          ) {
            refsArray.push(createRef());
          }
          correctOptionsInputRef[Object.keys(safi?.correctMultipleOptions)[i]] =
            refsArray;
        }
        // console.log(correctOptionsInputRef, "check3");
        let answerInputOptionsRef = {};
        for (let i = 0; i < Object.keys(safi?.answers).length; i++) {
          let refsArray = [];
          for (let j = 0; j < Object.values(safi?.answers)[i].length; j++) {
            refsArray.push(createRef());
          }
          answerInputOptionsRef[Object.keys(safi?.answers)[i]] = refsArray;
        }

        // console.log(answerInputOptionsRef, "check1");

        if (safi?.genderSelect?.find((elem) => elem === "male")) {
          setBoy(true);
          // console.log('boy test')
        } else {
          setBoy(false)
        }
        if (safi?.genderSelect?.find((elem) => elem === "female")) {
          setGirl(true);
        } else {
          setGirl(false)
        }
        if (safi?.genderSelect?.find((elem) => elem === "both")) {
          setBoth(true);
        } else {
          setBoth(false)
        }
        setImported(true);
        setGenderSelect(safi?.genderSelect);
        setCaseName(safi?.caseName);
        setMin(safi?.min);
        setMax(safi?.max);
        setOtherVariables(safi?.otherVariables);
        setCategoriesFields(safi?.categoriesFields);
        setQuestion(safi?.question);
        setQuestionCategoryValue(safi?.questionCategoryValue);
        setCorrectMultipleOptions(safi?.correctMultipleOptions);
        setAnswers(safi?.answers);
        setCorrectMultipleOptionsInputRef(correctOptionsInputRef);
        setChipInputRef(variablesRef);
        setAnswerInputRef(answerInputOptionsRef);
        setMultiSelectValues(Object.keys(safi?.otherVariables));
        // console.log("states are saving correctly");
      }
    };
    reader.readAsText(e.target.files[0]);
  };
  const HandleAddMoreQuestions = (category) => {
    const index = questionCategoryValue.lastIndexOf(category) + 1;
    let questionsArray = [...question]
    let categoryValueArray = [...questionCategoryValue]
    questionsArray.splice(index, 0, "");
    categoryValueArray.splice(index, 0, category);
    setQuestionCategoryValue(categoryValueArray)
    setQuestion(questionsArray)
  }
  useEffect(() => {
    // console.log(multiSelectValues, "multiSelectValues");
    handleAddVariableForMultiSelect();
  }, [multiSelectValues]);
  return (
    <>
      <LoadingBar
        color='#f11946'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      {showPage &&
        <main className="App">
          <Header name="Automatic Item Generator v.4 (AIG-4)" />
          <div></div>
          {/* <label
        htmlFor="files"
        className="btn"
        style={{
          backgroundColor: "#333",
          color: "#fff",
          padding: "12px 32px",
          margin: "4px 2px",
          cursor: "pointer",
          borderRadius: "2rem",
          float: "right",
        }}
        onClick={() => navigate(`/${themeName}/cases`)}
      >
        All Cases
      </label> */}
          <Row className="mt-5 d-lg-flex d-md-flex d-block">
            <Col flex={1} className="d-flex align-items-end">
              <Breadcrumb>
                <Breadcrumb.Item onClick={(event) => handleClick(event, '/')} style={{ fontSize: "1.2rem" }}>
                  <Link to={'/'} style={{ textDecoration: 'none', color: 'inherit' }}>
                    MCQs Generator
                  </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item onClick={(event) => handleClick(event, '/themes')} style={{ fontSize: "1.2rem" }}>
                  <Link to={'/themes'} style={{ textDecoration: 'none', color: 'inherit' }}>
                    Themes
                  </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item onClick={(event) => handleClick(event, `/${themeName}/cases`)} style={{ fontSize: "1.2rem" }}>
                  <Link to={`/${themeName}/cases`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {themeName}
                  </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item
                  active
                  style={{ fontSize: "1.2rem", color: "black" }}
                >
                  Add Case
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
            <Col flex={1}>
              <div className="text-lg-end text-md-end mt-lg-0 mt-md-0 mt-2">
                <label
                  htmlFor="files"
                  className="btn"
                  style={{
                    backgroundColor: "lightgray",
                    color: "black",
                    padding: "12px 32px",
                    margin: "4px 2px",
                    cursor: "pointer",
                    borderRadius: "0.5rem",
                  }}
                >
                  Import MCQ Template
                </label>
                <input
                  id="files"
                  style={{ visibility: "hidden", display: "none" }}
                  type="file"
                  onChange={(e) => showFile(e)}
                />
              </div>
            </Col>
          </Row>
          {!theme ? (
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
              <div className="d-flex align-items-center mt-4 row case-aig">
                <div className="my-4 col-lg-4 col-md-6 col-12 d-flex align-items-center">
                  <b>Case Name:&nbsp;&nbsp;</b>
                  <Input
                    style={{ width: "63%" }}
                    placeholder="Case Name"
                    name={caseName}
                    value={caseName}
                    onChange={(e) => setCaseName(e.target.value)}
                  />
                </div>
                <div className="my-4 col-lg-4 col-md-6 col-12 d-flex align-items-center justify-content-lg-center justify-content-md-center">
                  <b level={4}>{HEADING.age}:</b>
                  &nbsp;&nbsp;
                  <Input
                    style={{ width: "50px" }}
                    placeholder={"min"}
                    name={min}
                    value={min === 0 ? "" : min}
                    onChange={(e) => setMin(e.target.value)}
                  />
                  &nbsp;
                  {/* <span style={{ marginTop: "5px" }}> */}
                  <big>-</big>
                  {/* </span> */}
                  &nbsp;
                  <Input
                    style={{ width: "50px" }}
                    placeholder={"max"}
                    name={max}
                    value={max === 0 ? "" : max}
                    onChange={(e) => setMax(e.target.value)}
                  />
                </div>
                <div className="my-4 col-lg-4 col-md-6 col-12 d-flex align-items-center justify-content-lg-end">
                  <div>
                    <b level={4}>{HEADING.sex}: &nbsp;</b>
                    <div style={{ display: "inline-block" }}>
                      <Form.Check
                        aria-label={`category 1`}
                        checked={both}
                        value={both}
                        className="mx-1"
                        onChange={() => {
                          setBoth(!both);
                          genderSelectFunction(!both, "both");
                        }}
                      />
                    </div>
                    <div style={{ display: "inline-block" }}>
                      &nbsp;{"both"}&nbsp;&nbsp;
                    </div>
                    <div style={{ display: "inline-block" }}>
                      <Form.Check
                        aria-label={`category 1`}
                        checked={boy}
                        value={boy}
                        className="mx-1"
                        onChange={() => {
                          setBoy(!boy);
                          genderSelectFunction(!boy, "male");
                        }}
                      />
                    </div>
                    <div style={{ display: "inline-block" }}>
                      &nbsp;{"male"}&nbsp;&nbsp;
                    </div>
                    <div style={{ display: "inline-block" }}>
                      <Form.Check
                        aria-label={`category 1`}
                        checked={girl}
                        value={girl}
                        className="mx-1"
                        onChange={() => {
                          setGirl(!girl);
                          genderSelectFunction(!girl, "female");
                        }}
                      />
                    </div>
                    <div style={{ display: "inline-block" }}>
                      &nbsp;{"female"}&nbsp;&nbsp;
                    </div>
                  </div>
                </div>
              </div>
              <OtherVariables
                multiSelectValues={multiSelectValues}
                setMultiSelectValues={setMultiSelectValues}
                codesData={codesData}
                variables={variables}
                otherVariables={otherVariables}
                setOtherVariables={setOtherVariables}
                chipInputRef={chipInputRef}
                setChipInputRef={setChipInputRef}
                variableName={variableName}
                setVariableName={setVariableName}
                inputValue={inputValue}
                setInputValue={setInputValue}
                inputVisible={inputVisible}
                setInputVisible={setInputVisible}
                existingValueError={existingValueError}
                setExistingValueError={existingValueError}
                handleAddVariable={handleAddVariable}
                onChipInputChange={onChipInputChange}
                onChipInputToggleVisb={onChipInputToggleVisb}
                onChipInputSubmit={onChipInputSubmit}
                onChipRemove={onChipRemove}
              />
              <div className="mb-5 mt-4">
                <CategorySection
                  addCategory={addCategory}
                  onAddQuestion={onAddQuestion}
                  categoriesFields={categoriesFields}
                  questions={question}
                  imported={imported}
                  setImported={setImported}
                  questionCategoryValue={questionCategoryValue}
                />
              </div>

              {questionCategoryValue
                ?.filter((value, index, array) => array.indexOf(value) === index)
                .map((category, index) => {
                  return (
                    <Accordion
                      key={index}
                      defaultActiveKey={index === 0 ? "0" : ""}
                      className="mb-3"
                    // style={{ borderRadius: "0.5rem" }}
                    >
                      <Accordion.Item eventKey={`${index}`} style={{ borderRadius: "0.5rem" }}>
                        <Accordion.Header>
                          <h3
                            className="text-center"
                            style={{ fontSize: "19px", fontWeight: "700" }}
                          >
                            {category}
                          </h3>
                        </Accordion.Header>
                        <Accordion.Body>
                          {question.length > 0 && (
                            <div className="my-3">
                              <b className="mb-3">{HEADING.question}:</b>
                              <form>
                                {question.map((el, index) => (
                                  <QuestionInput
                                    category={category}
                                    value={el}
                                    index={index}
                                    key={index}
                                    imported={imported}
                                    questionTagsValue={questionTagsValue}
                                    tagsValueChange={questionTagsValueChangefun}
                                    questionCategoryValue={
                                      questionCategoryValue?.[index]
                                    }
                                    categoryValueChange={
                                      questionCategoryValueChangefun
                                    }
                                    categoriesFields={categoriesFields}
                                    tagfields={tagfields}
                                    onSaveRef={onQuestionInputSaveRef}
                                    onRemove={onQuestionRemove}
                                    onInputChange={onQuestionInputChange}
                                  />
                                ))}
                                <Button
                                  className='d-flex align-items-center justify-content-center'
                                  type="dashed"
                                  onClick={() => HandleAddMoreQuestions(category)}
                                  style={{ width: "40%" }}
                                  icon={<PlusOutlined />}
                                  disabled={!category || !question}
                                >
                                  Add Question
                                </Button>
                              </form>
                            </div>
                          )}
                          <CorrectCategoryOption
                            imported={imported}
                            category={category}
                            index={index}
                            correctMultipleOptionsInputRef={
                              correctMultipleOptionsInputRef
                            }
                            question={question}
                            categoriesFields={categoriesFields}
                            HEADING={HEADING}
                            correctMultipleOptions={correctMultipleOptions}
                            onCorrectMultipleOptionsInputSaveRef={
                              onCorrectMultipleOptionsInputSaveRef
                            }
                            onCorrectMultipleOptionsRemove={
                              onCorrectMultipleOptionsRemove
                            }
                            onCorrectMultipleOptionsInputChange={
                              onCorrectMultipleOptionsInputChange
                            }
                            onCorrectMultipleOptionsInputAdd={
                              onCorrectMultipleOptionsInputAdd
                            }
                            onCorrectMultipleOptionsLoad={
                              onCorrectMultipleOptionsLoad
                            }
                            genderSelect={genderSelect}
                          />
                          <DistractCategoryOption
                            imported={imported}
                            category={category}
                            index={index}
                            answerInputRef={answerInputRef}
                            question={question}
                            categoriesFields={categoriesFields}
                            answers={answers}
                            HEADING={HEADING}
                            onAnswerInputSaveRef={onAnswerInputSaveRef}
                            onAnswerRemove={onAnswerRemove}
                            onAnswersInputChange={onAnswersInputChange}
                            onAnswersInputAdd={onAnswersInputAdd}
                            onAnswersLoad={onAnswersLoad}
                            genderSelect={genderSelect}
                          />
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  );
                })}

              <div className="mt-5 d-flex justify-content-around">
                <Button
                  className="onDisabled"
                  size="large" //TODO
                  icon={<SafetyOutlined />}
                  onClick={HandleSaveCase}
                  disabled={!caseName}
                >
                  <>Save Case</>
                </Button>
                <Button
                  className="onDisabled"
                  size="large"
                  icon={<DownloadOutlined />}
                  onClick={() => downloadFile()}
                  disabled={!caseName}
                >
                  Save MCQ Template
                </Button>
              </div>
            </>
          )}
        </main>}
    </>
  );
};
