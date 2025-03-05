import React from 'react'
import { Button } from "antd";
import { PlusOutlined } from '@ant-design/icons'
import OptionSection from '../utils/OptionSection';
const DistractCategoryOption = ({
  category,
  index,
  question,
  categoriesFields,
  answers,
  HEADING,
  onAnswerInputSaveRef,
  onAnswerRemove,
  onAnswersInputChange,
  onAnswersInputAdd,
  onAnswersLoad,
  genderSelect,
  answerInputRef,
}) => {
  return (
    <>
      {Object.keys(question).length > 0 && question[0] !== "" && (
        <div className="my-4">
          <form>
            <div className="my-4" key={category}>
              <b level={3} className="mb-3">
                {`${HEADING.optionSection}`}:
              </b>
              {genderSelect.length > 0 && <div><span className="note">Please add atleast <b><u>four</u></b> distractor options for male and <b><u>four</u></b> for female or use both</span></div>}
              {answers?.[category]?.map((el, index) => {
                return (
                  <OptionSection
                    answerInputRef={answerInputRef}
                    value={el}
                    key={index}
                    category={category}
                    index={index}
                    imported={false}
                    categoriesFields={categoriesFields}
                    onSaveRef={onAnswerInputSaveRef}
                    onRemove={onAnswerRemove}
                    onInputChange={onAnswersInputChange}
                    onInputSubmit={onAnswersInputAdd}
                    onLoad={onAnswersLoad}
                    genderSelect={genderSelect}
                  />
                );
              })}
              <Button
                className='d-flex align-items-center justify-content-center'
                type="dashed"
                onClick={() => onAnswersInputAdd(index, category)}
                style={{ width: "40%" }}
                icon={<PlusOutlined />}
              >
                Add option
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

export default DistractCategoryOption;