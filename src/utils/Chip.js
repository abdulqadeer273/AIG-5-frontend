import { Tag } from "antd";

const Chip = ({ item, field, onRemove }) => {
    const handleClose = () => {
        onRemove(field, item);
    };
    return (
        <Tag closable={true} onClose={handleClose} className="d-flex align-items-center mb-lg-0 mb-md-1 mb-1"> 
            <span>{item}</span>
        </Tag>
    );
};
export default Chip