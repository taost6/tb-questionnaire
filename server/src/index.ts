import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertQuery, getQuery } from "./db";
import { getCurrentDate, getCurrentDateTime, getUserInfoMsg } from "./helper";
import { getChat } from "./gptHelper";
import { symptomCondition } from "./consts/symptomCondition";

const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET || "tbq-pass2025";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/messages/:sessionId", async (req, res) => {
    const { sessionId } = req.params;

    console.log("getSessionId:", sessionId);

    if (!sessionId) {
        res.status(400).json({ error: "Missing sessionId" });
    }

    let rows = await getQuery("messages", `session_id = '${sessionId}'`, [{ field: "timestamp", dir: "ASC" }]);
    if (!rows) res.status(500).json({ error: "Failed to get messages." });
    if (rows.length === 0) {
        const chat = await getChat(sessionId);

        if (chat.error || !chat.res || !chat.role) {
            res.status(500).json({ error: "Failed to generate response." });
            return;
        }

        const replyTime = getCurrentDateTime();
        const insertReply = await insertQuery(
            "messages",
            ["session_id", "role", "content", "timestamp"],
            [sessionId, chat.role, chat.res, replyTime]
        );

        if (!insertReply) {
            res.status(500).json({ error: "Failed to insert reply message." });
            return;
        }
        rows = await getQuery("messages", `session_id = '${sessionId}'`, [{ field: "timestamp", dir: "ASC" }]);
        if (!rows) res.status(500).json({ error: "Failed to get messages." });
    }
    res.json(rows);
});

app.post("/api/user", async (req, res) => {
    const today = getCurrentDate();
    const { data } = req.body;
    console.log(data);
    const insertResult = await insertQuery(
        "users",
        ["email", "name", "furiganaName", "sex", "birthDate", "phone", "content"],
        [data.email ?? "", data.name ?? "", data.furiganaName ?? "", data.sex ?? "", data.birthDate ?? today, data.phone ?? "", JSON.stringify(data)]
    );
    if (!insertResult) {
        res.status(500).json({ error: "Failed to insert user." });
        return;
    }
    res.json({ success: true, insertId: (insertResult as any).insertId });
});

app.post("/api/chat", async (req, res) => {
    const { message, sessionId } = req.body;

    if (!sessionId || !message) {
        res.status(400).json({ error: "Failed to insert message" });
        return;
    }

    const now = getCurrentDateTime();
    const insertResult = await insertQuery(
        "messages",
        ["session_id", "role", "content", "timestamp"],
        [sessionId, message.role, message.content, now]
    );
    if (!insertResult) {
        res.status(500).json({ error: "Failed to insert message." });
        return;
    }

    const chat = await getChat(sessionId);

    if (chat.error || !chat.res) {
        res.status(500).json({ error: "Failed to generate response." });
        return;
    }

    const replyTime = getCurrentDateTime();
    const insertReply = await insertQuery(
        "messages",
        ["session_id", "role", "content", "timestamp"],
        [sessionId, chat.role, chat.res, replyTime]
    );

    if (!insertReply) {
        res.status(500).json({ error: "Failed to insert reply message." });
        return;
    }

    res.json({ reply: chat.res });
});

app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "メールアドレスとパスワードを入力してください" });
        return;
    }

    const admin = await getQuery("admins", `email = '${email}'`);
    if (!admin || admin.length === 0) {
        res.status(401).json({ error: "メールアドレスまたはパスワードが正しくありません" });
        return;
    }
    const isPasswordValid = await bcrypt.compare(password, admin[0].password);
    if (!isPasswordValid) {
        res.status(401).json({ error: "メールアドレスまたはパスワードが正しくありません" });
        return;
    }

    const token = jwt.sign({ id: admin[0].id, email: admin[0].email }, JWT_SECRET, { expiresIn: "12h" });
    res.json({ success: true, message: "サインイン成功", token, name: admin[0].name });
});

app.get("/api/users", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized access" });
        return;
    }

    const token = authHeader.split(" ")[1];
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        res.status(401).json({ error: "Invalid token", errorType: "auth" });
        return;
    }

    const rows = await getQuery("users");
    if (!rows) {
        res.status(500).json({ error: "Failed to fetch users" });
        return;
    }

    const users = await Promise.all(rows.map(async (row) => {
        const content = row.content ? JSON.parse(row.content) : {};
        const messages = await getQuery("messages", `session_id = '${row.id}'`, [{ field: "timestamp", dir: "ASC" }]);
        let finalMessage = null;
        if (messages && messages.length > 0) {
            const found = messages.find(msg => msg.content && msg.content.includes("{{ Final }}"));
            if (found) {
                finalMessage = found.content.replace("{{ Final }}", "").trim();
            }
        }

        let isPatient = false;
        if (symptomCondition(content)) isPatient = true;

        return {
            ...row,
            content,
            isPatient,
            finalMessage
        }
    }));

    res.json({ success: true, data: users });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
