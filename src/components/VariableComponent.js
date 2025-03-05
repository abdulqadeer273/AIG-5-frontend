import { Alert, Button, Col, Input, Row, Space, Tag, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Chip from "../utils/Chip";
import MultiSelect from "./MultiSelect";

const OtherVariables = ({
  variables,
  otherVariables,
  chipInputRef,
  variableName,
  setVariableName,
  inputValue,
  inputVisible,
  existingValueError,
  handleAddVariable,
  onChipInputChange,
  onChipInputToggleVisb,
  onChipInputSubmit,
  onChipRemove,
  codesData,
  setMultiSelectValues,
  multiSelectValues,
}) => {
  const onVariableChange = (value) => {
    // console.log(`selected ${value}`);
    setVariableName(value);
  };
  return (
    <div>
      <div className="my-4">
        <b level={4}>{"Add Variables"}:</b>
        <MultiSelect
          codesData={codesData}
          multiSelectValues={multiSelectValues}
          setMultiSelectValues={setMultiSelectValues}
        />
      </div>
      {existingValueError && (
        <>
          <Space style={{ marginBottom: "0.5rem" }}>
            <Alert
              style={{}}
              message={`variable already exists`}
              type="error"
              showIcon
            />
          </Space>
          <br />
        </>
      )}
      {Object.keys(otherVariables).length > 0 && (
        <div className="my-5">
          <b level={3}>{"List of Variables"}:</b>
          {Object.keys(otherVariables).map((field, index) => {
            return (
              <Row
                key={index}
                align="middle"
                className="mb-3"
                style={{ marginTop: 10 }}
              >
                <Col>
                  <b className="pr-2">{field}:</b>
                </Col>
                <div className="row">
                  <Col className="d-flex mt-1 flex-wrap">
                    {otherVariables[field].map((tag) => (
                      <Chip
                        key={tag}
                        field={field}
                        item={tag}
                        onRemove={onChipRemove}
                      />
                    ))}
                    {inputVisible[field] ? (
                      <Input
                        ref={chipInputRef[field][0]}
                        type="text"
                        size="small"
                        className="tag-input"
                        value={inputValue[field]}
                        onChange={(e) =>
                          onChipInputChange(field, e.target.value)
                        }
                        onBlur={() => onChipInputSubmit(field)}
                        onPressEnter={() => onChipInputSubmit(field)}
                      />
                    ) : (
                      <Tag
                        className="site-tag-plus d-flex align-items-center"
                        onClick={() => onChipInputToggleVisb(field, true)}
                      >
                        <PlusOutlined className="me-1" /> Add Value
                      </Tag>
                    )}
                  </Col>
                </div>
              </Row>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default OtherVariables;
