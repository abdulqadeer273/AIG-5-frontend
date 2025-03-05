import { Input, Tag } from "antd";
import { PlusOutlined } from '@ant-design/icons'
import React, { useState, useCallback } from 'react';
const ChipInput = ({
    visible,
    value,
    field,
    onSaveRef,
    onToggleVisb,
    onInputChange,
    onInputSubmit,
}) => {
    const saveRef = (ref) => {
        onSaveRef(field, ref);
    };
    const showInput = () => {
        onToggleVisb(field, true);
    };
    const inputChange = (e) => {
        onInputChange(field, e.target.value);
    };
    const inputSubmit = () => {
        onInputSubmit(field);
    };
    return visible ? (
        <Input
            ref={saveRef}
            type="text"
            size="small"
            className="tag-input"
            value={value}
            onChange={inputChange}
            onBlur={inputSubmit}
            onPressEnter={inputSubmit}
        />
    ) : (
        <Tag className="site-tag-plus" onClick={showInput}>
            <PlusOutlined /> Add New
        </Tag>
    );
};
export default ChipInput;