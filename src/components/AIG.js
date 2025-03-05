import React, { useState, useRef, useEffect } from "react";
import { Typography, Input, Row, Col, Button, Select } from 'antd';
import axios from "../api/axios";
import { Audio, ProgressBar, ColorRing } from 'react-loader-spinner'
import Main from "./QuestionPage";
import MCQ from "./aigcomponent/MCQ";
import Header from "./Header";
import { Link } from "react-router-dom";
const AIG = (props) => {
    const { Title } = Typography
    const [puff, setPuff] = useState(false);
    const showCatRef = useRef(0);
    const [mcqCategory, setMcqCategory] = useState('');
    const [categories, setCategories] = useState();
    const [noOfMcq, setNoOfMcq] = useState('');
    const [questionCategory, setQuestionCategory] = useState('');
    const [showCat, setShowCat] = useState([]);
    const [MCQsItems, setMCQsItems] = useState();
    const [userData, setUserData] = useState();
    const empty = [];
    useEffect(() => {
        axios.get('category_mcq_list/'
        ).then(res => {
            console.log(res.data, "data")
            const Data = res?.data?.map((item) => ({
                label: item.mcq_category,
                value: item.mcq_category
            }));
            setUserData(Data)
            setCategories(res.data)
        }).catch(err => {
            // console.log(err)
        })
    }, [2])
    const num = () => {
        for (let i = 0; i < categories?.length; i++) {
            if (mcqCategory === categories[i]?.mcq_category) {
                return categories[i]?.results
            }
        }
    }
    const userData1 = num()?.map((item) => ({
        label: item.questionCategory__name,
        value: item.questionCategory__name
    }));
    const getData = () => {
        // let body=[showCat.concat({name:mcqCategory,numberOfMCQs:int(noOfMcq)})];
        let body;
        if (!showCat) {
            body = [{
                topic: mcqCategory,
                numberOfMCQs: noOfMcq,
                questionCategory: questionCategory
            }]
        } else {
            body = showCat.concat({
                topic: mcqCategory,
                numberOfMCQs: noOfMcq,
                question_category: questionCategory
            })
        }
        axios.post('fetch_mcq_by_category/', body
        ).then(res => {
            console.log(res.data, 'data')
            setMCQsItems(res.data)
            setPuff(false)
        }).catch(err => {
            console.log(err)
            setPuff(false)
        })
    }
    const HandleChange = () => {
        setPuff(true)
        let data = {
            topic: mcqCategory,
            numberOfMCQs: noOfMcq,
            question_category: questionCategory
        }
        setShowCat(prev => {
            return [...prev, data]
        })
        setMcqCategory('')
        setQuestionCategory('')
        setNoOfMcq('')
        getData();
    };
    const HandleRemove = (index) => {
        if (showCat.length > 1) {

            // setShowCat([
            //     ...showCat.slice(0, i),
            //     ...showCat.slice(i + 1, showCat.length)
            // ]);
            let arr = [];
            const result = showCat.filter((elem, i) => {
                return i !== index;
            })
            setShowCat(result);
            axios.post('fetch_mcq_by_category/', result
            ).then(res => {
                setMCQsItems(res.data)
                setPuff(false)
            }).catch(err => {
                // console.log(err)
                setPuff(false)
            })
        } else {
            setShowCat(empty)
            setMCQsItems(empty)
        }
    }
    const onChange = (value) => {
        console.log(`selected ${value}`);
    };

    const onSearch = (value) => {
        console.log('search:', value);
    };
    return (
        <>
            <main className="app">
                <Header name="Automatic Item Generator v.4 (AIG-4)" />
                <div style={{ display: "flex", justifyContent: "end" }} className="mt-5">
                    <Link to="/">
                        <label
                            htmlFor="files"
                            className="btn"
                            style={{
                                backgroundColor: "lightgray",
                                color: "black",
                                padding: "6px 50px",
                                margin: "24px 0",
                                cursor: "pointer",
                                borderRadius: "0.5rem",
                            }}
                        >
                            Open Automatic Item Generator (AIG)
                        </label></Link>
                </div>
                {!categories && <center><ColorRing
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="blocks-loading"
                    wrapperStyle={{}}
                    wrapperClass="blocks-wrapper"
                    colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
                /></center>}
                {categories && <Main
                    userData1={userData1}
                    userData={userData}
                    mcqCategory={mcqCategory}
                    questionCategory={questionCategory}
                    noOfMcq={noOfMcq}
                    showCatRef={showCatRef}
                    showCat={showCat}
                    categories={categories}
                    HandleChange={HandleChange}
                    HandleRemove={HandleRemove}
                    setMcqCategory={setMcqCategory}
                    setNoOfMcq={setNoOfMcq}
                    setQuestionCategory={setQuestionCategory}
                    num={num}
                    setPuff={setPuff}
                    puff={puff}
                />}
                <MCQ
                    MCQsItems={MCQsItems} />
            </main>
        </>
    )
}
export default AIG;