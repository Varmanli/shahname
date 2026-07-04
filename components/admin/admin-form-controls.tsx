import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

import { SelectControl, type SelectOption } from "@/components/select-control";

type AdminFieldProps = {
  children: ReactNode;
  label: string;
  required?: boolean;
};

type AdminTextInputProps = InputHTMLAttributes<HTMLInputElement>;
type AdminTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;
type AdminSelectProps = {
  className?: string;
  icon?: ReactNode;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  value: string;
  variant?: "admin" | "toolbar";
};

export function AdminField({ children, label, required }: AdminFieldProps) {
  return (
    <label className="grid gap-1.5 text-[13px] font-bold text-foreground">
      <span className="flex items-center gap-1.5">
        {label}
        {required && <span className="font-bold text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}

const baseInputClasses = `
  w-full h-11 rounded-xl border border-shah-gold-500/16 bg-white/80 px-3.5 text-[13px] text-foreground
  shadow-sm backdrop-blur placeholder:text-muted-foreground/70 transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-shah-gold-400/45 focus:border-shah-gold-500
  hover:border-shah-gold-500/40 dark:border-white/10 dark:bg-white/[0.045]
`;

export function AdminTextInput({
  className = "",
  ...props
}: AdminTextInputProps) {
  return (
    <input className={`${baseInputClasses} ${className}`.trim()} {...props} />
  );
}

export function AdminTextarea({
  className = "",
  ...props
}: AdminTextareaProps) {
  return (
    <textarea
      className={`${baseInputClasses.replace("h-11", "min-h-20")} resize-y py-2.5 ${className}`.trim()}
      {...props}
    />
  );
}

export function AdminSelect({
  className = "",
  icon,
  onChange,
  options,
  placeholder,
  value,
  variant = "admin",
}: AdminSelectProps) {
  return (
    <SelectControl
      className={className}
      icon={icon}
      onChange={(next) => onChange(next as string)}
      options={options}
      placeholder={placeholder}
      value={value}
      variant={variant}
    />
  );
}
