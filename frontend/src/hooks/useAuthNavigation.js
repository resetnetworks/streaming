import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"


const useNavigation = () =>{
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const navigateToHome = () => {
        if(isAuthenticated){
            navigate("/home");
        }
        else{
            navigate("/");
        }
    };

    return {navigateToHome , isAuthenticated};
}

export default useNavigation;