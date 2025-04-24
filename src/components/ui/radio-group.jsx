export function RadioGroup({ children, className = "", ...p }) {
  return <div {...p} className={`space-y-1 ${className}`}>{children}</div>;
}
export function RadioGroupItem({ id, value, ...p }) {
  return <input type="radio" id={id ?? value} value={value} {...p} />;
}
