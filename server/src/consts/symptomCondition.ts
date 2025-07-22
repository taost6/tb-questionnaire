
export const symptomCondition = (d: any) => {
    if (!["investigation", "contactPossible", "unknown"].includes(d.requestReason)) return true;
    return ["since-2w", "since-mt1m", "other"].includes(d.symptomSince);
};
