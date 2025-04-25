import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

/** --------------------------------------------------
 *  Helper: generic select (with indent)
 * --------------------------------------------------*/
function Select({ id, options, value, onChange }) {
  return (
    <select
      id={id}
      className="border rounded p-2 w-full ml-4"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** 年齢オプション: 0‑99 と >100 */
const ageOptions = [
  ...Array.from({ length: 100 }, (_, i) => ({ value: String(i), label: String(i) })),
  { value: ">100", label: ">100" },
];

/** --------------------------------------------------
 *  フォーム定義 (3 セクション抜粋)
 * --------------------------------------------------*/
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
        default: "日本語",
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
      { id: "age", label: "年齢", type: "select", options: ageOptions, default: "20" },
      { id: "monthAge", label: "月齢 (0歳の場合)", type: "text", conditional: (d) => d.age === "0" },
      { id: "actualAge", label: "実年齢 (>100歳)", type: "text", conditional: (d) => d.age === ">100" },
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
      { id: "birthDate", label: "生年月日(西暦)", type: "date" },
      { id: "proxyFlag", label: "代理人による入力", type: "check" },
      { id: "guardian", label: "保護者・記入者氏名", type: "text", conditional: (d) => d.proxyFlag },
      { id: "address", label: "現住所", type: "text" },
      { id: "phone", label: "電話番号", type: "text" },
      { id: "nationality", label: "国籍", type: "radio-nat" },
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
    ],
  },
];

/** --------------------------------------------------
 *  フィールド描画
 * --------------------------------------------------*/
function Field({ field, data, setData }) {
  if (field.conditional && !field.conditional(data)) return null;
  const set = (v) => setData((d) => ({ ...d, [field.id]: v }));
  const labelCls = "block mb-1 font-semibold";

  switch (field.type) {
    case "text":
      return (
        <div className="mb-4">
          <Label className={labelCls} htmlFor={field.id}>{field.label}</Label>
          <Input id={field.id} className="ml-4" value={data[field.id] || ""} placeholder={field.placeholder || ""} onChange={(e) => set(e.target.value)} />
        </div>
      );
    case "date":
      return (
        <div className="mb-4">
          <Label className={labelCls} htmlFor={field.id}>{field.label}</Label>
          <Input id={field.id} type="date" className="ml-4" value={data[field.id] || ""} onChange={(e) => set(e.target.value)} />
        </div>
      );
    case "select":
      return (
        <div className="mb-4">
          <Label className={labelCls} htmlFor={field.id}>{field.label}</Label>
          <Select id={field.id} options={field.options} value={data[field.id] || field.default} onChange={set} />
        </div>
      );
    case "textarea":
      return (
        <div className="mb-4">
          <Label className={labelCls} htmlFor={field.id}>{field.label}</Label>
          <Textarea id={field.id} className="ml-4" value={data[field.id] || ""} onChange={(e) => set(e.target.value)} />
        </div>
      );
    case "check":
      return (
        <div className="mb-4 flex items-center space-x-2 justify-end">
          <Checkbox id={field.id} checked={!!data[field.id]} onCheckedChange={(v) => set(v)} />
          <Label htmlFor={field.id} className="font-semibold">{field.label}</Label>
        </div>
      );
    case "radio":
      return (
        <div className="mb-4">
          <Label className="block mb-2 font-semibold">{field.label}</Label>
          <RadioGroup value={data[field.id] || field.default || ""} onValueChange={set} className="space-y-1 ml-4">
            {field.options.map((o) => (
              <div key={o.value} className="flex items-center space-x-2">
                <RadioGroupItem value={o.value} id={`${field.id}-${o.value}`} />
                <Label htmlFor={`${field.id}-${o.value}`}>{o.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    case "radio-nat": {
      const val = data.nationality || "jp";
      const opts = [
        { value: "jp", label: "日本国籍" },
        { value: "foreign", label: "外国籍" },
        { value: "unknown", label: "不明" },
      ];
      return (
        <div className="mb-4">
          <Label className="block mb-2 font-semibold">国籍</Label>
          <RadioGroup value={val} onValueChange={(v) => setData((d) => ({ ...d, nationality: v }))} className="space-y-1 ml-4">
            {opts.map((o) => (
              <div key={o.value} className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={o.value} id={`nat-${o.value}`} />
                  <Label htmlFor={`nat-${o.value}`}>{o.label}</Label>
                </div>
                {o.value === "foreign" && val === "foreign" && (
                  <Input className="mt-2 ml-6" placeholder="国籍を入力" value={data.foreignNation || ""} onChange={(e) => setData((d) => ({ ...d, foreignNation: e.target.value }))} />
                )}
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    }
    default:
      return null;
  }
}

/** --------------------------------------------------
 *  Wizard component
 * --------------------------------------------------*/
export default function TbQuestionnaireWizard() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ language: "日本語", nationality: "jp", age: "20" });
  const cur = sections[step];
  const progress = ((step + 1) / sections.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">結核問診フォーム</h1>
      {/* progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
      </div>

      {/* animated card */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
      >
        <Card className="shadow">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">{cur.title}</h2>
            {cur.fields.map((f) => (
              <Field key={f.id} field={f} data={formData} setData={setFormData} />
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* nav buttons */}
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
