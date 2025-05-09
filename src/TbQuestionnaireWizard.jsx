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

      {
        id: "age",
        label: "年齢",
        type: "select",
        options: ageOptions,
        default: "20",
        children: [
          {
            id: "monthAge",
            label: "月齢 (0歳の場合)",
            type: "text",
            placeholder: "例: 6",
            // age が "0" のとき表示
            conditionalValue: "0"
          },
          {
            id: "actualAge",
            label: "実年齢 (>100歳)",
            type: "text",
            placeholder: "例: 105",
            // age が ">100" のとき表示
            conditionalValue: ">100"
          }
        ]
      },

      { id: "sex", label: "性別", type: "radio", options: [
        { value: "male", label: "男性" }, { value: "female", label: "女性" }, { value: "other", label: "その他" }
      ]},
      { id: "birthDate", label: "生年月日", type: "date" },
      { id: "proxyFlag", label: "代理人による入力", type: "check" },
      { id: "guardian", label: "保護者・記入者氏名", type: "text", conditional: d => d.proxyFlag },
      { id: "address", label: "現住所", type: "text" },
      { id: "phone", label: "電話番号", type: "text" },
      { id: "nationality", label: "国籍", type: "radio", options: [
        { value: "japan", label: "日本国籍" },
        { value: "foreigner", label: "外国籍" },
        { value: "other", label: "その他・わからない" },
        ],
        children: [
          {
            id: "nationalityDetail",
            label: "",
            type: "text",
            placeholder: "国籍を教えて下さい",
            conditionalValue: "foreigner"
          }
        ]
      },

      { id: "occupation", label: "職業区分", type: "radio", options: [
        { value: "infant", label: "乳幼児" },
        { value: "schoolChild", label: "小中学生等学童" },
        { value: "highStudent", label: "高校生以上の生徒学生等" },
        { value: "worker", label: "勤労者" },
        { value: "trainee", label: "技能実習生" },
        { value: "houseWork", label: "家事従事者" },
        { value: "unemployed", label: "無職" },
        { value: "otherOcc", label: "その他・分からない" },
        ],
        children: [
          {
            id: "placeNurseryName",
            label: "",
            type: "text",
            placeholder: "通園先名称",
            conditionalValue: "infant"
          },
          {
            id: "placeSchoolName",
            label: "",
            type: "text",
            placeholder: "通学先名称",
            conditional: d => ["schoolChild","highStudent"].includes(d.occupation)
          },
          {
            id: 'placeWorkType',
            label: '',
            type: 'radio',
            options: [
              { value: "company", label: "会社員等・被雇用者" },
              { value: "self",    label: "自営業、自由業" },
              { value: "teacher", label: "教員、保母等" },
              { value: "service", label: "接客業等" },
              { value: "medical", label: "医療従事者・介護師等" },
              { value: "otherWorker", label: "その他" },
            ],
            conditional: d => ['worker'].includes(d.occupation),
            children: [
              {
                id: "placeWorkerName",
                label: "",
                type: "text",
                placeholder: "勤務先名称",
                conditional: d => ["company","teacher","service","medical"].includes(d.placeWorkType)
              },
              {
                id: "placeWorkerCategory",
                label: "",
                type: "text",
                placeholder: "具体的な職種を入力して下さい",
                conditionalValue: "otherWorker"
              }
            ]    
          },
          {
            id: "placeTrainName",
            label: "",
            type: "text",
            placeholder: "技能実習先施設",
            conditionalValue: "trainee"
          },
          {
            id: "otherOccNote",
            label: "",
            type: "text",
            placeholder: "ご説明ください",
            conditionalValue: "otherOcc"
          }
        ]
      },

      {
        id: "requestReason",
        label: "本問診を依頼された経緯",
        type: "radio",
        options: [
          { value: "diagnosed",       label: "医療機関にて結核の診断を受けた" },
          { value: "possible",        label: "医療機関にて結核の可能性を指摘された" },
          { value: "investigation",   label: "結核患者の濃厚接触者として調査を受けた" },
          { value: "contactPossible", label: "結核患者との接触の可能性を指摘された" },
          { value: "healthCheck",     label: "健康診断で異常を指摘された" },
          { value: "unknown",         label: "よく分からない" },
        ],
        children: [
          {
            id: "contactRelation",
            label: "患者との関係",
            type: "radio",
            options: [
              { value: "living",          label: "同居している" },
              { value: "work",            label: "職場等で日常的に接している" },
              { value: "unknownRelation", label: "わからない" },
              { value: "otherRelation",   label: "その他" },
            ],
            conditionalValue: "investigation",
            children: [
              {
                id: "contactPatientName",
                label: "患者の名前",
                type: "text",
                conditional: d => ["living","work"].includes(d.contactRelation)
              },
              {
                id: "contactDuration",
                label: "接触期間・状況",
                type: "text",
                conditional: d => ["work","unknownRelation"].includes(d.contactRelation)
              },
              {
                id: "contactRelationOther",
                label: "具体的に記入してください",
                type: "text",
                placeholder: "例: 親戚として毎週面会",
                conditionalValue: "otherRelation"
              }
            ]
          }
        ]
      },

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
          { value: 'none',  label: '特に症状はない' },
          { value: 'since-1w', label: '1～2週間前から' },
          { value: 'since-2w', label: '2～3週間前から' },
          { value: 'since-mt1m', label: '1ヶ月以上前から' },
          { value: 'other', label: 'その他・わからない' },
        ],
        conditional: d => patientReasons.includes(d.requestReason),
        children: [
          {
            id: "symptomSinceDetailed",
            label: "より詳しく記入してください",
            type: "text",
            placeholder: "○○年○○月頃から",
            conditionalValue: "since-mt1m"
          }
        ]
      },
      {
        id: 'regularVisits',
        label: '定期的な通院先の医療機関があれば教えて下さい',
        type: 'text',
        placeholder: '複数ある場合は列挙して下さい',
        conditional: d => patientReasons.includes(d.requestReason),
      },
      {
        id: 'medicalInstitutions',
        label: '今回結核の診断をした医療機関を教えて下さい',
        type: 'text',
        placeholder: '複数の医療機関を受診していた場合は列挙して下さい',
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
        id: 'pastTb',
        label: '今までに結核に罹ったことがありますか？',
        type: 'radio',
        options: [
          { value: 'no',      label: 'なし' },
          { value: 'yes',     label: 'あり' },
          { value: 'unknown', label: 'わからない' },
        ],
        conditional: d => patientReasons.includes(d.requestReason),
        children: [
          {
            id: "pastTbEpisode",
            label: "時期などを詳しく記入してください",
            type: "text",
            placeholder: "○○年頃、入院していました",
            conditionalValue: "yes"
          },
          {
            id: "pastTbTreatment",
            label: "治療について詳しく記入してください",
            type: "text",
            placeholder: "○○を内服していましたが、2ヶ月で脱落しました",
            conditionalValue: "yes"
          }
        ]
      },
      {
        id: 'contactWithTb',
        label: '症状のある結核患者と接触したことがありますか？',
        type: 'radio',
        options: [
          { value: 'no',      label: 'なし' },
          { value: 'yes',     label: 'あり' },
          { value: 'unknown', label: 'わからない' },
        ],
        conditional: d => patientReasons.includes(d.requestReason),
        children: [
          {
            id: "contactWithTbDetail",
            label: "詳しく記入してください",
            type: "text",
            placeholder: "○○年○○月頃、時々会っていた友人が発症した",
            conditionalValue: "yes"
          }
        ]
      },

      // --- 患者以外に聴取 ---
      {
        id: 'cough2w',
        label: 'この２週間以上「せき」や「たん」が続いていますか？',
        type: 'radio',
        options: [
          { value: 'yes',     label: 'はい' },
          { value: 'no',      label: 'いいえ' },
          { value: 'unknown', label: 'わからない' },
        ],
        conditional: d => !patientReasons.includes(d.requestReason),
        children: [
          {
            id: 'nonPatientSince',
            label: '症状はいつごろから生じていますか？',
            type: 'radio',
            options: [
              { value: 'lt1m',   label: '１か月未満' },
              { value: '1to2m',  label: '１か月以上２か月未満' },
              { value: '2to3m',  label: '２か月以上３か月未満' },
              { value: '3to6m',  label: '３か月以上６か月未満' },
              { value: 'gt6m',   label: '６か月以上' },
              { value: 'unk',    label: 'よくわからない' },
            ],
            conditionalValue: 'yes'
          },
          {
            id: 'nonPatientTreated',
            label: 'その「せき」や「たん」について、検査や治療を受けていますか？',
            type: 'radio',
            options: [
              { value: 'yes',     label: 'はい' },
              { value: 'no',      label: 'いいえ' },
              { value: 'unknown', label: 'わからない' },
            ],
            conditionalValue: 'yes'
          },
          {
            id: 'respiratoryHistory',
            label: '過去２年間で、喘息など、何らかの呼吸器疾患といわれたことがありますか？',
            type: 'checkbox',
            options: [
              { value: 'asthma',       label: '喘息' },
              { value: 'infiltration', label: '肺浸潤' },
              { value: 'pleuritis',    label: '胸膜炎' },
              { value: 'peritonitis',  label: '肋膜炎' },
              { value: 'lymph',        label: '頚部リンパ節結核等' },
              { value: 'other',        label: 'その他', inputs: ['otherRespiratory'] },
            ],
            conditionalValue: 'yes',
            children: [
              {
                id: 'otherRespiratory',
                label: '',
                placeholder: "具体的に",
                type: 'text',
                conditionalValue: 'other'
              }
            ]      
          }
        ]
      },
      {
        id: 'regularCheckup',
        label: '健康診断を定期的に受けていますか？',
        type: 'radio',
        options: [
          { value: 'annual',   label: '毎年受けている' },
          { value: 'fewYear',  label: '数年に一度受けている' },
          { value: 'gt3year',  label: '３年間以上受けていない' },
          { value: 'other',    label: 'その他・わからない' },
        ],
        conditional: d => !patientReasons.includes(d.requestReason),
        children: [
          {
            id: 'checkupFollow',
            label: '検診にて要精密検査を指示されていますか？',
            type: 'radio',
            options: [
              { value: 'none',    label: '指示されていない' },
              { value: 'notDone', label: '指示を受けたが受診していない' },
              { value: 'done',    label: '指示を受け受診している' },
              { value: 'other',   label: 'その他・わからない' },
            ],
            conditional: d => ['annual','fewYear'].includes(d.regularCheckup)
          }
        ]
      },
      {
        id: 'tbMedication',
        label: '現在、結核の治療薬を飲んでいますか？',
        type: 'radio',
        options: [
          { value: 'no',    label: '飲んでいない' },
          { value: 'planned', label: '飲むことになっている' },
          { value: 'yes',   label: '飲んでいる' },
          { value: 'other', label: 'その他・わからない' },
        ],
        conditional: d => !patientReasons.includes(d.requestReason),
        children: [
          { id:    'tbMedicationReason',
            label: '理由を教えて下さい',
            type:  'text',
            placeholder: '例: 予防内服',
            conditional: d => ['planned','yes'].includes(d.tbMedication)
          }
        ]
      },

      // --- 全員に聴取 ---
      {
        id: 'bcg',
        label: '今までBCG接種(スタンプ式の予防接種)をうけたことがありますか？',
        type: 'radio',
        options: [
          { value: 'yes',    label: 'あり' },
          { value: 'no',     label: 'なし' },
          { value: 'other',  label: 'その他・わからない' },
        ],
        children: [
          {
            id: 'bcgNote',
            type: 'note',
            label: '※ お子さんの場合は、母子手帳を参考にご回答ください',
            conditionalValue: 'other'
          },
          {
            id: 'bcgReason',
            label: 'それはどうしてですか？',
            type: 'radio',
            options: [
              { value: 'tuber', label: 'ツベルクリン反応検査が陽性だったため' },
              { value: 'other', label: 'その他の理由' },
            ],
            conditionalValue: 'no',
            children: [
              {
                id: 'bcgOtherReason',
                label: '理由をご記入ください',
                type: 'text',
                placeholder: '例: 手帳を紛失したため',
                conditionalValue: 'other'
              }
            ]
          }
        ]
      },
      {
        id: 'healthStatus',
        label: '健康状態について、当てはまるものを選んで下さい',
        type: 'radio',
        options: [
          { value: 'healthy',    label: '健康 (定期的な通院等なし)' },
          { value: 'underTreat', label: '通院中、ないし、入院歴あり' },
          { value: 'other',      label: 'その他' },
        ],
        children: [
          {
            id: 'comorbidities',
            label: '当てはまるものを全て選んで下さい',
            type: 'checkbox',
            options: [
              { value: 'diabetes',         label: '糖尿病' },
              { value: 'cancer',           label: 'がん・悪性腫瘍' },
              { value: 'pneumoconiosis',   label: '塵肺' },
              { value: 'gastrectomy',      label: '胃切除手術後' },
              { value: 'immunosuppressant',label: '免疫抑制剤の使用' },
              { value: 'pregnant',         label: '妊娠中' },
              { value: 'other',            label: 'その他', inputs: ['otherComorbidity'] },
            ],
            conditionalValue: 'underTreat',
            children: [
              {
                id: 'otherComorbidity',
                label: '',
                type: 'text',
                placeholder: '具体的に',
                conditionalValue: 'other'
              }
            ]  
          },
          {
            id: 'otherHealthStatus',
            label: '',
            type: 'text',
            placeholder: '例: 通院はしていないが調子が悪い',
            conditionalValue: 'other'
          }
        ]
      }
    ],
  },

  {
    id: "lifestyle",
    title: "IV. ライフスタイル",
    fields: [
     // 住まい・生活状況
     {
       id: "livingSituation",
       label: "住まい・生活状況について、当てはまるものを選んで下さい",
       type: "radio",
       options: [
         { value: "alone",       label: "単身生活" },
         { value: "withFamily",  label: "家族や知人と同居" },
         { value: "facility",    label: "老健・福祉施設等共同生活" },
         { value: "hospital",    label: "医療機関入院中" },
         { value: "homeless",    label: "住所不定またはホームレス経験がある(過去数年以内)" },
         { value: "other",       label: "その他" }
       ],
       children: [
          {
            id: 'withFamilyNote',
            type: 'note',
            label: '次のページにて、同居の方々の名前を教えて下さい',
            conditionalValue: 'withFamily'
          },
          {
            id: "facilityName",
            type: "text",
            label: "",
            placeholder: "施設名を記入してください",
            conditionalValue: "facility"
          },
          {
            id: "hospitalName",
            type: "text",
            label: "",
            placeholder: "医療期間名を記入してください",
            conditionalValue: "hospital"
          },
          {
            id: "otherLivingSituation",
            type: "text",
            placeholder: "具体的に記入してください",
            conditionalValue: "other"
          }
       ]
     },
     {
       id: "familyTb",
       label: "家族や同居人で、過去２年以内に結核にかかった人はいますか？",
       type: "radio",
       options: [
         { value: "yes",     label: "いる" },
         { value: "no",      label: "いない" },
         { value: "unknown", label: "その他・わからない" }
       ],
       children: [
         {
           id: "familyTbDetail",
           type: "text",
           label: "お名前を教えてください",
           placeholder: "氏名を入力",
           conditionalValue: "yes"
         }
       ]
     },
     {
       id: "overseaStay",
       label: "過去3年以内に、通算して半年以上、日本国外に住んでいたことがありますか？",
       type: "radio",
       options: [
         { value: "yes", label: "はい" },
         { value: "no",  label: "いいえ" }
       ],
       children: [
         {
           id: "overseaDuration",
           type: "text",
           label: "大まかな期間を教えて下さい",
           placeholder: "例：2022年4月～2023年1月",
           conditionalValue: "yes"
         },
         {
           id: "overseaCountry",
           type: "text",
           label: "どちらの国でしょうか",
           placeholder: "例：フィリピン、アメリカ合衆国",
           conditionalValue: "yes"
         }
       ]
     },
     {
       id: "transport",
       label: "よく利用する交通機関はありますか？",
       type: "group",
       children: [
         {
           id: "transportName",
           type: "text",
           label: "名称：",
           placeholder: "例：JR函館本線"
         },
         {
           id: "transportRoute",
           type: "text",
           label: "経路等：",
           placeholder: "例：札幌⇔旭川"
         }
       ]
     },

    // ─────────────────────────────────────────────────
    // 属性別質問
    // ─────────────────────────────────────────────────
     {
      id: "studentTutoring",
      label: "塾・予備校に通っていますか？",
      type: "text",
      placeholder: "学校名・週〇回等",
      conditional: d => Number(d.age) >= 6 && Number(d.age) <= 18
    },
    {
      id: "studentLessons",
      label: "習い事に通っていますか？",
      type: "text",
      placeholder: "施設名・週〇回等",
      conditional: d => Number(d.age) >= 6 && Number(d.age) <= 18
    },
    {
      id: "adultShoppingStores",
      label: "よく買い物に行く店はありますか？",
      type: "text",
      placeholder: "店名・週〇回等",
      conditional: d => Number(d.age) >= 18 && Number(d.age) <= 75
    },
    {
      id: "adultRestaurants",
      label: "よく食事に行く飲食店はありますか？",
      type: "text",
      placeholder: "店名・週〇回等",
      conditional: d => Number(d.age) >= 18 && Number(d.age) <= 75
    },
    {
      id: "adultPartTime",
      label: "アルバイトしている先があれば、教えて下さい",
      type: "text",
      placeholder: "店名・週〇回等",
      conditional: d => Number(d.age) >= 18 && Number(d.age) <= 75
    },
    {
      id: "adultActivities",
      label: "サークル活動やボランティア活動はしていますか？",
      type: "text",
      placeholder: "組織名・週〇回等",
      conditional: d => Number(d.age) >= 18 && Number(d.age) <= 75
    },
    {
      id: "adultFacilities",
      label: "よく利用する店舗・施設を選んで下さい",
      type: "checkbox",
      options: [
        { value: "karaoke",     label: "カラオケ" },
        { value: "gameCenter",  label: "ゲームセンター" },
        { value: "netCafe",     label: "ネットカフェ・まんが喫茶" },
        { value: "pachinko",    label: "パチンコ・麻雀店" },
        { value: "raceTrack",   label: "競馬場・競輪場" },
        { value: "izakaya",     label: "居酒屋・バー・キャバクラ等" },
        { value: "sauna",       label: "サウナ・銭湯" },
        { value: "capsuleHotel",label: "カプセルホテル" },
        { value: "simpleInn",   label: "簡易宿泊所" }
      ],
      children: [
        {
          id: "karaokeName",
          type: "text",
          label: "",
          placeholder: "店名・所在地・訪問頻度等",
          conditionalValue: "karaoke"
        },
        {
          id: "gameCenterName",
          type: "text",
          label: "",
          placeholder: "店名・所在地・訪問頻度等",
          conditionalValue: "gameCenter"
        },
        {
          id: "netCafeName",
          type: "text",
          label: "",
          placeholder: "店名・所在地・訪問頻度等",
          conditionalValue: "netCafe"
        },
        {
          id: "pachinkoName",
          type: "text",
          label: "",
          placeholder: "店名・所在地・訪問頻度等",
          conditionalValue: "pachinko"
        },
        {
          id: "raceTrackName",
          type: "text",
          label: "",
          placeholder: "店名・所在地・訪問頻度等",
          conditionalValue: "raceTrack"
        },
        {
          id: "izakayaName",
          type: "text",
          label: "",
          placeholder: "店名・所在地・訪問頻度等",
          conditionalValue: "izakaya"
        },
        {
          id: "saunaName",
          type: "text",
          label: "",
          placeholder: "店名・所在地・訪問頻度等",
          conditionalValue: "sauna"
        },
        {
          id: "capsuleHotelName",
          type: "text",
          label: "",
          placeholder: "店名・所在地・訪問頻度等",
          conditionalValue: "capsuleHotel"
        },
        {
          id: "simpleInnName",
          type: "text",
          label: "",
          placeholder: "店名・所在地・訪問頻度等",
          conditionalValue: "simpleInn"
        },
     ],
     conditional: d => Number(d.age) >= 18 && Number(d.age) <= 75
    },
    {
      id: "adultOtherPlaces",
      label: "スポーツ施設等、上記以外に月１回以上行くような場所があれば教えて下さい",
      type: "text",
      placeholder: "施設名・週〇回等",
      conditional: d => Number(d.age) >= 18 && Number(d.age) <= 75
    },
    {
      id: "adultLiveEvents",
      label: "ライブやコンサート等、大勢の人が集まるような機会への参加があれば、教えて下さい",
      type: "list",
      placeholder: "例: コンサート名・場所や参加回数など",
      conditional: d => Number(d.age) >= 18 && Number(d.age) <= 75
    },
    {
      id: "elderlyShortStay",
      label: "ショートステイ等、入所を伴う施設を利用していますか？",
      type: "radio",
      options: [
        { value: "yes", label: "あり" },
        { value: "no",  label: "なし" }
      ],
      children: [
        {
          id: "elderlyShortStayDetail",
          label: "",
          type: "text",
          placeholder: "施設名・所在地等",
          conditionalValue: "yes"
        }
      ],
      conditional: d => Number(d.age) >= 70
    },
    {
      id: "elderlyDayService",
      label: "デイサービス等、利用している施設はありますか？",
      type: "radio",
      options: [
        { value: "yes", label: "あり" },
        { value: "no",  label: "なし" }
      ],
      children: [
        {
          id: "elderlyDayServiceDetail",
          label: "",
          type: "text",
          placeholder: "施設名・所在地等",
          conditionalValue: "yes"
        }
      ],
      conditional: d => Number(d.age) >= 70
    },
    {
      id: "foreignSchool",
      label: "日本語学校や専門学校等、日本で通っていた学校があれば、教えて下さい",
      type: "text",
      placeholder: "学校名・所在地等",
      conditional: d => ["foreigner"].includes(d.nationality)
    },
    {
      id: "foreignGatherings",
      label: "同郷の方々が集まるような集会等があれば、教えて下さい",
      type: "text",
      placeholder: "名称・所在地等",
      conditional: d => ["foreigner"].includes(d.nationality)
    },
    {
      id: "vulnerableHomelessSpots",
      label: "よく野宿する場所があれば、教えて下さい",
      type: "text",
      conditional: d => ["homeless"].includes(d.livingSituation)
    },
    {
      id: "vulnerableFacilities",
      label: "よく利用する福祉施設・職業安定所・障害者施設等があれば、教えて下さい",
      type: "text",
      placeholder: "名称・所在地等",
      conditional: d => ["homeless"].includes(d.livingSituation)
    }
    ]
  },

  { id: "contacts", title: "V. 接触者", fields: [
      { id: "householdContacts",
        label: "同居されている方 (氏名・年齢・基礎疾患)",
        type: "list",
        placeholder: "例: 山田太郎(35)・糖尿病" 
      },
      { id: "workSchoolContacts",
        label: "職場・通学先等での日常的な接触相手",
        type: "list",
        placeholder: "例: 同僚・鈴木次郎・(40代)・持病あり" 
      },
      { id: "otherRegularContacts",
        label: "その他の活動における日常的な接触相手",
        type: "list",
        placeholder: "例: リハビリ通院先の担当者・西村さん" 
      },
      { id: "GeneralComments", label: "その他、気になることやご質問", type: "textarea" },
    ]
  }
];

