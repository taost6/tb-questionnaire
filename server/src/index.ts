import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { insertQuery, getQuery } from "./db";
import { getCurrentDate, getCurrentDateTime } from "./helper";
import { QueryResult, RowDataPacket } from "mysql2";

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

  const rows = await getQuery("messages", `session_id = '${sessionId}'`, [{ field: "timestamp", dir: "ASC" }]);
  if (!rows) res.status(500).json({ error: "Failed to get messages." });
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

  console.log(message);
  const now = getCurrentDateTime();
  const insertResult = await insertQuery("messages", ["session_id", "role", "content", "timestamp"], [sessionId, message.role, message.content, now]);
  if (!insertResult) {
    res.status(500).json({ error: "Failed to insert message." });
    return;
  }

  const getResult = await getQuery("messages");

  if (getResult.length === 0) {
    res.status(500).json({ error: "Failed to get messages." });
    return;
  }
  console.log("getResult:", getResult);

  try {
    const chat = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-0528:free",
      stream: false,
      messages: [
        {
          role: "system",
          content: `
あなたは日本の自治体に所属する保健師です。
これから私は、感染症に罹患した可能性がある人物として振る舞うので、 私の直近1週間の行動について質問し、感染リスクがあると考えられる行動履歴や、濃厚接触者に関する情報を引き出してください。
具体的には、今日から過去に遡るように1日ずつ、いつどこで誰と何をしたか等の質問を行い、日時・場所・マスク着用の有無、濃厚接触者のどれかが欠けている場合には、欠損情報を聞いてください。ただし、「今日」として具体的な日付は指定せず、以降は相手の会話に合わせて日付を調整する。
それ以外にも、飛沫感染の可能性のある状況があるか聞き、あれば情報を収集してください。
一通りの質問が終わったら、私に終了を伝え、時系列で結果を出力し、感染リスクに関する分析を行ってください。
ただし注意点として、次の3点を守ってください。
・対話は日本語で行う
・短く丁寧な言葉を使う
・相手の立場に寄り添う姿勢で聞く
・質問は1つずつ順番に行う
それでは準備ができましたら、質問を開始してください。
        `,
        },
        ...getResult.map((row) => ({ role: row.role, content: row.content })),
      ],
    });

    console.log("ChatGPT Result:", chat.choices);

    const replyMessage = chat.choices[0].message;
    const replyContent = replyMessage.content;
    const replyTime = getCurrentDateTime();

    const insertReply = await insertQuery(
      "messages",
      ["session_id", "role", "content", "timestamp"],
      [sessionId, replyMessage.role, replyMessage.content, replyTime]
    );

    if (!insertReply) {
      res.status(500).json({ error: "Failed to insert reply message." });
      return;
    }

    res.json({ reply: replyContent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate response." });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
