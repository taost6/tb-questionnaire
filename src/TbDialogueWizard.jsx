import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import avartar from "./assets/img/avatar.jpg";

const TbDialogueWizard = () => {
  const [msgs, setMsgs] = useState([]);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    setMsgs([
      {
        content: `ありがとうございます。それでは、行動履歴についてお伺いしてまいりますね。どうぞよろしくお願いいたします。

まず、本日はどのように過ごされましたか？
どこに行かれたか、誰と一緒だったか、マスクの着用はされていたかを教えてください。`,
        dir: "left",
        date: "6/17(火)",
        time: "12:00",
      },
      { content: "今日は学校と病院に行きました。", dir: "right", date: "6/17(火)", time: "12:00" },
      {
        content: `ご協力ありがとうございます。

では、詳しくお伺いしますね。

① 学校には何時ごろから何時ごろまでいらっしゃいましたか？
② 学校では誰と接触されましたか？（友人、先生など）
③ マスクの着用はされていましたか？

順番にお答えいただければ大丈夫です。`,
        dir: "left",
        date: "6/17(火)",
        time: "12:00",
      },
      { content: "学校に朝9時から11時の間に通っていました。", dir: "right", date: "6/17(火)", time: "12:00" },
      {
        content: `ありがとうございます。

では続けてお伺いしますね。

学校では、誰と接触されましたか？
たとえば、友人のお名前や関係、会話の有無など、わかる範囲で教えてください。`,
        dir: "left",
        date: "6/17(火)",
        time: "12:00",
      },
    ]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const content = inputRef.current.innerText.trim();
      if (content) {
        const now = new Date();
        setMsgs((prev) => [
          ...prev,
          {
            dir: "right",
            content,
            date: getFormattedDate(),
            time: getCurrentTime(),
          },
        ]);
        inputRef.current.innerText = "";
      }
    }
  };

  return (
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
        <Card className="flex flex-col flex-1 shadow">
          <CardContent className="flex flex-col p-0" style={{ height: "calc(100vh - 158px)" }}>
            <div className="overflow-y-auto px-6 pt-6 space-y-4 pb-4">
              {msgs.map((msg, idx) => (
                <div key={idx} className={`flex items-end gap-2 ${msg.dir === "right" ? "justify-end" : "justify-start"}`}>
                  {msg.dir === "left" && <img className="w-[30px] rounded-full" src={avartar} alt="avatar" />}

                  {msg.dir === "right" && (
                    <div className="text-xs">
                      {msg.date}
                      <br />
                      {msg.time}
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] ${
                      msg.dir === "left" ? "bg-gray-300" : "bg-green-200"
                    } rounded-xl px-4 py-2 break-all whitespace-pre-line`}
                  >
                    {msg.content}
                  </div>

                  {msg.dir === "left" && (
                    <div className="text-xs">
                      {msg.date}
                      <br />
                      {msg.time}
                    </div>
                  )}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <div className="border-t p-4">
              <div
                ref={inputRef}
                contentEditable
                onKeyDown={handleKeyDown}
                className="min-h-[2.5rem] max-h-40 overflow-y-auto w-full border rounded-md px-4 py-2 outline-none focus:outline-none"
                role="textbox"
                aria-multiline="true"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-4 text-right">
        <Button>終了</Button>
      </div>
    </div>
  );
};

export default TbDialogueWizard;
