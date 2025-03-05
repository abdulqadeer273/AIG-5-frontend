import { Button } from "antd";
import CorrectOptionSection from "../utils/CorrectOptionSection";
import { PlusOutlined } from '@ant-design/icons'
const CorrectCategoryOption = ({
    category,
    index,
    question,
    categoriesFields,
    HEADING,
    correctMultipleOptions,
    onCorrectMultipleOptionsInputSaveRef,
    onCorrectMultipleOptionsRemove,
    onCorrectMultipleOptionsInputChange,
    onCorrectMultipleOptionsInputAdd,
    onCorrectMultipleOptionsLoad,
    genderSelect,
    correctMultipleOptionsInputRef,
}) => {
    return (
        <>
            {
                Object.keys(question).length > 0 && question[0] !== "" && (
                    <div className="my-4">
                        <form>
                            <div className="my-4" key={category}>
                                <b level={3} className="mb-3">
                                    {`${HEADING.Correct1}`}:
                                </b><div>
                                {genderSelect.length > 0 && <span className="note">Please add atleast <b><u>one</u></b> correct option for male and <b><u>one</u></b> for female or use both</span>}
                                </div>
                                {correctMultipleOptions?.[category]?.map((el, index) => {
                                    return (
                                        <CorrectOptionSection
                                            correctMultipleOptionsInputRef={correctMultipleOptionsInputRef}
                                            value={el}
                                            key={index}
                                            category={category}
                                            index={index}
                                            categoriesFields={categoriesFields}
                                            onSaveRef={onCorrectMultipleOptionsInputSaveRef}
                                            onRemove={onCorrectMultipleOptionsRemove}
                                            onInputChange={onCorrectMultipleOptionsInputChange}
                                            onInputSubmit={onCorrectMultipleOptionsInputAdd}
                                            onLoad={onCorrectMultipleOptionsLoad}
                                            //   selectedFeatures={selectedFeatures}
                                            genderSelect={genderSelect}
                                            imported={false}
                                        />
                                    );
                                })}
                                <Button
                                    className='d-flex align-items-center justify-content-center'
                                    type="dashed"
                                    onClick={() => onCorrectMultipleOptionsInputAdd(index, category)}
                                    style={{ width: "40%" }}
                                    icon={<PlusOutlined />}
                                >
                                    Add option
                                </Button>
                            </div>

                        </form>
                    </div>
                )
            }
        </>
    )
}

export default CorrectCategoryOption;