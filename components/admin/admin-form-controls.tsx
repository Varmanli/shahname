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
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  value: string;
};

export function AdminField({ children, label, required }: AdminFieldProps) {
  return (
    <label className="grid gap-2.5 text-sm font-black text-foreground">
      <span className="flex items-center gap-1.5">
        {label}
        {required && <span className="font-bold text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}

const baseInputClasses = `
  w-full rounded-2xl border border-shah-gold-500/18 bg-white/80 px-5 py-3.5 text-base text-foreground
  shadow-sm backdrop-blur placeholder:text-muted-foreground transition-all duration-300
  focus:outline-none focus:ring-2 focus:ring-shah-gold-400/60 focus:border-shah-gold-500
  hover:border-shah-gold-500/45 dark:border-white/10 dark:bg-white/[0.055]
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
      className={`${baseInputClasses} min-h-24 resize-y ${className}`.trim()}
      {...props}
    />
  );
}

export function AdminSelect({
  className = "",
  onChange,
  options,
  placeholder,
  value,
}: AdminSelectProps) {
  return (
    <SelectControl
      className={className}
      onChange={(next) => onChange(next as string)}
      options={options}
      placeholder={placeholder}
      value={value}
      variant="admin"
    />
  );
}
