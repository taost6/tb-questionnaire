import * as React from "react";
import ReactDatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { cn } from "@/lib/utils";
import "react-datepicker/dist/react-datepicker.css";
import { enUS, ja, vi, th, km, bn, pt } from "date-fns/locale";
import { getLangPlaceholder } from "@/helper";

registerLocale("en", enUS);
registerLocale("jp", ja);
registerLocale("vi", vi);
registerLocale("th", th);
registerLocale("km", km);
registerLocale("bn", bn);
registerLocale("pt", pt);

const Input = React.forwardRef(({ className, type, validationError, lang = "en", ...props }, ref) => {
  if (type === "date") {
    // Map value prop to selected for ReactDatePicker
    const { value, ...rest } = props;
    return (
      <ReactDatePicker
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
          validationError && "border-red-500"
        )}
        locale={lang === "tl" || lang === "my" ? "en" : lang}
        ref={ref}
        selected={value}
        dateFormat="yyyy/MM/dd"
        placeholderText={getLangPlaceholder(lang, "birthDate")}
        autoComplete="off"
        {...rest}
      />
    );
  }

  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
        validationError && "border-red-500"
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };