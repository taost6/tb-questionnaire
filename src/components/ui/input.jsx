export function Input({ className = "", ...p }) {
  return <input {...p} className={`border rounded p-2 w-full ${className}`} />;
}
