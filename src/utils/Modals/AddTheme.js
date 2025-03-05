import React, { useState } from 'react';
import { Modal, Input, } from 'antd';
import axios from "../../api/axios"
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const AddTheme = ({ refresh, setRefresh, showModal, setShowModal }) => {
    const [theme, setTheme] = useState('');
    const [error, setError] = useState(false)
    const HandleClick = () => {
        setError(false)
        axios.post("add_theme/", { theme: theme }
        ).then(res => {
            if (res.data?.status === 200) {
                setShowModal(!showModal)
                setRefresh(!refresh)
            }
            else if (res.data?.status === 400) {
                setError(true)
            }

        }).catch(err => {
            setShowModal(!showModal)
        })
    }
    return (
        <>

            <Modal
                open={showModal}
                onOk={HandleClick}
                okText={'Add Theme'}
                onCancel={() => { setShowModal(false); setTheme("") }}
                okButtonProps={
                    { disabled: !theme }
                }
            >
                <label htmlFor="inputCategory4" className="form-label"><strong>Theme Name:</strong></label>

                <Input
                    type="text"
                    className="form-control form_clr"
                    id="inputCategoryl4"
                    value={theme}
                    name={theme}
                    onChange={(e) => setTheme(e.target.value)} /><br />
                {error &&
                    <p id="uidnote" style={{ color: "#ed4545" }} className=''>
                        <FontAwesomeIcon icon={faInfoCircle} style={{ color: "#ed4545" }} />
                        &nbsp;theme already exists
                    </p>}
            </Modal>
        </>
    );
}
export default AddTheme;