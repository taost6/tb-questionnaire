import "dotenv/config";
import { RowDataPacket } from "mysql2";
import OpenAI from "openai";
import { getCurrentDate, getCurrentDateTime, getUserInfoMsg } from "./helper";
import { insertQuery, getQuery } from "./db";
import { getLangInEng, getWordInLang } from "./helper";

const API_KEY = process.env.OPENAI_API_KEY;
// const API_KEY = process.env.OPENROUTER_API_KEY;
// const API_KEY = process.env.DEEPSEEK_API_KEY;
// const API_KEY = process.env.OPENAI_API_KEY;

// const openai = new OpenAI({
//     apiKey: API_KEY,
//     baseURL: "https://api.openai.com",
//     defaultHeaders: {
//         "HTTP-Referer": "http://localhost",
//         "X-Title": "TB-Questionnaire",
//     },
// });

const openai = new OpenAI({
    apiKey: API_KEY,
});

export const getChat = async (sessionId: string): Promise<{ error: boolean; res?: string | null, role?: string | null }> => {
    const user = await getQuery("users", `id = '${sessionId}'`);
    if (!user || user.length === 0) {
        return { error: true };
    }
    const userJSON = JSON.parse(user[0].content);
    const userData = getUserInfoMsg(userJSON);
    const history = await getQuery("messages", `session_id = '${sessionId}'`, [{ field: "timestamp", dir: "ASC" }]);
    const lang = getLangInEng(userJSON.language);
    const systemRole: string = `
You are **Public Health Nurse “Sato”**, working for a local government in Japan.  
Your task: **Conduct a past 7-day epidemiological interview** to collect the user’s **daily behaviors and close contacts** starting from **today** and moving **backward one day at a time**.  
The goal: Identify any **activities or close contacts** that may pose a risk of infection.

The user’s basic information (name, gender, age, address, symptom onset date) is already collected.

---

### RULES FOR ASKING QUESTIONS
1. **Ask only ONE question at a time.**  
   Never include two questions in the same message.
2. **Move day-by-day** starting from **today** → yesterday → day before yesterday, etc., until 7 days are covered.
3. **Fixed option answers** must be in this format, **in ${lang}**:
   - Example: \`{{ ${getWordInLang(lang, "Yes")} }}\` \`{{ ${getWordInLang(lang, "No")} }}\` \`{{ ${getWordInLang(lang, "Not sure")} }}\`
   - Example: \`{{ ${getWordInLang(lang, "Family")} }}\` \`{{ ${getWordInLang(lang, "Friend")} }}\` \`{{ ${getWordInLang(lang, "Coworker")} }}\`
   - Example: \`{{ ${getWordInLang(lang, "School")} }}\` \`{{ ${getWordInLang(lang, "Shop")} }}\` \`{{ ${getWordInLang(lang, "Restaurant")} }}\`
4. If **only one option can be chosen**, append \`{{ Single }}\` at the end of the options.  
   - Example: \`{{ ${getWordInLang(lang, "Yes")} }}\` \`{{ ${getWordInLang(lang, "No")} }}\` \`{{ Single }}\`
5. If **multiple options are possible**, do **not** use \`{{ Single }}\`.
6. If the question needs explanation, give the **context first**, then ask.
7. **Tone:** Be polite, empathetic, and easy to understand in ${lang}.
8. **First message:** Introduce yourself as *Public Health Nurse Sato* and greet the user by name.  
9. **From the second question onward:** Do not repeat the user’s name unless needed.

---

### AFTER INTERVIEW COMPLETION
When either:
- All **7 days** have been covered, OR  
- The user ends early:

Do this in order:
1. Inform the user that the interview is complete.  
2. Summarize collected information **in chronological order** (today → 7 days ago).  
3. Give a **brief infection risk analysis** in **${lang}**.  
4. Give a **summarize collected information in chronological order** and a **brief infection risk analysis** in **Japanese** (for admin).  
5. End with \`{{ Final }}\`.

---

**NOTES**
- Ask about: symptoms, close contacts, and places visited.
- Never repeat already answered questions.
- Keep day-by-day progression strict.
- Keep messages short and focused on the current day’s activity.

---

**Basic Information:**  
${userData}  

---

**Please now begin with the first question.**

    `;

    try {
        const chat = await openai.chat.completions.create({
            // model: "deepseek/deepseek-r1-0528:free",
            // model: "deepseek/deepseek-chat-v3-0324:free",
            model: "gpt-4.1-mini",
            // model: "gpt-4o-mini",
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