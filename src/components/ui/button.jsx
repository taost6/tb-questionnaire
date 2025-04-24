export function Button({ className = "", variant = "primary", ...p }) {
  const base = "rounded px-4 py-2 font-semibold";
  const style =
    variant === "outline"
      ? "border"
      : "bg-blue-600 hover:bg-blue-700 text-white";
  return <button {...p} className={`${base} ${style} ${className}`} />;
}
