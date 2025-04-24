import React, { useState } from "react";

export default function TbQuestionnaireWizard() {
  const pages = [
    {
      title: "基本情報",
      items: [
        { key: "name", label: "氏名", placeholder: "山田 太郎" },
        { key: "age", label: "年齢", placeholder: "30" },
      ],
    },
    {
      title: "健康状態",
      items: [{ key: "cough", label: "2週間以上の咳が続いていますか？", placeholder: "はい／いいえ" }],
    },
    {
      title: "完了",
      items: [],
    },
  ];

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({});

  const cur = pages[step];

  const next = () => setStep((s) => Math.min(s + 1, pages.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{cur.title}</h1>

      {cur.items.map((it) => (
        <div key={it.key} className="mb-4">
          <label className="block mb-1">{it.label}</label>
          <input
            className="w-full border rounded p-2"
            placeholder={it.placeholder}
            value={form[it.key] || ""}
            onChange={(e) => update(it.key, e.target.value)}
          />
        </div>
      ))}

      {step === pages.length - 1 && (
        <pre className="bg-gray-100 p-2 mt-4 rounded text-xs">{JSON.stringify(form, null, 2)}</pre>
      )}

      <div className="flex justify-between mt-6">
        <button disabled={step === 0} onClick={back} className="px-4 py-2 border rounded">
          戻る
        </button>
        <button onClick={next} className="px-4 py-2 bg-blue-600 text-white rounded">
          {step === pages.length - 1 ? "完了" : "次へ"}
        </button>
      </div>
    </div>
  );
}
