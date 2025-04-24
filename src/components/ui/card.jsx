export function Card({ className = "", ...p }) {
  return <div {...p} className={`shadow rounded-lg bg-white ${className}`} />;
}
export function CardContent({ className = "", ...p }) {
  return <div {...p} className={`p-6 ${className}`} />;
}
