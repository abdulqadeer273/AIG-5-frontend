import { CloseCircleFilled } from "@ant-design/icons";
import { Input, Row, Col } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee, faXmark } from "@fortawesome/free-solid-svg-icons";
const { TextArea } = Input;
const StoryInput = ({
  value,
  index,
  onRemove,
  onInputChange,
  onSaveRef,
}) => {
  const saveRef = (ref) => {
    onSaveRef(index, ref);
  };
  const handleClose = () => {
    onRemove(index);
  };
  const inputChange = (e) => {
    onInputChange(index, e.target.value);
  };
  return (
    <Row className="mb-2 d-flex align-items-center">
      <Col flex="1">
        <TextArea
          ref={saveRef}
          onChange={inputChange}
          placeholder={`eg. A (1)-year-old (2) presented with (3) associated with (4). The patient family gave a history of (5). Family history revealed (6). History of drug treatment revealed (7). On physical examination, the patient was found to have (8) and (9). Vital signs showed the following values: (10). Story ${
            index + 1
          }`}
          autoSize={{ minRows: 2 }}
          value={value}
        />
      </Col>

      <Col>
        <FontAwesomeIcon
          icon={faXmark}
          className="dynamic-delete-button"
          onClick={handleClose}
        ></FontAwesomeIcon>
      </Col>
    </Row>
  );
};
export default StoryInput;
