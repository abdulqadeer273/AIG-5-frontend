import { CloseCircleFilled } from '@ant-design/icons'
import { Col, Row, Input } from 'antd';
import { useEffect } from 'react';
const CorrectOptionSection = ({
    value,
    index,
    category,
    onRemove,
    onSaveRef,
    onInputChange,
    onInputSubmit,
    categoriesFields,
    genderSelect,
    onLoad,
    imported,
    correctMultipleOptionsInputRef,
}) => {
    const { TextArea } = Input
    const handleClose = () => {
        onRemove(category, index);
    };
    const inputChange = (e) => {
        // e.preventDefault();
        onInputChange(category, index, e);
    };
    const inputSubmit = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            onInputSubmit(index, category);
        }
    };
    useEffect(() => {
        if (!value?.title && !imported) {
            onLoad(category, index, '', "title");
            onLoad(category, index, genderSelect?.includes("both") ? "both" : genderSelect[0], "gender");
            onLoad(category, index, true, "isCorrect");
        } else {
            onLoad(category, index, value?.gender ?? "", "gender");
            onLoad(category, index, true, "isCorrect");
        }
    }, [value?.title]);
    return (
        <Row gutter={8} className="my-2 d-flex align-items-center">
            <Col flex="2">
                <label className='mb-1'>Option</label>
                <TextArea
                    ref={correctMultipleOptionsInputRef[category][index]}
                    autoSize={{ minRows: 1, maxRows: 6 }}
                    value={value?.title}
                    name={"title"}
                    placeholder={`Option ${index + 1}`}
                    onChange={inputChange}
                    // onPressEnter={inputSubmit}
                    onKeyPress={inputSubmit}
                    style={{ height: "33.95px" }}
                />
            </Col>
            {genderSelect.length > 0 &&
                <Col flex="1">
                    <label>Gender</label>
                    <select
                        className="categoryOptions"
                        name="gender"
                        value={value?.gender}
                        onChange={inputChange}
                        style={{ height: "33.95px", marginTop: "4px" }}
                        defaultValue={genderSelect?.includes("both") ? "both" : genderSelect[0]}
                    >
                        {genderSelect.map((item, i) => {
                            return (
                                <option key={i} value={item}>
                                    {item}
                                </option>
                            );
                        })}
                    </select>
                </Col>
            }
            <CloseCircleFilled
                className="dynamic-delete-button d-flex align-items-center justify-content-center"
                style={{ marginTop: '21px' }}
                onClick={handleClose}
            />
        </Row>
    );
};
export default CorrectOptionSection;