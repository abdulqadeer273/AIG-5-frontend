import { Select, Typography } from 'antd';
import { useEffect, useState } from 'react';
const { Title } = Typography;
const MultiSelect = ({ codesData, setMultiSelectValues, multiSelectValues }) => {
    const handleChange = (value) => {
        // console.log(`selected ${value}`);
        let str = value.toString(); // get string representation of the object
        if (str !== "") {
            let values = str.split(",");
            setMultiSelectValues(values)
        }else{
            setMultiSelectValues([])
        }
        
    };
    return (
        <>
            <Select
                mode="multiple"
                style={{
                    width: '100%',
                    marginTop: "1rem"
                }}
                placeholder="Please select"
                value={multiSelectValues}
                onChange={handleChange}
                options={codesData}
            />
        </>
    )
};
export default MultiSelect;