/** Field renderer **/
function Field({ field, data, setData }) {
  if(field.conditional && !field.conditional(data)) return null;
  const set = v => setData(d => ({ ...d, [field.id]: v }));
  const labelCls = "block mb-1 font-semibold";
  const value = data[field.id] || field.default || "";

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
        {/* ── ここから子フィールド描画 ── */}
        {field.children?.map(child => {
          // child.conditional があればそれを優先、なければ conditionalValue との比較
          const ok = child.conditional
            ? child.conditional(data)
            : data[field.id] === child.conditionalValue;
          if (!ok) return null;
            return (
                <div key={child.id} className="ml-4">
                  <Field
                    field={child}
                    data={data}
                    setData={setData}
                  />
                </div>
              )
        })}
        {/* ── ここまで ── */}
      </div>
    );

    case "radio":
      return (
        <div className="mb-4">
          {/* 設問ラベル */}
          <Label htmlFor={field.id} className={labelCls}>
          {field.label}
          </Label>

          {/* ラジオ選択肢 */}
          <div className="space-y-1 ml-4">
            {field.options.map(opt => {
              const selected = data[field.id] === opt.value;
              return (
                <div key={opt.value}>
                  {/* ラジオボタン本体 */}
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={field.id}
                      value={opt.value}
                      checked={selected}
                      onChange={e =>
                        setData(d => ({ ...d, [field.id]: e.target.value }))
                      }
                    />
                    <span>{opt.label}</span>
                  </label>

                  {/* ここから子フィールド展開（選択中のみ） */}
                  {selected && field.children?.map(child => {
                    // 子にconditional関数があればそれを評価、
                    // なければ conditionalValue との比較で判定
                    const ok = child.conditional
                      ? child.conditional(data)
                      : data[field.id] === child.conditionalValue;
                    if (!ok) return null;
                    return (
                      <div key={child.id} className="ml-8 mt-2">
                        <Field field={child} data={data} setData={setData} />
                      </div>
                    );
                  })}
                  {/* ここまで子フィールド展開 */}
                </div>
              );
            })}
          </div>
        </div>
      );

    case "check": return (
      <div className="mb-4 flex items-center space-x-2 justify-end">
        <Checkbox id={field.id} checked={!!data[field.id]} onCheckedChange={v=>setData(d=>({...d,[field.id]:v}))} />
        <Label htmlFor={field.id} className="font-semibold">{field.label}</Label>
      </div>
    );

    case "checkbox":
      return (
        <div className="mb-4">
          <Label className={labelCls}>{field.label}</Label>
          <div className="ml-4">

            {field.options.map(opt => {
              const checked = (data[field.id] || []).includes(opt.value)
              // ユニークな id を生成
              const inputId = `${field.id}-${opt.value}`

              return (
                <div key={opt.value} className="mb-1">
                  {/* チェック＋ラベルだけを行内配置 */}
                  <div className="flex items-center">
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      onCheckedChange={v => {
                        const arr = data[field.id] || []
                        setData(d => ({
                          ...d,
                          [field.id]: v
                            ? [...arr, opt.value]
                            : arr.filter(x => x !== opt.value)
                        }))
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={inputId} className="select-none">
                      {opt.label}
                    </label>
                  </div>

                  {/* チェック時のみ、別行に ml-4 で字下げ */}
                  {checked && field.children?.map(child => {
                    if (child.conditionalValue !== opt.value) return null
                    if (
                      !data[field.id]?.includes(child.conditionalValue) ||
                      (child.conditional && !child.conditional(data))
                    ) return null

                    return (
                      <div key={child.id} className="ml-8">
                        <Field field={child} data={data} setData={setData} />
                      </div>
                    )
                  })}
                </div>
              )
          })}
        </div>
      </div>
      );
      
    case "textarea": return (
      <div className="mb-4">
        <Label className={labelCls} htmlFor={field.id}>{field.label}</Label>
        <Textarea id={field.id} className="ml-4" value={data[field.id]||""} onChange={e=>setData(d=>({...d,[field.id]:e.target.value}))} />
      </div>
    );

    case "note":
      return (
        <div className="mb-2 ml-4">
          <p className="text-sm text-gray-600">{field.label}</p>
        </div>
      );

    case "list":
      // data[field.id] は文字列の配列として管理します
      const list = data[field.id] || [""];
      const setList = newList => setData(d => ({ ...d, [field.id]: newList }));
      return (
        <div className="mb-4">
          <Label className={labelCls}>{field.label}</Label>
          <div className="ml-4 space-y-2">
            {list.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Input
                  value={item}
                  placeholder={field.placeholder || ""}
                  onChange={e => {
                    const arr = [...list];
                    arr[idx] = e.target.value;
                    setList(arr);
                  }}
                />
                {/* 削除ボタン */}
                {list.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const arr = list.filter((_, i) => i !== idx);
                      setList(arr);
                    }}
                  >
                    削除
                  </Button>
                )}
              </div>
            ))}
            {/* 追加ボタン */}
            <div className="w-full flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setList([...list, ""])}
              >
                追加
              </Button>
            </div>
          </div>
        </div>
      );

    default: return null;
  }
}

export default function TbQuestionnaireWizard() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ language: "日本語", nationality: "jp", age: "20",
    householdContactsList: [""],
    workSchoolContactsList: [""],
    otherRegularContactsList: [""],
  });
  const [showData, setShowData] = useState(false);

  const handleNext = () => {
  // setPage(p => p + 1);
    window.scrollTo(0, 0);
    setStep(s=>Math.min(s+1,sections.length-1))
  };

  const handleSubmit = () => {
    // 送信処理
    console.log("送信データ",formData);
    document.getElementById('formData').style.display = 'block';
    setShowData(true);
  };

  const cur = sections[step];
  const progress = ((step + 1) / sections.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">結核問診票 / Tuberculosis Questionnaire</h1>
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
          <Button onClick={handleNext}>次へ</Button>
          :<Button onClick={handleSubmit}>提出</Button>
        }
      </div>
      <pre className="mt-6 text-xs bg-gray-100 p-2 rounded leading-tight overflow-x-auto" id="formData"
        style={{ display: 'none', background: '#f7f7f7', padding: '1em' }}><code>{JSON.stringify(formData,null,2)}</code></pre>
    </div>
  );
}
