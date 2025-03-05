import React from "react";
import { Typography, Button } from 'antd';
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { DownloadOutlined } from "@ant-design/icons";
const MCQ = ({
    MCQsItems,

}) => {
    const { Title } = Typography
    // console.log(MCQsItems, "MCQ")
    const generateLatexAndDownload = () => {
        let texStr = "";
        MCQsItems.map((dataEl, dataIndex) => {
            texStr = texStr + `${dataIndex + 1}.  `;
            texStr = texStr + `${dataEl.story}\n`;
            texStr = texStr + `${dataEl.question}\n\n`;
            dataEl.options.map((el, MCQIndex) => {
                texStr =
                    texStr +
                    `${String.fromCharCode("a".charCodeAt(0) + MCQIndex)}. ${el}\n\n`;
            });
            // texStr = texStr + `${dataEl.mcq__questionCategory}\n`;
            texStr = texStr + `\n\n`;
        });

        ////console.log("texStr iterate", texStr);
        downloadMcqFile(texStr);
    };
    const downloadMcqFile = (str) => {
        const hiddenElement = document.createElement("a");
        hiddenElement.href = "data:text/plain;charset=utf-8," + encodeURI(str);
        hiddenElement.target = "_blank";
        hiddenElement.download = `MCQs.txt`;
        hiddenElement.click();
    }
    return (
        <>
            {MCQsItems &&
                <>
                    <Title level={3} className="mb-2 mt-3">
                        Quesions Preview ({MCQsItems?.length} Questions)
                    </Title>
                    {
                        MCQsItems?.map((item, itemIndex) => {
                            return (
                                <ul className="ul px-0" key={itemIndex}>
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
                                                            __html: item.story
                                                            ,
                                                        }}
                                                    ></span>
                                                </Title>

                                                <Title level={4} className="mb-4">
                                                    {item.question}
                                                </Title>
                                                <ul className="ul-2" style={{ color: "black" }}>
                                                    {item.options.map((el, optionIndex) => {
                                                        return (
                                                            <li key={optionIndex} >
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
                                                {/* <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: `Question Category: ${item.mcq__questionCategory
                                                            }`
                                                    }}
                                                ></span><br /><br /> */}
                                                {/* <strong>Question Category:&nbsp;</strong>{item.mcq__questionCategory} */}
                                                <br />
                                            </li>
                                        </CSSTransition>
                                    </TransitionGroup>
                                </ul>
                            );
                        })
                    }
                    <Button
                        className="d-flex align-items-center"
                        size="large"
                        icon={<DownloadOutlined />}
                        onClick={generateLatexAndDownload}
                    >
                        Download TeX File ({MCQsItems?.length} Questions)
                    </Button>
                </>
            }
        </>
    )
}
export default MCQ;