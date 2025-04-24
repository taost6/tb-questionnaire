export function Label({ htmlFor, className = "", children, ...p }) {
  return (
    <label htmlFor={htmlFor} {...p} className={`block font-medium ${className}`}>
      {children}
    </label>
  );
}
