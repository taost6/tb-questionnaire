import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

// Helper: generic select with indent
function Select({ id, options, value, onChange }) {
  return (
    <select
      id={id}
      className="border rounded p-2 w-full ml-4"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// Age options 0-99 plus >100
const ageOptions = [
  ...Array.from({ length: 100 }, (_, i) => ({ value: String(i), label: String(i) })),
  { value: ">100", label: ">100" },
];

// Form schema definitions
const sections = [
  { id: "account", title: "I. 連絡先と言語設定", fields: [
      { id: "email", label: "メールアドレス", type: "text", placeholder: "example@example.com" },
      { id: "language", label: "利用言語", type: "radio", default: "日本語",
        options: ["日本語","English","Tagalog","Tiếng Việt","ไทย","မြန်မာ","ភាសាខ្មែរ","বাংলা","Português"].map(l=>({value:l,label:l})) },
    ]
  },
  { id: "basic", title: "II. 基礎情報", fields: [
      { id: "name", label: "氏名", type: "text" },
      { id: "age", label: "年齢", type: "select", options: ageOptions, default: "20" },
      { id: "monthAge", label: "月齢 (0歳の場合)", type: "text", placeholder: "例: 6", conditional: d => d.age === "0" },
      { id: "actualAge", label: "実年齢 (>100歳)", type: "text", placeholder: "例: 105", conditional: d => d.age === ">100" },
      { id: "sex", label: "性別", type: "radio", options: [
        { value: "male", label: "男性" }, { value: "female", label: "女性" }, { value: "other", label: "その他" }
      ]},
      { id: "birthDate", label: "生年月日", type: "date" },
      { id: "proxyFlag", label: "代理人による入力", type: "check" },
      { id: "guardian", label: "保護者・記入者氏名", type: "text", conditional: d => d.proxyFlag },
      { id: "address", label: "現住所", type: "text" },
      { id: "phone", label: "電話番号", type: "text" },
      { id: "nationality", label: "国籍", type: "radio-nat" },
      { id: "occupation", label: "職業区分", type: "radio", options: [
        { value: "infant", label: "乳幼児" },
        { value: "schoolChild", label: "小中学生等学童" },
        { value: "highStudent", label: "高校生以上の生徒学生等" },
        { value: "worker", label: "勤労者" },
        { value: "trainee", label: "技能実習生" },
        { value: "houseWork", label: "家事従事者" },
        { value: "unemployed", label: "無職" },
        { value: "otherOcc", label: "その他・分からない" },
      ]},
      { id: "workplaceName", label: "通学先・勤務先・技能実習先の名称", type: "text", conditional: d => !!d.occupation },
      { id: "requestReason", label: "本問診を依頼された経緯", type: "radio", options: [
        { value: "diagnosed", label: "医療機関にて結核の診断を受けた" },
        { value: "possible", label: "医療機関にて結核の可能性を指摘された" },
        { value: "investigation", label: "結核患者の濃厚接触者として調査を受けた" },
        { value: "contactPossible", label: "結核患者との接触の可能性を指摘された" },
        { value: "healthCheck", label: "健康診断で異常を指摘された" },
        { value: "unknown", label: "よく分からない" },
      ]},
      { id: "contactRelation", label: "患者との関係を教えてください", type: "radio", options: [
        { value: "living", label: "同居している" },
        { value: "work", label: "職場等で日常的に接している" },
        { value: "unknownRelation", label: "わからない" },
        { value: "otherRelation", label: "その他" },
      ], conditional: d => ["investigation","contactPossible"].includes(d.requestReason) },
      { id: "contactPatientName", label: "患者の名前を教えてください", type: "text", conditional: d => ["living","work"].includes(d.contactRelation) },
      { id: "contactDuration", label: "患者と、どれくらいの期間、どういう具合に接触してきたか、教えて下さい", type: "text", conditional: d => ["work","unknownRelation"].includes(d.contactRelation) },
    ]
  },
  { id: "health", title: "III. 健康状況", fields: [
      { id: "cough2w", label: "過去2週間以上『せき』『たん』が続いていますか?", type: "radio", options: [
        { value: "yes", label: "はい" }, { value: "no", label: "いいえ" }
      ] }
    ]
  },
  { id: "lifestyle", title: "IV. ライフスタイル", fields: [
      { id: "livingSituation", label: "住まい・生活状況", type: "radio", options: [
        "単身生活","家族と同居","施設共同生活","医療機関入院中","住所不定","その他"
      ].map(v=>({value:v,label:v})) }
    ]
  },
  { id: "contacts", title: "V. 接触者", fields: [
      { id: "householdContacts", label: "同居家族 (氏名・年齢・基礎疾患)", type: "textarea" },
      { id: "workSchoolContacts", label: "職場・通学先等の日常接触相手", type: "textarea" }
    ]
  }
];

/** Field renderer **/
function Field({ field, data, setData }) {
  if(field.conditional && !field.conditional(data)) return null;
  const set = v => setData(d => ({ ...d, [field.id]: v }));
  const labelCls = "block mb-1 font-semibold";
  const value = data[field.id] || field.default || "";

  // Inline occupation and otherOcc
  if(field.id === "occupation") {
    return (
      <div className="mb-4">
        <Label className={labelCls}>{field.label}</Label>
        <RadioGroup value={value} onValueChange={set} className="space-y-1 ml-4">
          {field.options.map(o => (
            <div key={o.value} className="flex flex-col">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={o.value} id={`occ-${o.value}`} />
                <Label htmlFor={`occ-${o.value}`}>{o.label}</Label>
              </div>
              {o.value === "worker" && value === "worker" && (
                <RadioGroup value={data.workerType||""} onValueChange={wt=>setData(d=>({...d,workerType:wt}))} className="mt-2 ml-6 space-y-1">
                  {[
                    { value: "company", label: "会社員等・被雇用者" },
                    { value: "self", label: "自営業、自由業" },
                    { value: "teacher", label: "教員、保母等" },
                    { value: "service", label: "接客業等" },
                    { value: "medical", label: "医療従事者・介護師等" },
                    { value: "otherWorker", label: "その他" }
                  ].map(opt => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`wt-${opt.value}`} />
                      <Label htmlFor={`wt-${opt.value}`}>{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {o.value === "otherOcc" && value === "otherOcc" && (
                <Input className="mt-2 ml-6" placeholder="その他を入力" value={data.otherOccText||""} onChange={e=>setData(d=>({...d,otherOccText:e.target.value}))} />
              )}
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  }

  // Inline requestReason
  if(field.id === "requestReason") {
    return (
      <div className="mb-4">
        <Label className={labelCls}>{field.label}</Label>
        <RadioGroup value={data.requestReason||""} onValueChange={v=>setData(d=>({...d,requestReason:v}))} className="space-y-1 ml-4">
          {field.options.map(o=>(
            <div key={o.value} className="flex items-center space-x-2">
              <RadioGroupItem value={o.value} id={`req-${o.value}`} />
              <Label htmlFor={`req-${o.value}`}>{o.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  }

  // Inline contactRelation
  if(field.id === "contactRelation") {
    return (
      <div className="mb-4">
        <Label className={labelCls}>{field.label}</Label>
        <RadioGroup value={data.contactRelation||""} onValueChange={v=>setData(d=>({...d,contactRelation:v}))} className="space-y-1 ml-4">
          {field.options.map(o=>(
            <div key={o.value} className="flex items-center space-x-2">
              <RadioGroupItem value={o.value} id={`rel-${o.value}`} />
              <Label htmlFor={`rel-${o.value}`}>{o.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  }

  switch(field.type) {
    case "text": return (
      <div className="mb-4">
        <Label className={labelCls} htmlFor={field.id}>{field.label}</Label>
        <Input id={field.id} className="ml-4" value={data[field.id]||""} placeholder={field.placeholder||""} onChange={e=>setData(d=>({...d,[field.id]:e.target.value}))} />
      </div>
    );
    case "date": return (
      <div className="mb-4">
        <Label className={labelCls} htmlFor={field.id}>{field.label}</Label>
        <Input id={field.id} type="date" className="ml-4" value={data[field.id]||""} onChange={e=>setData(d=>({...d,[field.id]:e.target.value}))} />
      </div>
    );
    case "select": return (
      <div className="mb-4">
        <Label className={labelCls} htmlFor={field.id}>{field.label}</Label>
        <Select id={field.id} options={field.options} value={data[field.id]||field.default} onChange={v=>setData(d=>({...d,[field.id]:v}))} />
      </div>
    );
    case "radio": return (
      <div className="mb-4">
        <Label className="block mb-2 font-semibold">{field.label}</Label>
        <RadioGroup value={data[field.id]||field.default||""} onValueChange={v=>setData(d=>({...d,[field.id]:v}))} className="space-y-1 ml-4">
          {field.options.map(o=>(
            <div key={o.value} className="flex items-center space-x-2">
              <RadioGroupItem value={o.value} id={`${field.id}-${o.value}`} />
              <Label htmlFor={`${field.id}-${o.value}`}>{o.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
    case "check": return (
      <div className="mb-4 flex items-center space-x-2 justify-end">
        <Checkbox id={field.id} checked={!!data[field.id]} onCheckedChange={v=>setData(d=>({...d,[field.id]:v}))} />
        <Label htmlFor={field.id} className="font-semibold">{field.label}</Label>
      </div>
    );
    case "textarea": return (
      <div className="mb-4">
        <Label className={labelCls} htmlFor={field.id}>{field.label}</Label>
        <Textarea id={field.id} className="ml-4" value={data[field.id]||""} onChange={e=>setData(d=>({...d,[field.id]:e.target.value}))} />
      </div>
    );
    default: return null;
  }
}

export default function TbQuestionnaireWizard() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ language: "日本語", nationality: "jp", age: "20" });
  const cur = sections[step];
  const progress = ((step + 1) / sections.length) * 100;
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">結核問診フォーム</h1>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
        <Card className="shadow"><CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">{cur.title}</h2>
          {cur.fields.map(f => <Field key={f.id} field={f} data={formData} setData={setFormData} />)}
        </CardContent></Card>
      </motion.div>
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(s => Math.max(s - 1, 0))} disabled={step===0}>戻る</Button>
        {step<sections.length-1?
          <Button onClick={()=>setStep(s=>Math.min(s+1,sections.length-1))}>次へ</Button>
          :<Button onClick={()=>console.log("送信データ",formData)}>送信 (console)</Button>
        }
      </div>
      <pre className="mt-6 text-xs bg-gray-100 p-2 rounded leading-tight overflow-x-auto"><code>{JSON.stringify(formData,null,2)}</code></pre>
    </div>
  );
}
