import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { sendRequest } from "@/apis"; // Import sendRequest function
import { useNavigate } from "react-router-dom";

import Header from "./components/ui/header";

const TbAdminLoginWizard = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const passwordInputRef = useRef(null); // Create a ref for the password input

    useEffect(() => {
        localStorage.removeItem("tbq-adminInfo");
        localStorage.removeItem("tbq-authToken");
    }, [navigate]);

    const handleLogin = async () => {
        const response = await sendRequest({ email, password }, "POST", "admin/login",);

        if (!response) {
            alert("サインイン失敗");
        } else {
            alert("サインイン成功: " + response.message);
            localStorage.setItem("tbq-adminInfo", JSON.stringify({ email, name: response.name }));
            localStorage.setItem("tbq-authToken", response.token);
            navigate("/admin");
        }
    };

    return (
        <div className="flex flex-col max-w-3xl mx-auto p-4 h-screen">
            <Header />
            <motion.div
                className="flex flex-col flex-1 overflow-hidden"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
            >
                <Card className="bg-white shadow-md rounded-lg p-6">
                    <CardContent>
                        <h2 className="text-2xl font-bold mb-4">管理者サインイン</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                ユーザー名またはメールアドレス
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        passwordInputRef.current?.focus(); // Focus password input
                                    }
                                }}
                                className="w-full p-2 border border-gray-300 rounded"
                                placeholder="ユーザー名またはメールアドレスを入力してください"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">パスワード</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleLogin(); // Trigger login
                                    }
                                }}
                                ref={passwordInputRef} // Attach ref to password input
                                className="w-full p-2 border border-gray-300 rounded"
                                placeholder="パスワードを入力してください"
                            />
                        </div>
                        <button
                            onClick={handleLogin}
                            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                        >
                            サインイン
                        </button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default TbAdminLoginWizard;