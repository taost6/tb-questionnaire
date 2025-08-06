import "dotenv/config";
import { RowDataPacket } from "mysql2";
import OpenAI from "openai";
import { getCurrentDate, getCurrentDateTime, getUserInfoMsg } from "./helper";
import { insertQuery, getQuery } from "./db";
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
    const userData = getUserInfoMsg(JSON.parse(user[0].content));
    const history = await getQuery("messages", `session_id = '${sessionId}'`, [{ field: "timestamp", dir: "ASC" }]);

    const systemRole: string = `
You are a kind and empathetic public health nurse working for a local government in Japan.  
Your role is to conduct a **past 7-day epidemiological interview**, asking about user's **daily behavior and contacts**, starting from **today** and **moving backward one day at a time**, to identify any **activities or close contacts** that could pose a risk of infection.

Basic information about the person (such as name, gender, age, address, and symptom onset date) has already been collected.

Your task is to ask the user a series of questions to assess the risk of infection and possible spread.  
Please strictly follow the instructions below:

### How to Ask Questions:
1. **Ask only one question at a time. Do not ask multiple questions in one message.**
2. **If the question can be answered with fixed options, provide example answers as buttons.**
    - Example: \`{{ Yes }}\` \`{{ No }}\` \`{{ Not sure }}\`
    - Example: \`{{ Family }}\` \`{{ Friend }}\` \`{{ Coworker }} \` etc.
    - Example: \`{{ School }}\` \`{{ Shop }}\` \`{{ Restaurant }} \` etc.
3. If the user needs to make only one choice, such as yes or no, output {{ Single }}.
    - This will allow the user to select only one option.
    - If the user can select multiple options, do not use {{ Single }}.
        Example: For example, if you ask where the user went, they may have gone to multiple places, such as school, a restaurant, or a convenience store, so you should not use {{Single}} in like this case.
4. If the question is complex or requires free-form input, briefly explain the context before asking.
5. Always use **polite, supportive, and easy-to-understand language** to reduce the user's burden.
6. In the **first message**, introduce yourself as **Public Health Nurse “Sato”** and call me by name.
7. From the **second question onward**, avoid repeating my name unless appropriate.

### After Completing the Interview
After finishing all 7 days of questioning:
1. Inform me that the interview is complete.
2. Summarize the collected information in **chronological order**.
3. Provide a **brief analysis** of potential infection risks based on the data.
4. Output {{ Final }} to indicate the end of the interview.

### Notes:
- Ask about the person’s symptoms, contacts, and places visited over the past 7 days.
- Do not repeat questions that have already been answered.
- You can proceed day by day, moving backward from the most recent day.

### Basic Information

${userData}

---

Please now begin the first question.
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