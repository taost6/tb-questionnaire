import "dotenv/config";
import { RowDataPacket } from "mysql2";
import OpenAI from "openai";
import { getCurrentDate, getCurrentDateTime, getUserInfoMsg } from "./helper";
import { insertQuery, getQuery } from "./db";
const API_KEY = process.env.OPENROUTER_API_KEY;
// const API_KEY = process.env.DEEPSEEK_API_KEY;

const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    // baseURL: "https://api.deepseek.com",
    defaultHeaders: {
        "HTTP-Referer": "http://localhost",
        "X-Title": "TB-Questionnaire",
    },
});

export const getChat = async (sessionId: string): Promise<{ error: boolean; res?: string | null, role?: string | null }> => {
    const user = await getQuery("users", `id = '${sessionId}'`);
    if (!user || user.length === 0) {
        return { error: true };
    }
    const userData = getUserInfoMsg(JSON.parse(user[0].content));
    const history = await getQuery("messages", `session_id = '${sessionId}'`, [{ field: "timestamp", dir: "ASC" }]);

    const systemRole: string = `
あなたは、日本の自治体に所属する丁寧で思いやりのある保健師です。

これから私は、感染症に罹患した可能性のある人物として振る舞います。  
あなたは、私の直近1週間の行動について1日ずつ遡って質問し、感染リスクのある行動や濃厚接触者に関する情報を丁寧に聞き出してください。

## 質問の目的
感染の可能性がある行動履歴を明らかにし、必要な情報（日時・場所・誰といたか・マスクの有無・濃厚接触者の有無）を正確に収集することです。

## 質問方法・会話のルール
- 質問は「今日」から過去に1日ずつ遡ってください。ただし、具体的な日付は出さず、相手の返答に応じて柔軟に日付を調整してください。
- 相手が答えた内容に不足がある場合（例：日時がない、マスクの有無が不明など）は、不足部分を優しく補足で聞いてください。
- 飛沫感染の可能性のある状況（会食・カラオケ・満員電車など）があれば、追加で質問して情報を収集してください。
- 自分が保健師「佐藤」と自己紹介した後、最初の質問で患者の名前を呼ぶ。
- 2番目の質問からは、必要以上に患者の名前を呼ばないでください。
**最も重要なことは、一度に一つの質問だけをすることです。**

## 出力形式・トーン
- 対話はすべて**日本語**で行ってください。
- **短く丁寧な言葉**を使ってください。
- 相手に寄り添う優しい口調で接してください。
- 「はい」「いいえ」で答えられる質問には、必ず以下のような**選択肢形式**を使ってください：  
  \`{{はい}} {{いいえ}}\`
- 必要に応じて、\`{{はい}} {{いいえ}}\` 以外の**選択肢を追加しても構いません**（例：{{わからない}}、{{外出した}} {{外出していない}}など）。
- 選択肢は、必ず \`{{}}\` で囲み、1つの行に並べて出力してください。

## 終了後の処理
すべての質問が終わったら、終了の旨を伝えた上で、  
収集した情報を**時系列順に整理**し、感染リスクに関する簡単な分析を行ってください。

---

# 私の基本情報

${userData}

---

それでは準備ができましたら、質問を始めてください。
    `;

    try {
        const chat = await openai.chat.completions.create({
            // model: "deepseek/deepseek-r1-0528:free",
            model: "deepseek/deepseek-chat-v3-0324:free",
            stream: false,
            messages: [
                {
                    role: "system",
                    content: systemRole,
                },
                ...history.map((row) => ({ role: row.role, content: row.content })),
            ],
        });

        console.log(chat);
        const replyMessage = chat.choices[0]?.message;
        return { error: false, res: replyMessage?.content, role: replyMessage?.role };
    } catch (error) {
        console.error(error);
        return { error: true };
    }
}