import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

const patientReasons = ['diagnosed', 'possible', 'healthCheck', 'unknown'];

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
      { id: "contactRelation", label: "患者との関係", type: "radio", options: [
        { value: "living", label: "同居している" },
        { value: "work", label: "職場等で日常的に接している" },
        { value: "unknownRelation", label: "わからない" },
        { value: "otherRelation", label: "その他" },
      ], conditional: d => ["investigation","contactPossible"].includes(d.requestReason) },
      { id: "contactPatientName", label: "患者の名前", type: "text", conditional: d => ["living","work"].includes(d.contactRelation) },
      { id: "contactDuration", label: "患者と、どれくらいの期間、どういう具合に接触してきたか、教えて下さい", type: "text", conditional: d => ["work","unknownRelation"].includes(d.contactRelation) },
    ]
  },
  {
    id: 'health',
    title: 'III. 健康状況',
    fields: [
      // --- 患者のみ聴取 ---
      {
        id: 'symptomSince',
        label: '「せき」や「たん」といった症状は、いつから続いていますか？',
        type: 'radio',
        options: [
          { value: 'none',  label: '① 特に症状はない' },
          { value: 'since', label: '② （　　）年（　　）月頃から', inputs: ['year', 'month'] },
          { value: 'other', label: '③ その他・わからない' },
        ],
        conditional: d => patientReasons.includes(d.requestReason),
      },
      {
        id: 'medicalInstitutions',
        label: '今回診断が付く以前に受診した医療機関を教えて下さい',
        type: 'text',
        placeholder: '複数ある場合は列挙して下さい',
        conditional: d => patientReasons.includes(d.requestReason),
      },
      {
        id: 'hospitalizations',
        label: 'この2年間で入院した医療機関があれば教えて下さい',
        type: 'text',
        placeholder: '大まかな入院時期も記載して下さい',
        conditional: d => patientReasons.includes(d.requestReason),
      },
      {
        id: 'regularVisits',
        label: '定期的な通院先の医療機関があれば教えて下さい',
        type: 'text',
        conditional: d => patientReasons.includes(d.requestReason),
      },
      {
        id: 'pastTb',
        label: '今までに結核に罹ったことがありますか？',
        type: 'radio',
        options: [
          { value: 'no',      label: '① なし' },
          { value: 'yes',     label: '② あり', inputs: ['year'] },
          { value: 'unknown', label: '③ わからない' },
        ],
        conditional: d => patientReasons.includes(d.requestReason),
      },
      {
        id: 'pastTbTreatment',
        label: '過去の結核治療について教えて下さい',
        type: 'radio',
        options: [
          { value: 'none',    label: '① なし' },
          { value: 'treated', label: '② あり', inputs: ['year', 'drugName'] },
          { value: 'dropped', label: '③ あったが脱落した' },
          { value: 'unk',     label: '④ わからない' },
        ],
        conditional: d =>
          patientReasons.includes(d.requestReason) && d.pastTb === 'yes',
      },
      {
        id: 'contactWithTb',
        label: '症状のある結核患者と接触したことがありますか？',
        type: 'radio',
        options: [
          { value: 'no',      label: '① なし' },
          { value: 'yes',     label: '② あり', inputs: ['year', 'contactPerson'] },
          { value: 'unknown', label: '③ わからない' },
        ],
        conditional: d => patientReasons.includes(d.requestReason),
      },

      // --- 患者以外に聴取 ---
      {
        id: 'cough2w',
        label: 'この２週間以上「せき」や「たん」が続いていますか？',
        type: 'radio',
        options: [
          { value: 'yes',     label: '① はい' },
          { value: 'no',      label: '② いいえ' },
          { value: 'unknown', label: '③ わからない' },
        ],
        conditional: d => !patientReasons.includes(d.requestReason),
      },
      {
        id: 'nonPatientSince',
        label: '症状はいつごろから生じていますか？',
        type: 'radio',
        options: [
          { value: 'lt1m', label: '① １か月未満' },
          { value: '1to2m', label: '② １か月以上２か月未満' },
          { value: '2to3m', label: '③ ２か月以上３か月未満' },
          { value: '3to6m', label: '④ ３か月以上６か月未満' },
          { value: 'gt6m',   label: '⑤ ６か月以上' },
          { value: 'unk',    label: '⑥ よくわからない' },
        ],
        conditional: d =>
          !patientReasons.includes(d.requestReason) && d.cough2w === 'yes',
      },
      {
        id: 'nonPatientTreated',
        label: 'その「せき」や「たん」について、治療や検査を受けていますか？',
        type: 'radio',
        options: [
          { value: 'yes',     label: '① はい' },
          { value: 'no',      label: '② いいえ' },
          { value: 'unknown', label: '③ わからない' },
        ],
        conditional: d =>
          !patientReasons.includes(d.requestReason) && d.cough2w === 'yes',
      },
      {
        id: 'respiratoryHistory',
        label: '過去２年間で、「ぜんそく」など、何らかの呼吸器疾患といわれたことがありますか？',
        type: 'checkbox',
        options: [
          { value: 'infiltration', label: '① 肺浸潤' },
          { value: 'pleuritis',    label: '② 胸膜炎' },
          { value: 'peritonitis',   label: '③ 肋膜炎' },
          { value: 'lymph',         label: '④ 頚部リンパ節結核等' },
          { value: 'other',         label: '⑤ その他', inputs: ['otherRespiratory'] },
          { value: 'unk',           label: '⑥ わからない' },
        ],
        conditional: d =>
          !patientReasons.includes(d.requestReason) && d.cough2w === 'yes',
      },
      {
        id: 'regularCheckup',
        label: '健康診断を定期的に受けていますか？',
        type: 'radio',
        options: [
          { value: 'annual',   label: '① 毎年受けている' },
          { value: 'fewYear',  label: '② 数年に一度受けている' },
          { value: 'gt3year',  label: '③ ３年間以上受けていない' },
          { value: 'other',    label: '④ その他・わからない' },
        ],
        conditional: d => !patientReasons.includes(d.requestReason),
      },
      {
        id: 'checkupFollow',
        label: '検診にて要精密検査を指示されていますか？',
        type: 'radio',
        options: [
          { value: 'none',    label: '① 指示されていない' },
          { value: 'notDone', label: '② 指示を受けたが受診していない' },
          { value: 'done',    label: '③ 指示を受け受診している' },
          { value: 'other',   label: '④ その他・わからない' },
        ],
        conditional: d =>
          !patientReasons.includes(d.requestReason) &&
          ['annual','fewYear','gt3year'].includes(d.regularCheckup),
      },
      {
        id: 'tbMedication',
        label: '現在、結核の治療薬を飲んでいますか？',
        type: 'radio',
        options: [
          { value: 'no',    label: '① 飲んでいない' },
          { value: 'planned', label: '② 飲むことになっている' },
          { value: 'yes',   label: '③ 飲んでいる' },
          { value: 'other', label: '④ その他・わからない' },
        ],
        conditional: d => !patientReasons.includes(d.requestReason),
      },

      // --- 全員に聴取 ---
      {
        id: 'bcg',
        label: '今までBCG接種(スタンプ式の予防接種)をうけたことがありますか？',
        type: 'radio',
        options: [
          { value: 'yes',    label: '① あり' },
          { value: 'no',     label: '② なし' },
          { value: 'other',  label: '③ その他・わからない' },
        ],
      },
      {
        id: 'bcgReason',
        label: 'それはどうしてですか？',
        type: 'radio',
        options: [
          { value: 'tuber', label: '① ツベルクリン反応検査が陽性だったため' },
          { value: 'other', label: '② その他の理由', inputs: ['bcgOtherReason'] },
        ],
        conditional: d => d.bcg === 'no',
      },
      {
        id: 'healthStatus',
        label: '健康状態について、当てはまるものを選んで下さい',
        type: 'radio',
        options: [
          { value: 'healthy',   label: '① 健康・定期的な通院等なし' },
          { value: 'underTreat', label: '② 通院中・入院歴あり' },
          { value: 'other',     label: '③ その他', inputs: ['otherHealthStatus'] },
        ],
      },
      {
        id: 'comorbidities',
        label: '当てはまるものを全て選んで下さい',
        type: 'checkbox',
        options: [
          { value: 'diabetes',    label: '① 糖尿病' },
          { value: 'cancer',      label: '② がん・悪性腫瘍' },
          { value: 'pneumoconiosis', label: '③ 塵肺' },
          { value: 'gastrectomy', label: '④ 胃切除手術後' },
          { value: 'immunosuppressant', label: '⑤ 免疫抑制剤の使用' },
          { value: 'pregnant',    label: '⑥ 妊娠中' },
          { value: 'other',       label: '⑦ その他', inputs: ['otherComorbidity'] },
        ],
        conditional: d => d.healthStatus === 'underTreat',
      },
    ],
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
  if (field.id === "occupation") {
    return (
      <div className="mb-6">
        <Label className={labelCls} htmlFor="occupation">
        {field.label}
        </Label>
        <div className="space-y-2 ml-4">
          {field.options.map(o => {
            const selected = data.occupation === o.value;
            return (
              <div key={o.value} className="mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="occupation"
                    value={o.value}
                    checked={selected}
                    onChange={e => setData(d => ({ ...d, occupation: e.target.value }))}
                  />
                  <span className="ml-2">{o.label}</span>
                </label>

                {/* 「勤労者」を選択時：ネストされたラジオ群 */}
                {o.value === "worker" && selected && (
                  <div className="mt-2 ml-6 space-y-1">
                    {[
                      { value: "company", label: "会社員等・被雇用者" },
                      { value: "self",    label: "自営業、自由業" },
                      { value: "teacher", label: "教員、保母等" },
                      { value: "service", label: "接客業等" },
                      { value: "medical", label: "医療従事者・介護師等" },
                      { value: "otherWorker", label: "その他" },
                    ].map(opt => {
                      const wtSelected = data.workerType === opt.value;
                      return (
                        <div key={opt.value} className="mb-1">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="workerType"
                              value={opt.value}
                              checked={wtSelected}
                              onChange={e =>
                                setData(d => ({ ...d, workerType: e.target.value }))
                              }
                            />
                            <span className="ml-2">{opt.label}</span>
                          </label>

                          {/* ネスト内「その他」選択時：詳細入力 */}
                          {opt.value === "otherWorker" && wtSelected && (
                            <div className="mt-1 ml-8">
                              <input
                                type="text"
                                value={data.otherWorkerText || ""}
                                onChange={e =>
                                  setData(d => ({ ...d, otherWorkerText: e.target.value }))
                                }
                                className="border rounded px-2 py-1 w-full"
                                placeholder="具体的な職種を入力してください"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 「その他・分からない」を選択時：詳細入力 */}
                {o.value === "otherOcc" && selected && (
                  <div className="mt-2 ml-6">
                    <input
                      type="text"
                      value={data.otherOccText || ""}
                      onChange={e =>
                        setData(d => ({ ...d, otherOccText: e.target.value }))
                      }
                      className="border rounded px-2 py-1 w-full"
                      placeholder="具体的な職業を入力してください"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
            {cur.id === 'health' ? (
              <h2 className="text-xl font-semibold mb-4">
                {cur.title} (
                {patientReasons.includes(formData.requestReason)
                  ? '患者'
                  : '接触者'}
                )
              </h2>
            ) : (
              <h2 className="text-xl font-semibold mb-4">{cur.title}</h2>
            )}

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
