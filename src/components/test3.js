import { Alert, Button, Col, Input, Row, Space, Tag } from 'antd';
import React, { useState, createRef } from 'react'
import { PlusOutlined } from '@ant-design/icons'

const OtherVariables = () => {
  const [otherVariables, setOtherVariables] = useState({});
  const [chipInputRef, setChipInputRef] = useState({});
  const [variableName, setVariableName] = useState('')

  const handleAddVariable = () => {
    setOtherVariables((prevValues) => {
      return { ...prevValues, [variableName]: [] };
    });
    setChipInputRef((prevRefs) => {
      return { ...prevRefs, [variableName]: [createRef()] };
    });
    setVariableName('')
  }
  const handleAddValue = (field) => {
    setOtherVariables((prevValues) => {
      const newValues = [...prevValues[field], ""];
      return { ...prevValues, [field]: newValues };
    });
    setChipInputRef((prevRefs) => {
      const newRefs = [...prevRefs[field], createRef()];
      return { ...prevRefs, [field]: newRefs };
    });
    setTimeout(() => {
      const inputRef = chipInputRef[field][chipInputRef[field].length - 1];
      if (inputRef && inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };
  const onChipInputChange = (field, index, newVal) => {
    // console.log(field, newVal, index, 'coming')
    setOtherVariables((prevValues) => {
      const newValues = [...prevValues[field]];
      newValues[index] = newVal;
      return { ...prevValues, [field]: newValues };
    });
  };
  return (
    <div>
      <div className='mb-7'>
        <b level={4} className="mb-3" >
          {"Add Variables"}:
        </b><br />
        <Input style={{ width: '35%' }} placeholder="Variable Name" onChange={(e) => setVariableName(e.target.value)} />&nbsp;
        <Button
          style={{ height: "35px", width: '6%', borderRadius: '0.5rem' }}
          onClick={handleAddVariable}
        >Add</Button>
      </div>
      {Object.keys(otherVariables).length > 0 && (
        <div className="mb-7">
          <b level={3}>
            {"List of Variables"}:
          </b>
          {Object.keys(otherVariables).map((field) => {
            return (
              <Row key={field} align="middle" className="mb-3" style={{ marginTop: 10 }}>
                <Col>
                  <b className="pr-2">{field}:</b>
                </Col>
                <Col flex="1">
                  <Row>
                    {otherVariables[field].map((value, index) => (
                      <div key={index}>
                        <Input
                          ref={chipInputRef[field][index]}
                          type="text"
                          size="small"
                          className="tag-input"
                          value={value}
                          onChange={(e) => onChipInputChange(field, index, e.target.value)}
                        />
                      </div>
                    ))}

                    <Tag className="site-tag-plus" onClick={() => handleAddValue(field)}>
                      <PlusOutlined /> Add Value
                    </Tag>
                  </Row>
                </Col>
              </Row>
            );
          })}

        </div>
      )}
    </div>
  )
}
export default OtherVariables;