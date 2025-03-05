import React from "react";
import { Typography, Button } from 'antd';
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { DownloadOutlined } from "@ant-design/icons";
import axios from "../api/axios";
const MCQ = ({
    MCQsItems,
    topic,
}) => {
    const { Title } = Typography
    const generateLatexAndDownload = () => {
        let texStr = "";
        MCQsItems.map((dataEl, dataIndex) => {
            texStr = texStr + `${dataIndex + 1}.  `;
            texStr = texStr + `${dataEl.story}\n`;
            texStr = texStr + `${dataEl.question}\n\n`;
            dataEl.alternativeOptions.map((el, MCQIndex) => {
                texStr =
                    texStr +
                    `${String.fromCharCode("a".charCodeAt(0) + MCQIndex)}. ${el}\n\n`;
            });
            texStr = texStr + `\n\n`;
        });
        downloadMcqFile(texStr);
    };
    const downloadMcqFile = (str) => {
        const hiddenElement = document.createElement("a");
        hiddenElement.href = "data:text/plain;charset=utf-8," + encodeURI(str);
        hiddenElement.target = "_blank";
        hiddenElement.download = `MCQs.txt`;
        hiddenElement.click();
    }
    function SaveData() {
        let data;
        let arr = [];
        console.log(MCQsItems, 'mcqitems')
        for (let i = 0; i < MCQsItems?.length; i++) {
            let options = [];
            let storiesCategories = [];
            let questionCategories = [];
            for (let j = 0; j < MCQsItems[i]?.alternativeOptions?.length; j++) {
                options.push(MCQsItems[i]?.alternativeOptions[j]);
            }
            questionCategories.push(MCQsItems[i]?.category);
            data = {
                story: MCQsItems[i]?.story,
                mcqCategory: topic,
                question: MCQsItems[i]?.question,
                options: options,
                questionCategory: MCQsItems[i]?.category,
            };
            arr.push(data);
        }
        axios
            .post("send_mcq_data/", arr)
            .then((res) => {
                alert("Data has been saved in Database successfully!");
            })
            .catch((err) => {
                alert("Server Error!");
            });
        console.log(arr, 'arr')
    }
    return (
        <>
            {MCQsItems &&
                <>
                    <Title level={3} className="mb-3">
                        Quesions Preview ({MCQsItems?.length} Questions)
                    </Title>
                    {
                        MCQsItems?.map((item, itemIndex) => {
                            return (
                                <ul className="ul" key={itemIndex} style={{ color: "black" }}>
                                    <TransitionGroup
                                        component={null}
                                        appear={true}
                                        in={true}
                                        mountOnEnter={true}
                                        unmountOnExit={true}
                                    >
                                        <CSSTransition timeout={500} classNames="exampe">
                                            <li>
                                                <Title level={4} className="mb-4">
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: `${itemIndex + 1}. `,
                                                        }}
                                                    ></span>
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: item?.story
                                                            ,
                                                        }}
                                                    ></span>
                                                </Title>

                                                <Title level={4} className="mb-4">
                                                    {item?.question}
                                                </Title>
                                                <ul className="ul-2" style={{ color: "black" }}>
                                                    {item?.alternativeOptions.map((el, optionIndex) => {
                                                        return (
                                                            <li key={optionIndex}>
                                                                <b>
                                                                    {String.fromCharCode(
                                                                        "a".charCodeAt(0) + optionIndex
                                                                    )}.
                                                                </b>
                                                                &nbsp;&nbsp;{el}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                                <hr/>
                                                <Title level={4} className="mb-4">
                                                    {item?.caseName}
                                                </Title>
                                                <br />
                                            </li>
                                        </CSSTransition>
                                    </TransitionGroup>
                                </ul>
                            );
                        })
                    }
                    <div className="d-lg-flex d-md-flex justify-content-between">
                        <Button
                            size="large"
                            icon={<DownloadOutlined />}
                            onClick={generateLatexAndDownload}
                            style={{paddingLeft:"4rem"}}
                            className="d-flex align-items-center d-mcq py-lg-0 py-md-0 py-4 col-xl-5 col-lg-6 col-md-8"
                        >
                            Download Generated MCQs as a Text File  ({MCQsItems?.length} Questions)
                        </Button>
                        <Button
                            size="large"
                            icon={<DownloadOutlined />}
                            onClick={SaveData}
                            className="d-flex align-items-center justify-content-center ms-lg-0 ms-md-2 mt-lg-0 mt-md-0 mt-2 col-xl-3 col-lg-3 col-md-4"
                            style={{ whiteSpace: "nowrap" }}
                        >
                            Save Data in DataBase
                        </Button>
                    </div>
                </>
            }
        </>
    )
}
export default MCQ;