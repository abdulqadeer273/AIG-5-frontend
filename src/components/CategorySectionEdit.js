import { Col, Row } from "antd";
import { Form } from "react-bootstrap";
const CategorySectionEdit = ({
    onAddQuestion,
    addCategory,
    questionCategories,
    setQuestionCategories
}) => {
    const HandleAdd = () => {
        addCategory(questionCategories);
        onAddQuestion(questionCategories);
    };
    const HandleSelectCategory = (index) => {
        // console.log('shouldnt come here')
        let arr = [...questionCategories];
        arr[index].selected = !questionCategories[index]?.selected;
        setQuestionCategories(arr);
        HandleAdd();
    };
    return (
        <>
            <div className="mainDiv">
                <Row gutter={8}>
                    <Col flex="1" className="filtersDiv">
                        <Row gutter={8}>
                            <Col flex="1.5">
                                <Col style={{ marginBottom: "10px" }} className="px-0">
                                    <b>Select Question Category:</b>
                                </Col>
                                <Row>
                                    {questionCategories?.map((elem, index) => {
                                        return (
                                            <Col
                                                key={index}
                                                className="mb-2 col-xl-3 col-lg-4 col-md-4 col-12"
                                                style={{ whiteSpace: "nowrap" }}
                                            >
                                                <div style={{ display: "inline-block" }}>
                                                    <Form.Check
                                                        aria-label={`category 1`}
                                                        checked={elem?.selected}
                                                        value={elem?.selected}
                                                        onChange={() => HandleSelectCategory(index)}
                                                    />
                                                </div>
                                                <div style={{ display: "inline-block" }}>
                                                    &nbsp;{elem?.mcq_category}&nbsp;&nbsp;
                                                </div>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        </>
    );
};
export default CategorySectionEdit;
