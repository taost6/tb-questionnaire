export function Textarea({ className = "", ...p }) {
  return <textarea {...p} className={`border rounded p-2 w-full h-24 ${className}`} />;
}
