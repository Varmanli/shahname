"use client";

import { useRef, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectControlProps = {
  className?: string;
  disabled?: boolean;
  emptyLabel?: string;
  icon?: ReactNode;
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
  options: SelectOption[];
  placeholder: string;
  value: string | string[];
  variant?: "filter" | "admin";
};

export function SelectControl({
  className = "",
  disabled = false,
  emptyLabel,
  icon,
  multiple = false,
  onChange,
  options,
  placeholder,
  value,
  variant = "filter",
}: SelectControlProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // بستن منو با کلیک به بیرون
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        detailsRef.current &&
        !detailsRef.current.contains(event.target as Node)
      ) {
        detailsRef.current.removeAttribute("open");
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value),
  );

  const label =
    selectedOptions.length > 0
      ? multiple
        ? `${placeholder} (${toFaNumber(selectedOptions.length)})`
        : selectedOptions[0].label
      : (emptyLabel ?? placeholder);

  function selectValue(nextValue: string) {
    if (disabled) return;

    if (multiple) {
      const next = selectedValues.includes(nextValue)
        ? selectedValues.filter((item) => item !== nextValue)
        : [...selectedValues, nextValue];
      onChange(next);
      return;
    }

    onChange(nextValue);
    detailsRef.current?.removeAttribute("open");
    setIsOpen(false);
  }

  return (
    <details
      ref={detailsRef}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
      className={`group relative w-full ${disabled ? "pointer-events-none opacity-40" : ""} ${className}`}
    >
      <summary
        className={`
          list-none transition-all duration-300 outline-none
          ${triggerClasses[variant]}
          ${isOpen ? "ring-2 ring-shah-gold-400/50 border-shah-gold-400/50" : ""}
        `}
      >
        <div className="flex min-w-0 items-center gap-3">
          {icon && (
            <span className="text-shah-gold-400 opacity-80">{icon}</span>
          )}
          <span className="truncate tracking-tight">{label}</span>
        </div>
        <FiChevronDown
          className={`h-5 w-5 shrink-0 text-shah-gold-400/50 transition-transform duration-500 ${
            isOpen ? "rotate-180 text-shah-gold-400" : ""
          }`}
        />
      </summary>

      <div
        className={`
        ${dropdownClasses[variant]}
        animate-in fade-in zoom-in-95 duration-300
      `}
      >
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[inherit] p-2 custom-scrollbar">
          {options.length > 0 ? (
            options.map((option) => {
              const active = selectedValues.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectValue(option.value)}
                  className={`
                    group flex w-full items-center justify-between gap-3 rounded-[1.25rem] 
                    px-4 py-3.5 text-right text-sm transition-all duration-200
                    ${
                      active
                        ? "bg-shah-gold-400 text-black font-black shadow-lg shadow-shah-gold-400/20"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {active ? (
                    <FiCheck className="h-4 w-4 shrink-0" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-white/10 group-hover:bg-shah-gold-400/40 transition-colors" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center text-xs text-white/30 font-medium">
              موردی یافت نشد
            </div>
          )}
        </div>
      </div>
    </details>
  );
}

const triggerClasses = {
  admin: `
    flex h-16 cursor-pointer items-center justify-between gap-3 rounded-2xl 
    border border-white/10 bg-white/[0.03] px-6 
    text-right text-base font-bold text-white shadow-inner backdrop-blur-xl
    hover:bg-white/[0.06] hover:border-white/20
  `,
  filter: `
    flex h-13 cursor-pointer items-center justify-between gap-3 rounded-full 
    border border-white/5 bg-black/40 px-5 
    text-sm font-black text-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-2xl
    hover:bg-black/60 hover:border-shah-gold-400/30
  `,
};

const dropdownClasses = {
  admin: `
    absolute right-0 top-[calc(100%+0.75rem)] z-50 
    max-h-80 w-full min-w-64 overflow-hidden rounded-[2rem] 
    border border-white/10 bg-[#0c1a2b]/95 shadow-[0_30px_90px_rgba(0,0,0,0.8)] 
    backdrop-blur-3xl
  `,
  filter: `
    absolute left-0 top-[calc(100%+0.75rem)] z-50 
    max-h-96 w-72 overflow-hidden rounded-[2.25rem] 
    border border-shah-gold-400/20 bg-[#071426]/98 shadow-[0_40px_100px_rgba(0,0,0,0.9)] 
    backdrop-blur-3xl
  `,
};

function toFaNumber(value: number | string) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}
