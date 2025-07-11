import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import sendRequest from "./apis";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

import avartar from "./assets/img/avatar.jpg";
import bgImage from "./assets/img/banner-background.webp";

const TbDialogueWizard = () => {
    const [msgs, setMsgs] = useState([]);
    const inputRef = useRef(null);
    const scrollRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(0);
    const [options, setOptions] = useState([]);

    useEffect(() => {
        const id = localStorage.getItem("tbq-sessionId");
        if (!id) {
            location.href = "#/questionnaire";
            return;
        }
        setSessionId(id);
        const fetchData = async () => {
            if (isLoading) return;
            setIsLoading(true);
            const savedMsgs = await sendRequest({}, "GET", `messages/${id}`);
            if (!savedMsgs) return;
            if (savedMsgs.length > 0) {
                const last = savedMsgs[savedMsgs.length - 1];
                const matches = [...last.content.matchAll(/{{(.*?)}}/g)].map(m => m[1]);
                setOptions(matches);
            }
            setMsgs([
                ...savedMsgs.map((row) => ({
                    content: row.content,
                    dir: row.role === "user" ? "right" : "left",
                    date: getFormattedDate(),
                    time: getCurrentTime(),
                })),
            ]);
            setIsLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({});
    }, [msgs]);

    const getFormattedDate = () => {
        const date = new Date();
        const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekday = weekdays[date.getDay()];
        return `${month}/${day}(${weekday})`;
    };

    const getCurrentTime = () => {
        const date = new Date();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    const sendMsg = async () => {
        const content = inputRef.current.innerText.trim();
        if (!content) return;
        if (isLoading) return;

        setMsgs((prev) => [
            ...prev,
            {
                dir: "right",
                content,
                date: getFormattedDate(),
                time: getCurrentTime(),
            },
        ]);

        setOptions([]);

        inputRef.current.innerText = "";

        setIsLoading(true);
        const res = await sendRequest(
            {
                sessionId: sessionId,
                message: {
                    role: "user",
                    content,
                },
            },
            "POST",
            "chat"
        );
        setIsLoading(false);
        if (!res) return;

        const reply = res.reply;

        const matches = [...reply.matchAll(/{{(.*?)}}/g)].map(m => m[1]);
        setOptions(matches);

        setMsgs((prev) => [...prev, { dir: "left", content: reply, date: getFormattedDate(), time: getCurrentTime() }]);
    }

    const handleKeyDown = async (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            await sendMsg();
        }
    };

    const msgRender = (msg, idx) => {
        const dir = msg.dir;
        const date = msg.date;
        const time = msg.time;
        const content = msg.content.replace(/{{.*?}}/g, '').replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
        const formatted = content.split("\n").map((str) => (str.trim())).join("\n");
        const res = formatted.replace(/\n{3,}/g, '\n\n').trim();

        return (<div key={idx} className={`flex items-end gap-2 ${dir === "right" ? "justify-end" : "justify-start"}`}>
            {dir === "left" && <img className="w-[30px] rounded-full" src={avartar} alt="avatar" />}

            {dir === "right" && (
                <div className="text-xs">
                    {date}
                    <br />
                    {time}
                </div>
            )}
            <div
                className={`max-w-[70%] ${dir === "left" ? "bg-gray-200" : "bg-green-200"
                    } rounded-tl-xl rounded-tr-xl ${dir === "left" ? "rounded-bl-sm rounded-br-xl" : "rounded-bl-xl rounded-br-sm"} shadow-md px-4 py-2 break-all whitespace-pre-line`}
                dangerouslySetInnerHTML={{
                    __html: res,
                }}
            />

            {dir === "left" && (
                <div className="text-xs">
                    {date}
                    <br />
                    {time}
                </div>
            )}
        </div>)
    }

    return (
        // <div style={{
        //     backgroundImage: `url(${bgImage})`,
        //     backgroundRepeat: `no-repeat`,
        //     backgroundSize: `cover`
        // }}>
        <div className="flex flex-col max-w-3xl mx-auto p-4 h-screen">
            <div>
                <h1 className="text-2xl font-bold mb-4">結核問診票 / Tuberculosis Questionnaire</h1>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-blue-600 h-2 rounded-full w-full" />
                </div>
            </div>

            <motion.div
                className="flex flex-col flex-1 overflow-hidden"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
            >
                <Card className="flex flex-col flex-1 shadow bg-gray-50">
                    <CardContent className="flex flex-col p-0 justify-between" style={{ height: "calc(100vh - 158px)" }}>
                        <div className="overflow-y-auto px-6 pt-6 space-y-4 pb-4">
                            {msgs.map(msgRender)}
                            <div ref={scrollRef} />
                        </div>
                        <div className="border-t p-4">
                            <div className="flex flex-wrap mb-2">
                                {
                                    options.map((option, idx) => (
                                        <button key={idx} className="border rounded-md px-4 py-2 bg-blue-500 hover:bg-blue-700 active:bg-blue-500 text-white" onClick={() => {
                                            let currentContent = inputRef.current.innerText.trim();
                                            if (currentContent != "") currentContent += ", ";
                                            inputRef.current.innerText = currentContent + option;
                                        }}>{option}</button>
                                    ))
                                }
                            </div>
                            <div className={`flex items-end ${isLoading ? "disabled" : ""}`}>
                                <div
                                    ref={inputRef}
                                    contentEditable
                                    onKeyDown={handleKeyDown}
                                    className="min-h-[2.5rem] max-h-40 overflow-y-auto w-full border rounded-md px-4 py-2 outline-none focus:outline-none"
                                    role="textbox"
                                    aria-multiline="true"
                                />
                                <button className="border rounded-md px-4 py-2 bg-blue-500 hover:bg-blue-700 active:bg-blue-500 text-white" onClick={async () => {
                                    sendMsg();
                                }}>
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="mt-4 text-right">
                <Button className="bg-blue-500 text-white">終了</Button>
            </div>
        </div>
        // </div>
    );
};

export default TbDialogueWizard;
