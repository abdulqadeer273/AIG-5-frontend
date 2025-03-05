import { Modal, Input, } from 'antd';
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const EditThemeName = ({  showModal, setShowModal, themeName, setThemeName, handleEditTheme, error }) => {
    return (
        <>

            <Modal
                open={showModal}
                onOk={()=>handleEditTheme()}
                okText={'Save'}
                onCancel={() => { setShowModal(false); setThemeName("") }}
                okButtonProps={
                    { disabled: !themeName }
                }
            >
                <label htmlFor="inputCategory4" className="form-label"><strong>Theme Name:</strong></label>

                <Input
                    type="text"
                    className="form-control form_clr"
                    id="inputCategoryl4"
                    value={themeName}
                    name={themeName}
                    onChange={(e) => setThemeName(e.target.value)} /><br />
                {error &&
                    <p id="uidnote" style={{ color: "#ed4545" }} className=''>
                        <FontAwesomeIcon icon={faInfoCircle} style={{ color: "#ed4545" }} />
                        &nbsp;theme already exists
                    </p>}
            </Modal>
        </>
    );
}
export default EditThemeName;