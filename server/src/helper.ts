import sections from "./consts/sections";

export const getCurrentDate = (): string => {
  const datetime = new Date();
  const y = datetime.getFullYear();
  const m = String(datetime.getMonth() + 1).padStart(2, "0");
  const d = String(datetime.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getCurrentTime = (): string => {
  const datetime = new Date();
  const h = String(datetime.getHours()).padStart(2, "0");
  const m = String(datetime.getMinutes()).padStart(2, "0");
  const s = String(datetime.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export const getCurrentDateTime = (): string => {
  return `${getCurrentDate()} ${getCurrentTime()}`;
};

const getOptionLabel = (options: any[], value: string): string => {
  const option = options.find((opt) => opt.value === value);
  return option ? option.label : value;
};

const getMsg = (fields: any, user: any, parentId: string = "###", prefix: string = ""): string => {
  let msg = "";
  for (const field of fields) {
    if (field.conditional || field.conditionalValue) {
      const ok = field.conditional ? field.conditional(user) : field.conditionalValue === user[parentId];
      if (!ok) continue;
    }
    if (field.type === "text" || field.type === "date" || field.type === "textarea" || field.type === "postcode") {
      const value = user[field.id] || "";
      if (value !== "") {
        if (msg !== "") {
          if (field.label !== "") msg += "\n";
          else msg += " ";
        }
        if (prefix === "") msg += "- ";
        msg += prefix;
        if (field.label !== "") msg += `${field.label}: `;
        msg += value;
      }
    } else if (field.type === "select") {
      const value = user[field.id] || "";
      if (value !== "") {
        if (msg !== "") msg += "\n";
        if (prefix === "") msg += "- ";
        msg += `${prefix}${field.label}: ${value}`;

        if (field.children) {
          const childMsg = getMsg(field.children, user, field.id, prefix + "    ");
          if (childMsg !== "") msg += `\n${childMsg}`;
        }
      }
    } else if (field.type === "checkbox") {
      const values = user[field.id] || [];
      if (values.length > 0) {
        if (msg !== "") msg += "\n";
        if (prefix === "") msg += "- ";
        msg += `${prefix}${field.label}: ${values.map((value: string) => getOptionLabel(field.options, value)).join(", ")}`;
        values.forEach((value: string) => {
          const option = field.options.find((opt: any) => opt.value === value);
          if (option && option.children) {
            const childMsg = getMsg(option.children, user, field.id, prefix + "    ");
            if (childMsg !== "") msg += `\n${childMsg}`;
          }
        });
        if (field.children) {
          const childMsg = getMsg(field.children, user, field.id, prefix + "    ");
          if (childMsg !== "") msg += `\n${childMsg}`;
        }
      }
    } else if (field.type === "radio") {
      const value = user[field.id] || "";
      if (value !== "") {
        if (msg !== "") msg += "\n";
        if (prefix === "") msg += "- ";
        msg += prefix;
        if (field.label !== "") msg += `${field.label}: `;
        msg += `${getOptionLabel(field.options, value)}`;

        const option = field.options.find((opt: any) => opt.value === value);
        if (option && option.children) {
          const childMsg = getMsg(option.children, user, field.id, prefix + "    ");
          if (childMsg !== "") msg += `\n${childMsg}`;
        }
        if (field.children) {
          const childMsg = getMsg(field.children, user, field.id, prefix + "    ");
          if (childMsg !== "") msg += `\n${childMsg}`;
        }
      }
    } else if (field.type === "check") {
      const value = user[field.id] || false;
      if (value) {
        if (msg !== "") msg += "\n";
        if (prefix === "") msg += "- ";
        msg += `${prefix}${field.label}: ${value ? "はい" : "いいえ"}`;
        if (field.children) {
          const childMsg = getMsg(field.children, user, field.id, prefix + "    ");
          if (childMsg !== "") msg += `\n${childMsg}`;
        }
      }
    } else if (field.type === "list") {
      const values = user[field.id] || [];
      if (values.length > 0) {
        if (msg !== "") msg += "\n";
        if (prefix === "") msg += "- ";
        msg += `${prefix}${field.label}: ${values.join(", ")}`;
      }
    }
  }
  return msg;
};

export const getUserInfoMsg = (user: any): string => {
  let msg = "";
  for (const section of sections) {
    const sectionMsg = getMsg(section.fields, user);
    if (sectionMsg !== "") {
      if (msg !== "") msg += "\n";
      msg += sectionMsg;
    }
  }
  return msg;
};

export const getLangInEng = (lang: string): string => {
  switch (lang) {
    case "日本語":
      return "Japanese";
    case "English":
      return "English";
    case "Tagalog":
      return "Tagalog";
    case "Tiếng Việt":
      return "Vietnamese";
    case "ไทย":
      return "Thai";
    case "မြန်မာ":
      return "Burmese";
    case "ភាសាខ្មែរ":
      return "Khmer";
    case "বাংলা":
      return "Bengali";
    case "Português":
      return "Portuguese";
    default:
      return "English";
  }
};

export const getWordInLang = (lang: string, word: string): string => {
  switch (lang) {
    case "Japanese":
      return word === "Yes" ? "はい" :
        word === "No" ? "いいえ" :
          word === "Not sure" ? "わからない" :
            word === "Family" ? "家族" :
              word === "Friend" ? "友達" :
                word === "Coworker" ? "同僚" :
                  word === "School" ? "学校" :
                    word === "Shop" ? "店" :
                      word === "Restaurant" ? "レストラン" : word;
    case "English":
      return word;
    case "Tagalog":
      return word === "Yes" ? "Oo" :
        word === "No" ? "Hindi" :
          word === "Not sure" ? "Hindi sigurado" :
            word === "Family" ? "Pamilya" :
              word === "Friend" ? "Kaibigan" :
                word === "Coworker" ? "Katrabaho" :
                  word === "School" ? "Paaralan" :
                    word === "Shop" ? "Tindahan" :
                      word === "Restaurant" ? "Restawran" : word;
    case "Vietnamese":
      return word === "Yes" ? "Có" :
        word === "No" ? "Không" :
          word === "Not sure" ? "Không chắc" :
            word === "Family" ? "Gia đình" :
              word === "Friend" ? "Bạn bè" :
                word === "Coworker" ? "Đồng nghiệp" :
                  word === "School" ? "Trường học" :
                    word === "Shop" ? "Cửa hàng" :
                      word === "Restaurant" ? "Nhà hàng" : word;
    case "Thai":
      return word === "Yes" ? "ใช่" :
        word === "No" ? "ไม่ใช่" :
          word === "Not sure" ? "ไม่แน่ใจ" :
            word === "Family" ? "ครอบครัว" :
              word === "Friend" ? "เพื่อน" :
                word === "Coworker" ? "เพื่อนร่วมงาน" :
                  word === "School" ? "โรงเรียน" :
                    word === "Shop" ? "ร้านค้า" :
                      word === "Restaurant" ? "ร้านอาหาร" : word;
    case "Burmese":
      return word === "Yes" ? "ဟုတ်ကဲ့" :
        word === "No" ? "မဟုတ်ပါဘူး" :
          word === "Not sure" ? "မသေချာဘူး" :
            word === "Family" ? "မိသားစု" :
              word === "Friend" ? "သူငယ်ချင်း" :
                word === "Coworker" ? "လုပ်ဖော်ကိုင်ဖက်" :
                  word === "School" ? "ကျောင်း" :
                    word === "Shop" ? "ဆိုင်" :
                      word === "Restaurant" ? "စားသောက်ဆိုင်" : word;
    case "Khmer":
      return word === "Yes" ? "បាទ/ចាស" :
        word === "No" ? "ទេ" :
          word === "Not sure" ? "មិនប្រាកដ" :
            word === "Family" ? "គ្រួសារ" :
              word === "Friend" ? "មិត្តភក្តិ" :
                word === "Coworker" ? "មិត្តរួមការងារ" :
                  word === "School" ? "សាលា" :
                    word === "Shop" ? "ហាង" :
                      word === "Restaurant" ? "ភោជនីយដ្ឋាន" : word;
    case "Bengali":
      return word === "Yes" ? "হ্যাঁ" :
        word === "No" ? "না" :
          word === "Not sure" ? "নিশ্চিত না" :
            word === "Family" ? "পরিবার" :
              word === "Friend" ? "বন্ধু" :
                word === "Coworker" ? "সহকর্মী" :
                  word === "School" ? "স্কুল" :
                    word === "Shop" ? "দোকান" :
                      word === "Restaurant" ? "রেস্তোরাঁ" : word;
    case "Portuguese":
      return word === "Yes" ? "Sim" :
        word === "No" ? "Não" :
          word === "Not sure" ? "Não tenho certeza" :
            word === "Family" ? "Família" :
              word === "Friend" ? "Amigo" :
                word === "Coworker" ? "Colega de trabalho" :
                  word === "School" ? "Escola" :
                    word === "Shop" ? "Loja" :
                      word === "Restaurant" ? "Restaurante" : word;
    default:
      return word;
  }
}
