// Form schema definitions
import ageOptions from "./ageOptions";
import patientReasons, { patientReasonsHospital } from "./patientReasons";

const symptomCondition = (d: any) => {
  if (!["investigation", "contactPossible", "unknown"].includes(d.requestReason)) return true;
  return d.cough2w === "yes";
};

const sections = [
  {
    id: "account",
    title: "I. 連絡先と言語設定",
    fields: [
      {
        id: "email",
        label: "メールアドレス",
        type: "text",
        placeholder: "example@example.com",
        required: true,
        validationErrorMessage: "正しい形式で入力してください。",
      },
      {
        id: "language",
        label: "利用言語",
        type: "radio",
        default: "日本語",
        options: ["日本語", "English", "Tagalog", "Tiếng Việt", "ไทย", "မြန်မာ", "ភាសាខ្មែរ", "বাংলা", "Português"].map((l) => ({
          value: l,
          label: l,
        })),
      },
    ],
  },

  {
    id: "basic",
    title: "II. 基礎情報",
    fields: [
      { id: "name", label: "氏名", type: "text", required: true },
      { id: "furiganaName", label: "フリガナ", type: "text" },
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
            conditionalValue: "0",
          },
          {
            id: "actualAge",
            label: "実年齢 (>100歳)",
            type: "text",
            placeholder: "例: 105",
            // age が ">100" のとき表示
            conditionalValue: ">100",
          },
        ],
      },

      {
        id: "sex",
        label: "性別",
        type: "radio",
        required: true,
        options: [
          { value: "male", label: "男性" },
          { value: "female", label: "女性" },
          { value: "other", label: "その他・分からない" },
        ],
      },
      { id: "birthDate", label: "生年月日", type: "date", required: true },
      {
        id: "proxyFlag",
        label: "代理人による入力",
        type: "check",
        children: [
          { id: "guardian", label: "保護者・記入者氏名", type: "text", conditional: (d: any) => d.proxyFlag },
          { id: "guardianRelation", label: "患者との関係", type: "text", conditional: (d: any) => d.proxyFlag },
          { id: "guardianAddress", label: "連絡先", type: "text", conditional: (d: any) => d.proxyFlag },
        ],
      },
      { id: "postalCode", label: "郵便番号", type: "postcode", placeholder: "例: 123-4567" },
      { id: "addressPrefCity", label: "現住所", type: "text", placeholder: "都道府県・市区町村" },
      { id: "addressTown", label: "", type: "text", placeholder: "町域" },
      {
        id: "phone",
        label: "電話番号",
        type: "text",
        note: "※連絡しやすい番号を入力してください",
        validationErrorMessage: "正しい形式で入力してください。",
        required: true,
        children: [
          {
            id: "phoneNote",
            type: "note",
            label: "※連絡しやすい番号を入力してください",
            conditional: (d: any) => true,
          },
        ],
      },
      {
        id: "connectFlag",
        label: "連絡がしやすい曜日、時間入力",
        type: "check",
        children: [{ id: "connectDay", label: "", type: "text", placeholder: "連絡がしやすい曜日・時間", conditional: (d: any) => d.connectFlag }],
      },
      {
        id: "nationality",
        label: "国籍",
        type: "radio",
        required: true,
        options: [
          { value: "japan", label: "日本国籍" },
          { value: "foreigner", label: "外国籍" },
          { value: "other", label: "その他・分からない" },
        ],
        children: [
          {
            id: "nationalityDetail",
            label: "",
            type: "text",
            placeholder: "国籍を教えて下さい",
            conditionalValue: "foreigner",
          },
          {
            id: "jpLevel",
            label: "日本語能力",
            type: "radio",
            conditionalValue: "foreigner",
            options: [
              { label: "上級", value: "4" },
              { label: "中級", value: "3" },
              { label: "初級", value: "2" },
              { label: "挨拶程度", value: "1" },
              { label: "その他・分からない", value: "-1" },
            ],
          },
        ],
      },

      {
        id: "occupation",
        label: "職業区分",
        type: "radio",
        required: true,
        options: [
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
            conditionalValue: "infant",
          },
          {
            id: "placeSchoolName",
            label: "",
            type: "text",
            placeholder: "通学先名称",
            conditional: (d: any) => ["schoolChild", "highStudent"].includes(d.occupation),
          },
          {
            id: "placeWorkType",
            label: "",
            type: "radio",
            options: [
              { value: "company", label: "会社員等・被雇用者" },
              { value: "self", label: "自営業、自由業" },
              { value: "teacher", label: "教員、保母等" },
              { value: "service", label: "接客業等" },
              { value: "medical", label: "医療従事者・介護師等" },
              { value: "otherWorker", label: "その他" },
            ],
            conditional: (d: any) => ["worker"].includes(d.occupation),
            children: [
              {
                id: "placeWorkerName",
                label: "",
                type: "text",
                placeholder: "勤務先名称",
                conditional: (d: any) => ["company", "teacher", "service", "medical"].includes(d.placeWorkType),
              },
              {
                id: "placeWorkerCategory",
                label: "",
                type: "text",
                placeholder: "具体的な職種を入力して下さい",
                conditionalValue: "otherWorker",
              },
            ],
          },
          {
            id: "placeTrainName",
            label: "",
            type: "text",
            placeholder: "技能実習先施設",
            conditionalValue: "trainee",
          },
          {
            id: "otherOccNote",
            label: "",
            type: "text",
            placeholder: "ご説明ください",
            conditionalValue: "otherOcc",
          },
        ],
      },

      {
        id: "requestReason",
        label: "本問診を依頼された経緯",
        type: "radio",
        required: true,
        options: [
          { value: "diagnosed", label: "医療機関にて結核の診断を受けた", mode: "patients" },
          { value: "possible", label: "医療機関にて結核の可能性を指摘された", mode: "patients" },
          { value: "investigation", label: "結核患者の濃厚接触者として調査を受けた", mode: "contacts" },
          { value: "contactPossible", label: "結核患者との接触の可能性を指摘された", mode: "contacts" },
          { value: "healthCheck", label: "健康診断で異常を指摘された", mode: "patients" },
          { value: "unknown", label: "よく分からない", mode: "contacts" },
        ],
        children: [
          {
            id: "contactRelation",
            label: "患者との関係",
            type: "radio",
            options: [
              { value: "living", label: "同居している" },
              { value: "work", label: "職場等で日常的に接している" },
              { value: "unknownRelation", label: "分からない" },
              { value: "otherRelation", label: "その他" },
            ],
            conditionalValue: "investigation",
            required: true,
            children: [
              {
                id: "contactPatientName",
                label: "患者の名前",
                type: "text",
                conditional: (d: any) => ["living", "work"].includes(d.contactRelation),
              },
              {
                id: "contactDuration",
                label: "接触期間・状況",
                type: "text",
                conditional: (d: any) => ["work", "unknownRelation"].includes(d.contactRelation),
              },
              {
                id: "contactRelationOther",
                label: "具体的に記入してください",
                type: "text",
                placeholder: "例: 親戚として毎週面会",
                conditionalValue: "otherRelation",
              },
            ],
          },
          {
            id: "checkupType",
            label: "検診の種類",
            type: "text",
            conditional: (d: any) => ["healthCheck"].includes(d.requestReason),
            required: true,
          },
          {
            id: "checkupDate",
            label: "検診日",
            type: "text",
            placeholder: "〇〇〇〇年〇〇月〇〇日",
            conditional: (d: any) => ["healthCheck"].includes(d.requestReason),
            required: true,
          },
        ],
      },
    ],
  },

  {
    id: "health",
    title: "III. 健康状況",
    fields: [
      // --- 患者のみ聴取 ---
      {
        id: "healthStatus",
        label: "健康状態について、当てはまるものを選んで下さい",
        type: "radio",
        required: true,
        options: [
          { value: "healthy", label: "健康 (定期的な通院等なし)" },
          { value: "underTreat", label: "症状あり (未通院)" },
          { value: "underHospital", label: "通院中" },
          { value: "other", label: "その他・分からない" },
        ],
        children: [
          {
            id: "otherHealthStatus",
            label: "",
            type: "text",
            placeholder: "例: 通院はしていないが調子が悪い",
            conditionalValue: "other",
          },
          {
            id: "symptomSince",
            label: "「せき」や「たん」といった症状はありますか？",
            type: "radio",
            required: true,
            options: [
              { value: "none", label: "特にない" },
              { value: "since-1w", label: "1～2週間前から" },
              { value: "since-2w", label: "2～3週間前から" },
              { value: "since-mt1m", label: "1ヶ月以上前から" },
              { value: "other", label: "その他・分からない" },
            ],
            conditional: (d: any) => ["underTreat", "underHospital"].includes(d.healthStatus),
            children: [
              {
                id: "symptomSinceDetailed",
                label: "より詳しく記入してください",
                type: "text",
                placeholder: "○○年○○月頃から",
                conditionalValue: "since-mt1m",
                required: true,
              },
            ],
          },
          {
            id: "otherSymptom",
            label: "その他に症状はありますか？",
            placeholder: "複数ある場合は列挙して下さい",
            type: "text",
            conditional: (d: any) => ["underTreat", "underHospital"].includes(d.healthStatus),
          },

          {
            id: "regularVisits",
            label: "定期的な通院先の医療機関を教えて下さい",
            type: "text",
            placeholder: "複数ある場合は列挙して下さい",
            conditional: (d: any) => ["underHospital"].includes(d.healthStatus),
          },

          {
            id: "oralMedication",
            label: "内服薬",
            placeholder: "薬の名前か種類",
            type: "list",
            conditional: (d: any) => ["underHospital"].includes(d.healthStatus),
          },
        ],
      },

      {
        id: "medicalInstitutions",
        label: "今回結核の診断をした医療機関を教えて下さい",
        type: "text",
        placeholder: "複数の医療機関を受診していた場合は列挙して下さい",
        conditional: (d: any) => patientReasonsHospital.includes(d.requestReason),
      },
      {
        id: "hospitalizations",
        label: "この2年間で入院した医療機関があれば教えて下さい",
        type: "text",
        placeholder: "大まかな入院時期も記載して下さい",
        conditional: (d: any) => patientReasons.includes(d.requestReason),
      },
      {
        id: "pastTb",
        label: "今までに結核に罹ったことがありますか？",
        type: "radio",
        required: true,
        options: [
          { value: "no", label: "なし" },
          { value: "yes", label: "あり" },
          { value: "unknown", label: "分からない" },
        ],
        conditional: (d: any) => patientReasons.includes(d.requestReason),
        children: [
          {
            id: "pastTbEpisode",
            label: "時期などを詳しく記入してください",
            type: "text",
            placeholder: "○○年頃、入院していました",
            conditionalValue: "yes",
          },
          {
            id: "pastTbTreatment",
            label: "治療について詳しく記入してください",
            type: "text",
            placeholder: "○○を内服していましたが、2ヶ月で脱落しました",
            conditionalValue: "yes",
          },
        ],
      },
      {
        id: "contactWithTb",
        label: "症状のある結核患者と接触したことがありますか？",
        type: "radio",
        required: true,
        options: [
          { value: "no", label: "なし" },
          { value: "yes", label: "あり" },
          { value: "unknown", label: "分からない" },
        ],
        conditional: (d: any) => patientReasons.includes(d.requestReason),
        children: [
          {
            id: "contactWithTbDetail",
            label: "詳しく記入してください",
            type: "text",
            placeholder: "○○年○○月頃、時々会っていた友人が発症した",
            conditionalValue: "yes",
          },
        ],
      },

      // --- 患者以外に聴取 ---
      {
        id: "cough2w",
        label: "この２週間以上「せき」や「たん」が続いていますか？",
        type: "radio",
        required: true,
        options: [
          { value: "yes", label: "はい" },
          { value: "no", label: "いいえ" },
          { value: "unknown", label: "分からない" },
        ],
        conditional: (d: any) => !patientReasons.includes(d.requestReason),
        children: [
          {
            id: "nonPatientSince",
            label: "症状はいつごろから生じていますか？",
            type: "radio",
            options: [
              { value: "lt1m", label: "１か月未満" },
              { value: "1to2m", label: "１か月以上２か月未満" },
              { value: "2to3m", label: "２か月以上３か月未満" },
              { value: "3to6m", label: "３か月以上６か月未満" },
              { value: "gt6m", label: "６か月以上" },
              { value: "unk", label: "よく分からない" },
            ],
            conditionalValue: "yes",
            required: true,
          },
          {
            id: "nonPatientTreated",
            label: "その「せき」や「たん」について、検査や治療を受けていますか？",
            type: "radio",
            options: [
              { value: "yes", label: "はい" },
              { value: "no", label: "いいえ" },
              { value: "unknown", label: "分からない" },
            ],
            conditionalValue: "yes",
            required: true,
          },
          {
            id: "respiratoryHistory",
            label: "過去２年間で、喘息など、何らかの呼吸器疾患といわれたことがありますか？",
            type: "checkbox",
            options: [
              { value: "asthma", label: "喘息" },
              { value: "infiltration", label: "肺浸潤" },
              { value: "pleuritis", label: "胸膜炎" },
              { value: "peritonitis", label: "肋膜炎" },
              { value: "lymph", label: "頚部リンパ節結核等" },
              { value: "other", label: "その他", inputs: ["otherRespiratory"] },
            ],
            conditionalValue: "yes",
            children: [
              {
                id: "otherRespiratory",
                label: "",
                placeholder: "具体的に",
                type: "text",
                conditionalValue: "other",
                required: true,
              },
            ],
          },
        ],
      },
      {
        id: "regularCheckup",
        label: "健康診断を定期的に受けていますか？",
        type: "radio",
        required: true,
        options: [
          { value: "annual", label: "毎年受けている" },
          { value: "fewYear", label: "数年に一度受けている" },
          { value: "gt3year", label: "３年間以上受けていない" },
          { value: "other", label: "その他・分からない" },
        ],
        conditional: (d: any) => !patientReasons.includes(d.requestReason),
        children: [
          {
            id: "checkupFollow",
            label: "検診にて要精密検査を指示されていますか？",
            type: "radio",
            options: [
              { value: "none", label: "指示されていない" },
              { value: "notDone", label: "指示を受けたが受診していない" },
              { value: "done", label: "指示を受け受診している" },
              { value: "other", label: "その他・分からない" },
            ],
            conditional: (d: any) => ["annual", "fewYear"].includes(d.regularCheckup),
            required: true,
          },
        ],
      },
      {
        id: "tbMedication",
        label: "現在、結核の治療薬を飲んでいますか？",
        type: "radio",
        required: true,
        options: [
          { value: "no", label: "飲んでいない" },
          { value: "planned", label: "飲むことになっている" },
          { value: "yes", label: "飲んでいる" },
          { value: "other", label: "その他・分からない" },
        ],
        conditional: (d: any) => !patientReasons.includes(d.requestReason),
        children: [
          {
            id: "tbMedicationReason",
            label: "理由を教えて下さい",
            type: "text",
            placeholder: "例: 予防内服",
            conditional: (d: any) => ["planned", "yes"].includes(d.tbMedication),
            required: true,
          },
        ],
      },

      // --- 全員に聴取 ---
      {
        id: "bcg",
        label: "今までBCG接種(スタンプ式の予防接種)をうけたことがありますか？",
        type: "radio",
        required: true,
        options: [
          { value: "yes", label: "あり" },
          { value: "no", label: "なし" },
          { value: "other", label: "その他・分からない" },
        ],
        children: [
          {
            id: "bcgNote",
            type: "note",
            label: "※ お子さんの場合は、母子手帳を参考にご回答ください",
            conditionalValue: "other",
          },
          {
            id: "bcgReason",
            label: "それはどうしてですか？",
            type: "radio",
            options: [
              { value: "tuber", label: "ツベルクリン反応検査が陽性だったため" },
              { value: "other", label: "その他の理由" },
            ],
            conditionalValue: "no",
            required: true,
            children: [
              {
                id: "bcgOtherReason",
                label: "理由をご記入ください",
                type: "text",
                placeholder: "例: 手帳を紛失したため",
                conditionalValue: "other",
                required: true,
              },
            ],
          },
        ],
      },
      {
        id: "height",
        label: "身⾧",
        type: "text",
        placeholder: "例: 170Cm",
      },
      {
        id: "weight",
        label: "体重",
        type: "text",
        placeholder: "例: 約50kg",
      },
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
        required: true,
        options: [
          { value: "alone", label: "単身生活" },
          { value: "withFamily", label: "家族や知人と同居" },
          { value: "facility", label: "老健・福祉施設等共同生活" },
          { value: "hospital", label: "医療機関入院中" },
          { value: "other", label: "その他" },
        ],
        children: [
          {
            id: "withFamilyNote",
            type: "note",
            label: "次のページにて、同居の方々の名前を教えて下さい",
            conditionalValue: "withFamily",
          },
          {
            id: "facilityName",
            type: "text",
            label: "",
            placeholder: "施設名を記入してください",
            conditionalValue: "facility",
          },
          {
            id: "hospitalName",
            type: "text",
            label: "",
            placeholder: "医療期間名を記入してください",
            conditionalValue: "hospital",
          },
          {
            id: "otherLivingSituation",
            type: "text",
            placeholder: "具体的に記入してください",
            conditionalValue: "other",
          },
        ],
      },
      {
        id: "homeLess",
        type: "check",
        label: "ホームレス経験がある(過去数年以内)",
      },
      {
        id: "smokes",
        label: "喫煙している",
        type: "check",
      },
      {
        id: "drinks",
        label: "よく飲酒する",
        type: "check",
      },
      {
        id: "familyTb",
        label: "家族や同居人で、過去２年以内に結核にかかった人はいますか？",
        type: "radio",
        required: true,
        options: [
          { value: "yes", label: "いる" },
          { value: "no", label: "いない" },
          { value: "unknown", label: "その他・分からない" },
        ],
        children: [
          {
            id: "familyTbDetail",
            type: "text",
            label: "お名前を教えてください",
            placeholder: "氏名を入力",
            conditionalValue: "yes",
            required: true,
          },
        ],
      },
      {
        id: "overseaStay",
        label: "過去3年以内に、通算して半年以上、日本国外に住んでいたことがありますか？",
        type: "radio",
        required: true,
        options: [
          { value: "yes", label: "はい" },
          { value: "no", label: "いいえ" },
          { value: "unkown", label: "分からない" },
        ],
        children: [
          {
            id: "overseaDuration",
            type: "text",
            label: "大まかな期間を教えて下さい",
            placeholder: "例：2022年4月～2023年1月",
            conditionalValue: "yes",
          },
          {
            id: "overseaCountry",
            type: "text",
            label: "どちらの国でしょうか",
            placeholder: "例：フィリピン、アメリカ合衆国",
            conditionalValue: "yes",
          },
        ],
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
            placeholder: "例：JR函館本線",
          },
          {
            id: "transportRoute",
            type: "text",
            label: "経路等：",
            placeholder: "例：札幌⇔旭川",
          },
        ],
      },

      // ─────────────────────────────────────────────────
      // 属性別質問
      // ─────────────────────────────────────────────────
      {
        id: "studentTutoring",
        label: "塾・予備校に通っていますか？",
        type: "text",
        placeholder: "学校名・週〇回等",
        conditional: (d: any) => Number(d.age) >= 6 && Number(d.age) <= 18 && symptomCondition(d),
      },
      {
        id: "studentLessons",
        label: "習い事に通っていますか？",
        type: "text",
        placeholder: "施設名・週〇回等",
        conditional: (d: any) => Number(d.age) >= 6 && Number(d.age) <= 18 && symptomCondition(d),
      },
      {
        id: "adultShoppingStores",
        label: "よく買い物に行く店はありますか？",
        type: "text",
        placeholder: "店名・週〇回等",
        conditional: (d: any) => Number(d.age) >= 18 && Number(d.age) <= 75 && symptomCondition(d),
      },
      {
        id: "adultRestaurants",
        label: "よく食事に行く飲食店はありますか？",
        type: "text",
        placeholder: "店名・週〇回等",
        conditional: (d: any) => Number(d.age) >= 18 && Number(d.age) <= 75 && symptomCondition(d),
      },
      {
        id: "adultPartTime",
        label: "アルバイトしている先があれば、教えて下さい",
        type: "text",
        placeholder: "店名・週〇回等",
        conditional: (d: any) => Number(d.age) >= 18 && Number(d.age) <= 75 && symptomCondition(d),
      },
      {
        id: "adultActivities",
        label: "サークル活動やボランティア活動はしていますか？",
        type: "text",
        placeholder: "組織名・週〇回等",
        conditional: (d: any) => Number(d.age) >= 18 && Number(d.age) <= 75 && symptomCondition(d),
      },
      {
        id: "adultFacilities",
        label: "よく利用する店舗・施設を選んで下さい",
        type: "checkbox",
        options: [
          { value: "karaoke", label: "カラオケ" },
          { value: "gameCenter", label: "ゲームセンター" },
          { value: "netCafe", label: "ネットカフェ・まんが喫茶" },
          { value: "pachinko", label: "パチンコ・麻雀店" },
          { value: "raceTrack", label: "競馬場・競輪場" },
          { value: "izakaya", label: "居酒屋・バー・キャバクラ等" },
          { value: "sauna", label: "サウナ・銭湯" },
          { value: "capsuleHotel", label: "カプセルホテル" },
          { value: "simpleInn", label: "簡易宿泊所" },
        ],
        children: [
          {
            id: "karaokeName",
            type: "text",
            label: "",
            placeholder: "店名・所在地・訪問頻度等",
            conditionalValue: "karaoke",
          },
          {
            id: "gameCenterName",
            type: "text",
            label: "",
            placeholder: "店名・所在地・訪問頻度等",
            conditionalValue: "gameCenter",
          },
          {
            id: "netCafeName",
            type: "text",
            label: "",
            placeholder: "店名・所在地・訪問頻度等",
            conditionalValue: "netCafe",
          },
          {
            id: "pachinkoName",
            type: "text",
            label: "",
            placeholder: "店名・所在地・訪問頻度等",
            conditionalValue: "pachinko",
          },
          {
            id: "raceTrackName",
            type: "text",
            label: "",
            placeholder: "店名・所在地・訪問頻度等",
            conditionalValue: "raceTrack",
          },
          {
            id: "izakayaName",
            type: "text",
            label: "",
            placeholder: "店名・所在地・訪問頻度等",
            conditionalValue: "izakaya",
          },
          {
            id: "saunaName",
            type: "text",
            label: "",
            placeholder: "店名・所在地・訪問頻度等",
            conditionalValue: "sauna",
          },
          {
            id: "capsuleHotelName",
            type: "text",
            label: "",
            placeholder: "店名・所在地・訪問頻度等",
            conditionalValue: "capsuleHotel",
          },
          {
            id: "simpleInnName",
            type: "text",
            label: "",
            placeholder: "店名・所在地・訪問頻度等",
            conditionalValue: "simpleInn",
          },
        ],
        conditional: (d: any) => Number(d.age) >= 18 && Number(d.age) <= 75 && symptomCondition(d),
      },
      {
        id: "adultOtherPlaces",
        label: "スポーツ施設等、上記以外に月１回以上行くような場所があれば教えて下さい",
        type: "text",
        placeholder: "施設名・週〇回等",
        conditional: (d: any) => Number(d.age) >= 18 && Number(d.age) <= 75 && symptomCondition(d),
      },
      {
        id: "adultLiveEvents",
        label: "ライブやコンサート等、大勢の人が集まるような機会への参加があれば、教えて下さい",
        type: "list",
        placeholder: "例: コンサート名・場所や参加回数など",
        conditional: (d: any) => Number(d.age) >= 18 && Number(d.age) <= 75 && symptomCondition(d),
      },
      {
        id: "elderlyShortStay",
        label: "ショートステイ等、入所を伴う施設を利用していますか？",
        type: "radio",
        options: [
          { value: "yes", label: "あり" },
          { value: "no", label: "なし" },
        ],
        children: [
          {
            id: "elderlyShortStayDetail",
            label: "",
            type: "text",
            placeholder: "施設名・所在地等",
            conditionalValue: "yes",
          },
        ],
        conditional: (d: any) => Number(d.age) >= 70 && symptomCondition(d),
      },
      {
        id: "elderlyDayService",
        label: "デイサービス等、利用している施設はありますか？",
        type: "radio",
        options: [
          { value: "yes", label: "あり" },
          { value: "no", label: "なし" },
        ],
        children: [
          {
            id: "elderlyDayServiceDetail",
            label: "",
            type: "text",
            placeholder: "施設名・所在地等",
            conditionalValue: "yes",
          },
        ],
        conditional: (d: any) => Number(d.age) >= 70 && symptomCondition(d),
      },
      {
        id: "foreignSchool",
        label: "日本語学校や専門学校等、日本で通っていた学校があれば、教えて下さい",
        type: "text",
        placeholder: "学校名・所在地等",
        conditional: (d: any) => ["foreigner"].includes(d.nationality) && symptomCondition(d),
      },
      {
        id: "foreignGatherings",
        label: "同郷の方々が集まるような集会等があれば、教えて下さい",
        type: "text",
        placeholder: "名称・所在地等",
        conditional: (d: any) => ["foreigner"].includes(d.nationality) && symptomCondition(d),
      },
      {
        id: "vulnerableHomelessSpots",
        label: "よく野宿する場所があれば、教えて下さい",
        type: "text",
        conditional: (d: any) => ["homeless"].includes(d.livingSituation) && symptomCondition(d),
      },
      {
        id: "vulnerableFacilities",
        label: "よく利用する福祉施設・職業安定所・障害者施設等があれば、教えて下さい",
        type: "text",
        placeholder: "名称・所在地等",
        conditional: (d: any) => ["homeless"].includes(d.livingSituation) && symptomCondition(d),
      },
    ],
  },

  {
    id: "contacts",
    title: "V. 接触者",
    fields: [
      { id: "householdContacts", label: "同居されている方 (氏名・年齢・基礎疾患)", type: "list", placeholder: "例: 山田太郎(35)・糖尿病" },
      { id: "workSchoolContacts", label: "職場・通学先等での日常的な接触相手", type: "list", placeholder: "例: 同僚・鈴木次郎・(40代)・持病あり" },
      {
        id: "otherRegularContacts",
        label: "その他の活動における日常的な接触相手",
        type: "list",
        placeholder: "例: リハビリ通院先の担当者・西村さん",
      },
      { id: "GeneralComments", label: "その他、気になることやご質問", type: "textarea" },
    ],
  },
];

export default sections;
