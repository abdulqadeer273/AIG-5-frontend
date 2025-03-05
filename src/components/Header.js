import { Typography } from "antd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import image1 from "./images/6.png"
import image2 from "./images/logo-print-hd-transparent-white.png"
const { Title } = Typography;
const Header = ({ name }) => (
    <header className="text-center d-lg-flex align-items-center justify-content-center mb-lg-4 mb-md-4 mb-5" id="header-img">
        {/* <div style={{ height: "300px", width: "100%" }}>

        </div> */}
        <div style={{ marginRight: "auto", }}>
            <img
                src={image2}
                alt=""
                width="250px"
                height="auto"
            />
            <p style={{color:"white"}}>The future of question writing in medicine</p>
            <div className="d-flex justify-content-center" >
                <FontAwesomeIcon icon={faEnvelope} color="#fff" className="pe-2 pt-1" />
                <p style={{color:"white"}}>issamfrancis@gmail.com</p>
            </div>
        </div>
        <div className="mt-lg-0 mt-md-4 mt-4">
            <Title id="title" style={{ color: "#fff" , borderBottom:"none" ,padding:0 }}>{name}</Title>
            <p style={{ color: "#fff" }}>
                Dr. Issam Francis M.D. FRCPath © {new Date().getFullYear()} All Rights
                Reserved
            </p>
        </div>
        <img
            src={image1}
            alt=""
            width="250px"
            height="auto"
            style={{ marginLeft: "auto" }}
            className="d-lg-block d-none"
        />
    </header>
);
export default Header;
