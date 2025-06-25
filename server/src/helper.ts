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
