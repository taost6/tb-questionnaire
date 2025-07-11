import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { insertQuery, getQuery } from "./db";
import { getCurrentDate, getCurrentDateTime, getUserInfoMsg } from "./helper";
import { getChat } from "./gptHelper";

const PORT = process.env.PORT;
// const API_KEY = process.env.OPENAI_API_KEY;
const API_KEY = process.env.OPENROUTER_API_KEY;

const app = express();
app.use(cors());
app.use(express.json());

// const openai = new OpenAI({ apiKey: API_KEY });
const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "http://localhost",
        "X-Title": "TB-Questionnaire",
    },
});

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

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
