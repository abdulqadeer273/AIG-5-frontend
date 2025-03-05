import { PlusOutlined, SafetyOutlined, DownloadOutlined } from '@ant-design/icons'
import { Input, Slider, Button, Space, Alert, Row, Col } from 'antd'
import Typography from "@mui/material/Typography";
import axios from '../api/axios'
import React from 'react'
import { useState, useEffect, createRef } from 'react'
import { Accordion, Breadcrumb, Form } from 'react-bootstrap'
import { Dna } from 'react-loader-spinner'
import Chip from '../utils/Chip'
import ChipInput from '../utils/ChipInput'
import Header from './Header'
import SelectTopic from './SelectTopic'
import CategorySection from '../utils/CategorySection'
import QuestionInput from '../utils/QuestionInput'
import CorrectOptionSection from '../utils/CorrectOptionSection';
import OptionSection from '../utils/OptionSection';
import { useNavigate, useParams, Link } from 'react-router-dom'
import { saveAs } from 'file-saver';
import OtherVariables from './VariableComponent'
import CorrectCategoryOption from './CorrectCategoryOption'
import DistractCategoryOption from './DistractCategoryOption'
import LoadingBar from 'react-top-loading-bar'
import CategorySectionEdit from './CategorySectionEdit';
export const EditCase = (props) => {
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
        addQuestion: "Add Question"
    };
    const { theme, case_name } = useParams();
    const [inputRangeValue, setInputRangeValue] = useState(0);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(0);
    const [caseName, setCaseName] = useState(case_name)
    const [otherVariables, setOtherVariables] = useState([])
    const [variableName, setVariableName] = useState('')
    const [variableValue, setVariableValue] = useState('')
    const [existingValueError, setExistingValueError] = useState(false)
    const [existingCategoryError, setExistingCategoryError] = useState(false)
    const [categories, setCategories] = useState([])
    const [categoryName, setCategoryName] = useState('')
    const [inputVisible, setInputVisible] = useState({})
    const [chipInputRef, setChipInputRef] = useState({})
    const [progress, setProgress] = useState(30)
    const [showPage, setShowPage] = useState(false)
    const [inputValue, setInputValue] = useState({})
    const [categoriesFields, setCategoriesFields] = useState([])
    const [question, setQuestion] = useState([])
    const [questionCategoryValue, setQuestionCategoryValue] = useState([])
    const [questionTagsValue, setQuestionTagsValue] = useState([])
    const [questionInputRef, setQuestionInputRef] = useState({})
    const [tagfields, setTagfields] = useState({})
    const [answers, setAnswers] = useState({})
    const [correctMultipleOptions, setCorrectMultipleOptions] = useState({})
    const [genderSelect, setGenderSelect] = useState([])
    const [correctMultipleOptionsInputRef, setCorrectMultipleOptionsInputRef] = useState({})
    const [answerInputRef, setAnswerInputRef] = useState({})
    const [boy, setBoy] = useState(false)
    const [girl, setGirl] = useState(false)
    const [both, setBoth] = useState(false)
    const [caseData, setCaseData] = useState([])
    const [imported, setImported] = useState(false)
    const [variables, setVariables] = useState([])
    const [multiSelectValues, setMultiSelectValues] = useState([]);
    const [codesData, setCodesData] = useState()
    const [questionCategories, setQuestionCategories] = useState([]);
    const navigate = useNavigate();
    const themeName = theme.replace(/%20/g, " ")
    useEffect(() => {
        axios.get("fetch-variables/"
        ).then(res => {
            // setVariables(res?.data?.variables)
            const Data = res?.data?.variables?.map((item) => ({
                label: `${item.name} (${item.code})`,
                value: `${item.name} (${item.code})`
            }));
            setCodesData(Data)
        })
    }, [])
    useEffect(() => {
        axios.post('view_case/', { theme, case_name }).then(res => {
            let data = res?.data
            //variable ref
            let variablesRef = {}
            for (let i = 0; i < Object.keys(data?.other_variables_list).length; i++) {
                variablesRef[Object.keys(data?.other_variables_list)[i]] = [createRef()]
            }
            // correctoptionsref
            let correctOptionsInputRef = {}
            for (let i = 0; i < Object.keys(data?.correct_multiple_options).length; i++) {
                let refsArray = []
                for (let j = 0; j < Object.values(data?.correct_multiple_options)[i].length; j++) {
                    refsArray.push(createRef())
                }
                correctOptionsInputRef[Object.keys(data?.correct_multiple_options)[i]] = refsArray
            }
            let answerInputOptionsRef = {}
            for (let i = 0; i < Object.keys(data?.distract_multiple_options).length; i++) {
                let refsArray = []
                for (let j = 0; j < Object.values(data?.distract_multiple_options)[i].length; j++) {
                    refsArray.push(createRef())
                }
                answerInputOptionsRef[Object.keys(data?.distract_multiple_options)[i]] = refsArray
            }
            if (data?.gender?.find(elem => elem === "male")) {
                setBoy(true)
            }
            if (data?.gender?.find(elem => elem === "female")) {
                setGirl(true)
            }
            if (data?.gender?.find(elem => elem === "both")) {
                setBoth(true)
            }
            setImported(true)
            setGenderSelect(data?.gender)
            setCorrectMultipleOptionsInputRef(correctOptionsInputRef)
            setChipInputRef(variablesRef)
            setMin(data?.age_range?.min_age)
            setMax(data?.age_range?.max_age)
            setMultiSelectValues(Object.keys(data?.other_variables_list))
            setOtherVariables(data?.other_variables_list)
            setVariables(data?.variables)
            setCategoriesFields(data?.categories_fields)
            setQuestion(data?.questions)
            setQuestionCategoryValue(data?.question_category_values)
            setCorrectMultipleOptions(data?.correct_multiple_options)
            setAnswers(data?.distract_multiple_options)
            setAnswerInputRef(answerInputOptionsRef)
        })
    }, [])
    useEffect(() => {
        if (imported === true) {
            if (questionCategoryValue?.length > 0) {
                axios
                    .get("question_category_mcq_list/")
                    .then((res) => {
                        let array = questionCategoryValue?.filter(
                            (value, index, array) => array.indexOf(value) === index
                        );
                        let arr = res?.data;
                        for (let i = 0; i < array.length; i++) {
                            let index = arr.findIndex((elem) => elem?.mcq_category === array[i]);
                            // console.log(index, 'index')
                            if (arr[index]) {
                                arr[index].selected = true;
                            }
                        }
                        setQuestionCategories(arr);
                        setProgress(100);
                        setShowPage(true)
                        setImported(false)
                    })
                    .catch((err) => { });
            }
        }
    }, [questionCategoryValue]);
    const handleAddVariableForMultiSelect = () => {
        for (let i = 0; i < multiSelectValues.length; i++) {
            if (multiSelectValues[i] !== "" && !Object.keys(otherVariables)?.includes(multiSelectValues[i])) {
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
                let key = Object.keys(otherVariables)[j]
                const newState = { ...otherVariables };
                delete newState[key];
                setOtherVariables(newState);
                const tempState = { ...chipInputRef };
                delete tempState[key];
                setChipInputRef(tempState);
            }
        }
    }
    const onChange = (value) => {
        if (isNaN(value)) {
            return;
        }
        setInputRangeValue(value);
    };
    const genderSelectFunction = (gen, str) => {
        var array = [...genderSelect]; // make a separate copy of the array
        var index = array.indexOf(str)
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

    }
    const onAfterChange = (value) => {
        setMin(value[0])
        setMax(value[1])
    };
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
    function HandleEditCase() {
        let gender = []
        if (boy) {
            gender.push('male')
        }
        if (girl) {
            gender.push('female')
        }
        if (both) {
            gender.push('both')
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
        let listOfVariables = {}
        for (let i = 0; i < Object.keys(otherVariables)?.length; i++) {
            let item = (Object.keys(otherVariables)[i] || "").trim().match(/\([a-z0-9_-]+\)/gi)?.[0] || "";
            listOfVariables[item.slice(1, item.length - 1)] = Object.values(otherVariables)[i]
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
            correctMultipleOptions: correctMultipleOptions
        }
        axios.post('edit_case/', body).then(res => {
            alert("Case has been saved successfully")
        }).catch(err => {
        })
    }
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
    const handleAddVariable = () => {
        setExistingValueError(false)
        if (Object.keys(otherVariables).find(elem => elem === variableName)) {
            setExistingValueError(true)
        } else {
            setOtherVariables((prevValues) => {
                return { ...prevValues, [variableName]: [] };
            });
            setVariableName('')
            setChipInputRef((prevRefs) => {
                return { ...prevRefs, [variableName]: [createRef()] };
            });
        }
    }
    const onChipInputChange = (field, newVal) => {
        const newInputValue = { ...inputValue }
        newInputValue[field] = newVal
        setInputValue(newInputValue)
    };
    const onChipInputToggleVisb = (field, visible) => {
        const newInputVisible = { ...inputVisible };
        newInputVisible[field] = visible
        setInputVisible(newInputVisible)
        setTimeout(() => {
            const inputRef = chipInputRef[field][0];
            if (inputRef && inputRef.current) {
                inputRef.current.focus();
            }
        }, 0);
    };
    const onChipInputSubmit = (field) => {
        let newFields = otherVariables[field];
        if (inputValue[field] && otherVariables[field].indexOf(inputValue[field]) === -1) {
            newFields = otherVariables[field].concat((inputValue[field] || "").trim());
        }
        const newFullFields = { ...otherVariables };
        newFullFields[field] = newFields
        setOtherVariables(newFullFields)
        const newInputValue = { ...inputValue }
        newInputValue[field] = ""
        setInputValue(newInputValue)
        setInputVisible(prevState => ({
            ...prevState,
            ...(inputValue[field] ? {} : { [field]: false })
        }));
    };
    const onChipRemove = (field, tag) => {
        const newFullFields = { ...otherVariables };
        newFullFields[field] = otherVariables[field].filter((el) => el !== tag)
        setOtherVariables(newFullFields)
    };
    const addCategory = (questionCategories) => {
        const newFields = [...categoriesFields];
        const newAnswers = { ...answers };
        const newCMO = { ...correctMultipleOptions };
        const newCorrectMultipleOptionsInputRef = { ...correctMultipleOptionsInputRef };
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
                let tempCategory = questionCategories[i]?.mcq_category
                for (let j = 0; j < questionCategories[i]?.results_question?.length; j++) {
                    let tempQuestion = questionCategories[i]?.results_question[j]?.question
                    if (!tempQuestions.includes(tempQuestion)) {
                        tempQuestions.push(tempQuestion)
                        tempCategoryValues.push(tempCategory)
                    }
                }
            }
        }
        setQuestion(tempQuestions)
        setQuestionCategoryValue(tempCategoryValues)
    }
    const questionTagsValueChangefun = (index, val) => {
        let tagValue = [...questionTagsValue]
        tagValue = [val]
        setQuestionTagsValue(tagValue)
    };
    const questionCategoryValueChangefun = (index, val) => {
        let questionCategories = [...questionCategoryValue]
        questionCategories[index] = val
        setQuestionCategoryValue(questionCategories)
    };
    const onQuestionInputSaveRef = (index, ref) => {
        questionInputRef[index] = ref;
    };
    function removeElAtIndex(arr, index) {
        return arr.slice(0, index).concat(arr.slice(index + 1));
    }
    function getOccurrence(array, value) {
        return array.filter((v) => (v === value)).length;
    }
    const onQuestionRemove = (index) => {
        let category = questionCategoryValue[index]
        setQuestion(removeElAtIndex(question, index))
        setQuestionCategoryValue(removeElAtIndex(questionCategoryValue, index))
        const occurence = getOccurrence(questionCategoryValue, category)
        if (occurence === 1) {
            const categoryIndex = categoriesFields.indexOf(category)
            setCategoriesFields(removeElAtIndex(categoriesFields, categoryIndex))
            const target = { ...answers };
            delete target[category]
            setAnswers(target)
            const target1 = { ...correctMultipleOptions };
            delete target1[category]
            setCorrectMultipleOptions(target1)
        }

    };
    const onQuestionInputChange = (index, newVal) => {
        const newQuestion = question.slice();
        newQuestion[index] = newVal;
        setQuestion(newQuestion)
    };
    const onCorrectMultipleOptionsInputSaveRef = (index, ref) => {
        correctMultipleOptionsInputRef[index] = ref;
    };
    function removeOptionElAtIndex(arr, category, index) {
        arr[category].splice(index, 1);
        return arr;
    }
    const onCorrectMultipleOptionsRemove = (category, index) => {
        const newArr = { ...correctMultipleOptions }
        newArr?.[category]?.splice(index, 1);
        setCorrectMultipleOptions(newArr)
        setCorrectMultipleOptionsInputRef(removeOptionElAtIndex(correctMultipleOptionsInputRef, category, index));

    };
    const onCorrectMultipleOptionsInputChange = (category, index, e) => {
        const newAnswers = { ...correctMultipleOptions };
        const { name, value } = e.target;
        newAnswers[category][index] = {
            ...newAnswers?.[category][index],
            [name]: value,
        };
        setCorrectMultipleOptions(newAnswers)
    };
    const onCorrectMultipleOptionsInputAdd = (index, category) => {
        let newRefs;
        setCorrectMultipleOptionsInputRef((prevRefs) => {
            newRefs = [...prevRefs[category], createRef()];
            return { ...prevRefs, [category]: newRefs };
        });
        const newCorrectMultipleOptions = { ...correctMultipleOptions }
        const newArr = newCorrectMultipleOptions[category]
        newArr.push({})
        newCorrectMultipleOptions[category] = newArr
        setCorrectMultipleOptions(newCorrectMultipleOptions)
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
        setCorrectMultipleOptions(newAnswers)
    };
    const onAnswerInputSaveRef = (index, ref) => {
        answerInputRef[index] = ref;
    };
    const onAnswerRemove = (category, index) => {
        const newArr = { ...answers }
        newArr?.[category]?.splice(index, 1);
        setAnswers(newArr)
        setAnswerInputRef(removeOptionElAtIndex(answerInputRef, category, index));
    };
    const onAnswersInputChange = (category, index, e) => {
        const newAnswers = { ...answers };
        const { name, value } = e.target;
        newAnswers[category][index] = {
            ...newAnswers?.[category][index],
            [name]: value,
        };
        setAnswers(newAnswers)
    };
    const onAnswersInputAdd = (index, category) => {
        const newAnswers = { ...answers }
        const newArr = newAnswers[category]
        newArr.push({})
        newAnswers[category] = newArr
        setAnswers(newAnswers)
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
        setAnswers(newAnswers)
    };
    function downloadFile() {
        let str = {
            imported: imported,
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

        }
        const blob = new Blob([JSON.stringify(str)], { type: 'application/js' });
        saveAs(blob, `${caseName}.conf`);

    }
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
        handleAddVariableForMultiSelect();
    }, [multiSelectValues])
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
                    <Row className='mt-5'>
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
                                    {caseName}
                                </Breadcrumb.Item>
                            </Breadcrumb>
                        </Col>
                    </Row>
                    {!theme ? <center><Dna
                        visible={true}
                        height="60"
                        width="80"
                        ariaLabel="dna-loading"
                        wrapperStyle={{}}
                        wrapperClass="dna-wrapper"
                        style={{ color: "white" }}
                    /></center>
                        :
                        <>
                            <div className='d-flex align-items-center row' style={{ marginTop: "1.5rem" }}>
                                <div className='my-4 col-lg-4 col-md-6 col-12 d-flex align-items-center'>
                                    <b>Case Name:&nbsp;&nbsp;</b>
                                    <Input className='onDisabled' style={{ width: '63%' }} placeholder="Case Name" name={caseName} value={caseName} onChange={(e) => setCaseName(e.target.value)} disabled />
                                </div>
                                <div className='my-4 col-lg-4 col-md-6 col-12 d-flex align-items-center justify-content-lg-center justify-content-md-center '>
                                    <b level={4}>
                                        {HEADING.age}:
                                    </b>
                                    &nbsp;&nbsp;<Input
                                        type='number'
                                        min={0}
                                        max={max}
                                        style={{ width: '50px' }}
                                        placeholder={"min"}
                                        name={min}
                                        value={min}
                                        onChange={(e) => setMin(e.target.value)}
                                    />&nbsp;
                                    <span><big>-</big></span>&nbsp;<Input
                                        type='number'
                                        style={{ width: '50px' }}
                                        placeholder={"max"}
                                        min={min}
                                        max={999}
                                        name={max}
                                        value={max}
                                        onChange={(e) => setMax(e.target.value)}
                                    />
                                </div>
                                <div className='my-4 col-lg-4 col-md-6 col-12 d-flex align-items-center justify-content-lg-end'>
                                    <div>
                                        <b level={4}>
                                            {HEADING.sex}:&nbsp;
                                        </b>
                                        <div style={{ display: "inline-block" }}>
                                            <Form.Check
                                                aria-label={`category 1`}
                                                checked={both}
                                                value={both}
                                                className="mx-1"
                                                onChange={() => { setBoth(!both); genderSelectFunction(!both, 'both') }}
                                            />
                                        </div><div style={{ display: "inline-block" }}>
                                            &nbsp;{"both"}&nbsp;&nbsp;
                                        </div>
                                        <div style={{ display: "inline-block" }}>
                                            <Form.Check
                                                aria-label={`category 1`}
                                                checked={boy}
                                                value={boy}
                                                className="mx-1"
                                                onChange={() => { setBoy(!boy); genderSelectFunction(!boy, 'male') }}
                                            />
                                        </div><div style={{ display: "inline-block" }}>
                                            &nbsp;{"male"}&nbsp;&nbsp;
                                        </div>
                                        <div style={{ display: "inline-block" }}>
                                            <Form.Check
                                                aria-label={`category 1`}
                                                checked={girl}
                                                value={girl}
                                                className="mx-1"
                                                onChange={() => { setGirl(!girl); genderSelectFunction(!girl, 'female') }}
                                            />
                                        </div><div style={{ display: "inline-block" }}>
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
                            <div className="my-4">
                                <CategorySectionEdit
                                    onAddQuestion={onAddQuestion}
                                    addCategory={addCategory}
                                    questionCategories={questionCategories}
                                    setQuestionCategories={setQuestionCategories}
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

                            <div style={{ display: "flex", justifyContent: "space-around" }}>
                                <Button
                                    size="large" //TODO
                                    icon={<SafetyOutlined />}
                                    onClick={HandleEditCase}
                                    className='d-flex align-items-center'
                                >
                                    <>Save Changes</>
                                </Button>
                                <Button
                                    size="large"
                                    icon={<DownloadOutlined />}
                                    className='d-flex align-items-center'
                                    onClick={() => downloadFile()}
                                >
                                    Save MCQ Template
                                </Button>
                            </div>
                        </>
                    }
                </main>}
        </>
    )
}
