import React, { useState, createRef } from "react";

function VariableValueInputs() {
    const [variableValues, setVariableValues] = useState({});
    const [inputRefs, setInputRefs] = useState({});

    const handleAddVariable = () => {
        const newVariableName = prompt("Enter a variable name:");
        if (newVariableName !== null) {
            setVariableValues((prevValues) => {
                return { ...prevValues, [newVariableName]: [] };
            });
            setInputRefs((prevRefs) => {
                return { ...prevRefs, [newVariableName]: [createRef()] };
            });
        }
    };

    const handleAddValue = (variableName) => {
        setVariableValues((prevValues) => {
            const newValues = [...prevValues[variableName], ""];
            return { ...prevValues, [variableName]: newValues };
        });
        setInputRefs((prevRefs) => {
            const newRefs = [...prevRefs[variableName], createRef()];
            return { ...prevRefs, [variableName]: newRefs };
        });
        setTimeout(() => {
            const inputRef = inputRefs[variableName][inputRefs[variableName].length - 1];
            if (inputRef && inputRef.current) {
                inputRef.current.focus();
            }
        }, 0);
    };

    const handleValueChange = (variableName, index, value) => {
        setVariableValues((prevValues) => {
            const newValues = [...prevValues[variableName]];
            newValues[index] = value;
            return { ...prevValues, [variableName]: newValues };
        });
    };

    return (
        <div>
            <button onClick={handleAddVariable}>Add Variable</button>
            {Object.keys(variableValues).map((variableName) => {
                return (
                    <div key={variableName}>
                        <label>{variableName}</label>
                        {variableValues[variableName].map((value, index) => {
                            return (
                                <div key={index}>
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(event) =>
                                            handleValueChange(variableName, index, event.target.value)
                                        }
                                        ref={inputRefs[variableName][index]}
                                    />
                                </div>
                            );
                        })}
                        <button
                            onClick={() => {
                                handleAddValue(variableName);
                            }}
                        >
                            Add Value
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
export default VariableValueInputs;