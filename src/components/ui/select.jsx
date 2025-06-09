const Select = ({ id, options, value, onChange }) => {
    return (
        <select
            id={id}
            className="border rounded px-2 py-1 w-full"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}

export default Select;