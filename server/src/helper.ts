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
