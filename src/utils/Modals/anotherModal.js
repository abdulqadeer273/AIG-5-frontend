
import { Modal } from 'antd';
import React from 'react';

const App = ({ showModel, setShowModel, itemType, itemName, itemId, deleteFunction }) => {

    return (
        <>
            <Modal
                open={showModel}
                onOk={deleteFunction}
                okText={'Delete'}
                onCancel={() => setShowModel(false)}
                okButtonProps={
                    {
                        danger:true,
                    }
                    
                }
            >
                <h3>Delete {itemType}</h3>
                <p>Are you sure you want to delete <strong>{itemName}</strong>?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </>
    );
};

export default App;