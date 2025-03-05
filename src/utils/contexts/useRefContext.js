import { useContext } from "react";
import AuthContext from "./RefContext";

const useAuth = () => {
    return useContext(AuthContext);
}

export default useAuth;