import sections from "./consts/sections";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const getFieldLabel = (fieldName) => {
    for (const section of sections) {
        for (const field of section.fields) {
            if (field.id === fieldName) {
                return field.label;
            }
            if (field.children) {
                for (const child of field.children) {
                    if (child.id === fieldName) {
                        return child.label;
                    }
                }
            }
        }
    }
    return null; // Return null if the field name is not found
};

export const exportJson = (selectedUser = {}) => {
    const dataStr = JSON.stringify(selectedUser, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedUser.name ? selectedUser.name : "user"}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

export const exportExcel = (selectedUser = {}) => {
    const flatten = (obj, prefix = "") =>
        Object.entries(obj).reduce((acc, [k, v]) => {
            const pre = prefix ? prefix + "." : "";
            if (typeof v === "object" && v !== null && !Array.isArray(v)) {
                Object.assign(acc, flatten(v, pre + k));
            } else {
                acc[pre + k] = v;
            }
            return acc;
        }, {});
    const flatUser = flatten(selectedUser);
    const headers = Object.keys(flatUser).join(",");
    const values = Object.values(flatUser).map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
    const csv = headers + "\n" + values;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedUser.name ? selectedUser.name : "user"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

export const exportPdf = async (selectedUser = {}) => {
    const element = document.getElementById("info-modal-print-content");
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth - 20;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    let position = 10;
    pdf.addImage(imgData, "PNG", 10, position, pdfWidth, pdfHeight);
    pdf.save(`${selectedUser.name ? selectedUser.name : "user"}.pdf`);
};

export const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

export const formatJapaneseDate = (dateStr) => {
    const date = new Date(dateStr);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}年${m}月${d}日`;
};

export const addString = (str, suffix) => {
    if (str) str += "\n";
    return str + suffix;
}

export const getString = (content) => {
    if (!content) return "";
    return content;
}