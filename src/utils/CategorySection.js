import { Col, Row } from "antd";
import axios from "../api/axios";
import { useState } from "react";
import { useEffect } from "react";
import { Form } from "react-bootstrap";
const CategorySection = ({
  onAddQuestion,
  addCategory,
  imported,
  questionCategoryValue,
  setImported,
}) => {
  const [questionCategories, setQuestionCategories] = useState([]);
  useEffect(() => {
    axios
      .get("question_category_mcq_list/")
      .then((res) => {
        const Data = res?.data?.map((item) => ({
          label: item.mcq_category,
          value: item.mcq_category,
        }));
        setQuestionCategories(res?.data);
      })
      .catch((err) => { });
  }, []);
  useEffect(() => {
    // console.log('first')
    if (imported && questionCategoryValue?.length > 0 && questionCategories?.length > 0) {
      let array = questionCategoryValue?.filter(
        (value, index, array) => array.indexOf(value) === index
      );
      for (let i = 0; i < array.length; i++) {
        let arr = [...questionCategories];
        let index = arr.findIndex((elem) => elem?.mcq_category === array[i]);
        // console.log(index, 'index')
        if (questionCategories[index]) {
          arr[index].selected = true;
        }
        setQuestionCategories(arr);
      }
      setImported(false)
    }
  }, [imported, questionCategoryValue, questionCategories]);
  const HandleAdd = () => {
    addCategory(questionCategories);
    onAddQuestion(questionCategories);
  };
  const HandleSelectCategory = (index) => {
    let arr = [...questionCategories];
    arr[index].selected = !questionCategories[index]?.selected;
    setQuestionCategories(arr);
    HandleAdd();
  };
  return (
    <>
      <div className="mainDiv case-aig">
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
export default CategorySection;
