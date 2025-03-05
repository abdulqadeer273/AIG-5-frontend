import { Col, Row, Input } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
const QuestionInput = ({
  value,
  index,
  onRemove,
  onInputChange,
  onInputSubmit,
  onSaveRef,
  categoriesFields,
  tagfields,
  categoryValueChange,
  imported,
  category,
  tagsValueChange,
  questionCategoryValue,
}) => {
  const { TextArea } = Input;
  const saveRef = (ref) => {
    onSaveRef(index, ref);
  };
  const handleClose = () => {
    onRemove(index);
  };
  const inputChange = (e) => {
    onInputChange(index, e.target.value);
  };
  const inputSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onInputSubmit(index);
    }
  };

  let categoriesChange = (e) => {
    categoryValueChange(index, e.target.value);
  };
  let questionTagsValueChange = (e) => {
    tagsValueChange(index, e.target.value);
  };
  if (category === questionCategoryValue)
    return (
      <div className="my-2">
        <label className="mb-1">Question</label>
        <Row gutter={8}>
          <Col flex="2">
            <TextArea
              ref={saveRef}
              onChange={inputChange}
              onKeyPress={inputSubmit}
              placeholder={`eg. What is the most likely diagnosis in this case? Question ${
                index + 1
              }`}
              autoSize={{ minRows: 1, maxRows: 10 }}
              value={value}
            />
          </Col>
          <Col>
            <CloseCircleFilled
              className="dynamic-delete-button d-flex align-items-center justify-content-center"
              onClick={handleClose}
            />
          </Col>
        </Row>
      </div>
    );
};
export default QuestionInput;
