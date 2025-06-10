// Age options 0-99 plus >100
const ageOptions = [...Array.from({ length: 100 }, (_, i) => ({ value: String(i), label: String(i) })), { value: ">100", label: ">100" }];

export default ageOptions;
