import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./components/ui/adminHeader";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { sendRequest } from "@/apis";
import InfoModal from "./components/ui/infoModal";

const TbAdminWizard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [searchFilters, setSearchFilters] = useState({
        name: "",
        email: "",
        phone: "",
        sex: "",
        birthDate: "",
        updated_at: "",
    });
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const adminInfo = localStorage.getItem("tbq-adminInfo");
        if (!adminInfo) {
            navigate("/login");
        } else {
            fetchUsers();
        }
    }, [navigate]);

    const fetchUsers = async () => {
        const token = localStorage.getItem("tbq-authToken");
        if (!token) {
            navigate("/login");
            return;
        }

        const response = await sendRequest({}, "GET", "users", {
            Authorization: `Bearer ${token}`,
        });

        if (response && response.data) {
            setUsers(response.data);
        } else {
            if (response && response.errorType === "auth") {
                navigate("/login");
                return;
            }
            alert("ユーザー情報の取得に失敗しました");
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (field, value) => {
        setSearchFilters((prevFilters) => ({
            ...prevFilters,
            [field]: value,
        }));
    };

    const handleRowClick = (user) => {
        setSelectedUser(user);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
    };


    const filteredUsers = users.filter((user) => {
        return (
            (!searchFilters.name || user.name.includes(searchFilters.name)) &&
            (!searchFilters.email || user.email.includes(searchFilters.email)) &&
            (!searchFilters.phone || user.phone.includes(searchFilters.phone)) &&
            (!searchFilters.sex || user.sex.includes(searchFilters.sex)) &&
            (!searchFilters.birthDate ||
                new Date(user.birthDate)
                    .toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    })
                    .includes(searchFilters.birthDate)) &&
            (!searchFilters.updated_at ||
                new Date(user.updated_at)
                    .toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    .includes(searchFilters.updated_at))
        );
    });

    return (
        <div className="flex flex-col w-screen mx-auto p-4 h-screen">
            <AdminHeader />
            <motion.div
                className="flex flex-col flex-1 overflow-hidden"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
            >
                <TableContainer component={Paper}>
                    <Table className="border border-gray-300 rounded-md">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <input
                                        type="text"
                                        placeholder="名前検索"
                                        value={searchFilters.name}
                                        onChange={(e) => handleSearchChange("name", e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </TableCell>
                                <TableCell>
                                    <input
                                        type="text"
                                        placeholder="メール検索"
                                        value={searchFilters.email}
                                        onChange={(e) => handleSearchChange("email", e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </TableCell>
                                <TableCell>
                                    <input
                                        type="text"
                                        placeholder="電話検索"
                                        value={searchFilters.phone}
                                        onChange={(e) => handleSearchChange("phone", e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </TableCell>
                                <TableCell>
                                    <select
                                        value={searchFilters.sex}
                                        onChange={(e) => handleSearchChange("sex", e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    >
                                        <option value="">性別選択</option>
                                        <option value="male">男性</option>
                                        <option value="female">女性</option>
                                        <option value="other">その他</option>
                                    </select>
                                </TableCell>
                                <TableCell>
                                    <input
                                        type="text"
                                        placeholder="誕生日検索"
                                        value={searchFilters.birthDate}
                                        onChange={(e) => handleSearchChange("birthDate", e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </TableCell>
                                <TableCell>
                                    <input
                                        type="text"
                                        placeholder="更新日検索"
                                        value={searchFilters.updated_at}
                                        onChange={(e) => handleSearchChange("updated_at", e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>名前</TableCell>
                                <TableCell>メールアドレス</TableCell>
                                <TableCell>電話番号</TableCell>
                                <TableCell>性別</TableCell>
                                <TableCell>誕生日</TableCell>
                                <TableCell>更新日</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((user) => (
                                    <TableRow key={user.id} onClick={() => handleRowClick(user)} className="cursor-pointer hover:bg-gray-100">
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.phone}</TableCell>
                                        <TableCell>
                                            {user.sex === "male" ? "男性" : user.sex === "female" ? "女性" : "その他"}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.birthDate).toLocaleDateString("ja-JP", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.updated_at).toLocaleString("ja-JP", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={users.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        className="border-x border-gray-300"
                        labelRowsPerPage="行数:"
                        labelDisplayedRows={({ from, to, count }) =>
                            `${from}〜${to} / ${count !== -1 ? count : `以上`}`
                        }
                    />
                </TableContainer>
                {selectedUser && <InfoModal selectedUser={selectedUser} handleCloseModal={handleCloseModal} />}
            </motion.div>
        </div>
    );
};

export default TbAdminWizard;