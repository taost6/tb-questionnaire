import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

// ────────────────────────────────────────────────────────────────
// Field / Section definition helpers
// ────────────────────────────────────────────────────────────────
// Each field object may contain:
//  id, label, type, placeholder, options, conditional(formData)
// type ∈ text | textarea | radio | checkbox

/** @typedef {{ id:string,label:string,type:string,placeholder?:string,options?:{value:string,label:string}[],conditional?:(d:any)=>boolean }} Field */

// ----------------------------------------------------------------
// Questionnaire structure  (summarised / key items only)
// ----------------------------------------------------------------
const sections = [
  {
    id: "account",
    title: "I. 連絡先と言語設定",
    fields: [
      { id: "email", label: "メールアドレス", type: "text", placeholder: "example@example.com" },
      {
        id: "language",
        label: "利用言語",
        type: "radio",
        options: [
          "日本語",
          "English",
          "Tagalog",
          "Tiếng Việt",
          "ไทย",
          "မြန်မာ",
          "ភាសាខ្មែរ",
          "বাংলা",
          "Português",
        ].map((l) => ({ value: l, label: l })),
      },
    ],
  },
  {
    id: "basic",
    title: "II. 基礎情報",
    fields: [
      { id: "name", label: "氏名", type: "text" },
      { id: "age", label: "年齢", type: "text" },
      {
        id: "sex",
        label: "性別",
        type: "radio",
        options: [
          { value: "male", label: "男性" },
          { value: "female", label: "女性" },
          { value: "other", label: "その他" },
        ],
      },
      { id: "birthDate", label: "生年月日 (YYYY/MM/DD)", type: "text" },
      { id: "address", label: "現住所", type: "text" },
      { id: "phone", label: "電話番号", type: "text" },
      {
        id: "nationality",
        label: "国籍",
        type: "radio",
        options: [
          { value: "jp", label: "日本国籍" },
          { value: "foreign", label: "外国籍" },
          { value: "unknown", label: "不明" },
        ],
      },
      {
        id: "foreignNation",
        label: "国籍 (外国籍の場合)",
        type: "text",
        conditional: (d) => d.nationality === "foreign",
      },
    ],
  },
  {
    id: "health",
    title: "III. 健康状況",
    fields: [
      {
        id: "cough2w",
        label: "過去2週間以上『せき』『たん』が続いていますか?",
        type: "radio",
        options: [
          { value: "yes", label: "はい" },
          { value: "no", label: "いいえ" },
        ],
      },
      {
        id: "coughTreatment",
        label: "その症状で医療機関にかかっていますか?",
        type: "radio",
        options: [
          { value: "yes", label: "はい" },
          { value: "no", label: "いいえ" },
        ],
        conditional: (d) => d.cough2w === "yes",
      },
      {
        id: "coughOnset",
        label: "症状はいつ頃から?",
        type: "radio",
        options: [
          { value: "<1m", label: "1か月未満" },
          { value: "1-2m", label: "1-2か月" },
          { value: "2-3m", label: "2-3か月" },
          { value: "3-6m", label: "3-6か月" },
          { value: ">6m", label: "6か月以上" },
          { value: "unknown", label: "わからない" },
        ],
        conditional: (d) => d.cough2w === "yes",
      },
    ],
  },
  {
    id: "lifestyle",
    title: "IV. ライフスタイル",
    fields: [
      {
        id: "livingSituation",
        label: "住まい・生活状況",
        type: "radio",
        options: [
          "単身生活",
          "家族と同居",
          "施設共同生活 (老健等)",
          "医療機関入院中",
          "住所不定/ホームレス経験",
          "その他",
        ].map((v) => ({ value: v, label: v })),
      },
    ],
  },
  {
    id: "contacts",
    title: "V. 接触者",
    fields: [
      { id: "householdContacts", label: "同居家族 (氏名・年齢・基礎疾患)", type: "textarea" },
      { id: "workSchoolContacts", label: "職場・通学先等の日常接触相手", type: "textarea" },
    ],
  },
];

// ----------------------------------------------------------------
// Generic Field renderer
// ----------------------------------------------------------------
function Field({ field, data, setData }) {
  if (field.conditional && !field.conditional(data)) return null;
  const update = (v) => setData((d) => ({ ...d, [field.id]: v }));

  switch (field.type) {
    case "text":
      return (
        <div className="mb-4">
          <Label className="block mb-1" htmlFor={field.id}>{field.label}</Label>
          <Input id={field.id} placeholder={field.placeholder || ""} value={data[field.id] || ""} onChange={(e) => update(e.target.value)} />
        </div>
      );
    case "textarea":
      return (
        <div className="mb-4">
          <Label className="block mb-1" htmlFor={field.id}>{field.label}</Label>
          <Textarea id={field.id} value={data[field.id] || ""} onChange={(e) => update(e.target.value)} />
        </div>
      );
    case "radio":
      return (
        <div className="mb-4">
          <Label className="block mb-2">{field.label}</Label>
          <RadioGroup value={data[field.id] || ""} onValueChange={update} className="space-y-1">
            {field.options.map((opt) => {
              const optId = `${field.id}-${opt.value}`;
              return (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={optId} />
                  <Label htmlFor={optId}>{opt.label}</Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      );
    case "checkbox":
      return (
        <div className="mb-4">
          <Label className="block mb-2">{field.label}</Label>
          <div className="space-y-1">
            {field.options.map((opt) => {
              const arr = data[field.id] || [];
              const checked = arr.includes(opt.value);
              const optId = `${field.id}-${opt.value}`;
              return (
                <div key={opt.value} className="flex items-center space-x-2">
                  <Checkbox id={optId} checked={checked} onCheckedChange={(c) => {
                    if (c) update([...arr, opt.value]);
                    else update(arr.filter((v) => v !== opt.value));
                  }} />
                  <Label htmlFor={optId}>{opt.label}</Label>
                </div>
              );
            })}
          </div>
        </div>
      );
    default:
      return null;
  }
}

// ----------------------------------------------------------------
// Wizard root component
// ----------------------------------------------------------------
export default function TbQuestionnaireWizard() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const cur = sections[step];
  const progress = ((step + 1) / sections.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">結核問診フォーム</h1>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
        <Card className="shadow">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">{cur.title}</h2>
            {cur.fields.map((f) => (
              <Field key={f.id} field={f} data={formData} setData={setFormData} />
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}>戻る</Button>
        {step < sections.length - 1 ? (
          <Button onClick={() => setStep((s) => Math.min(s + 1, sections.length - 1))}>次へ</Button>
        ) : (
          <Button onClick={() => console.log("送信データ", formData)}>送信 (console)</Button>
        )}
      </div>

      {/* debug json */}
      <pre className="mt-6 text-xs bg-gray-100 p-2 rounded leading-tight overflow-x-auto"><code>{JSON.stringify(formData, null, 2)}</code></pre>
    </div>
  );
}
