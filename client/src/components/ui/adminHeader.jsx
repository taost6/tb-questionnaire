import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import { Button } from "@mui/material";

const AdminHeader = () => {
    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.removeItem("tbq-adminInfo");
        localStorage.removeItem("tbq-authToken");
        navigate("/login");
    };

    return (
        <div className="relative">
            <div className="absolute top-0 right-0 z-10">
                <Button
                    onClick={handleSignOut}
                    startIcon={<LogoutIcon />}
                    className="bg-red-500 text-white py-2 px-4 rounded"
                >
                    サインアウト
                </Button>
            </div>
            <h1 className="text-2xl font-bold mb-4">
                管理者ダッシュボード / Admin Dashboard
            </h1>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-blue-600 h-2 rounded-full w-full" />
            </div>
        </div>
    );
};

export default AdminHeader;