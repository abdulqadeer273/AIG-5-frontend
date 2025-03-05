import React from 'react'
import Modal from 'react-bootstrap/Modal';
const DeleteModal = ({
    showModel, setShowModel, itemType, itemName, itemId, deleteFunction
}) => {
    const handleClose = () => {
        setShowModel(false)
    };
    return (
        <>
            <Modal show={showModel} onHide={handleClose}
                size="md"
                aria-labelledby="example-modal-sizes-title-lg" className="ps-0"
                >
                <Modal.Body>
                    <h3>Delete {itemType}</h3>
                    <p>Are you sure you want to delete <strong>{itemName}</strong>?</p>
                    <p>This action cannot be undone.</p>
                    <button className="btn btn-danger form-control" style={{backgroundColor:'#dc3545'}} type="button" onClick={()=>deleteFunction(itemId)}>Delete</button>
                 </Modal.Body>
            </Modal>
        </>
    )
}
export default DeleteModal;