"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  variant?: "filter" | "admin" | "toolbar";
};

type MenuRect = {
  left: number;
  top: number;
  width: number;
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
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<MenuRect | null>(null);

  // بستن منو با کلیک به بیرون (چه روی دکمه، چه روی منوی پورتال‌شده)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideTrigger = detailsRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);

      if (!insideTrigger && !insideMenu) {
        detailsRef.current?.removeAttribute("open");
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // موقعیت منو را با پورتال به بدنه سند محاسبه می‌کنیم تا هیچ stacking
  // context یا overflow-hidden والدی نتواند آن را ببرد زیر بخش‌های دیگر.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateRect = () => {
      const el = detailsRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setMenuRect({ left: rect.left, top: rect.bottom + 8, width: rect.width });
    };

    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);

    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [isOpen]);

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

  const portalTarget = typeof document === "undefined" ? null : document.body;

  return (
    <>
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
          <div className="flex min-w-0 items-center gap-2.5">
            {icon && (
              <span className="text-shah-gold-400 opacity-80">{icon}</span>
            )}
            <span className="truncate tracking-tight">{label}</span>
          </div>
          <FiChevronDown
            className={`h-4 w-4 shrink-0 text-shah-gold-400/50 transition-transform duration-500 ${
              isOpen ? "rotate-180 text-shah-gold-400" : ""
            }`}
          />
        </summary>
      </details>

      {isOpen && menuRect && portalTarget
        ? createPortal(
            <div
              ref={menuRef}
              style={{
                top: menuRect.top,
                left: menuRect.left,
                width: variant === "filter" ? undefined : menuRect.width,
              }}
              className={`
                fixed z-100 animate-in fade-in zoom-in-95 duration-200
                ${dropdownClasses[variant]}
              `}
            >
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[inherit] p-1.5 custom-scrollbar">
                {options.length > 0 ? (
                  options.map((option) => {
                    const active = selectedValues.includes(option.value);

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => selectValue(option.value)}
                        className={`
                          group flex w-full items-center justify-between gap-3 rounded-xl
                          px-3 py-2 text-right text-sm font-bold transition-all duration-200
                          ${
                            active
                              ? "bg-shah-gold-500/90 text-shah-black-950 shadow-md shadow-shah-gold-500/20"
                              : "text-white/75 hover:bg-white/8 hover:text-white"
                          }
                        `}
                      >
                        <span className="truncate">{option.label}</span>
                        {active ? (
                          <FiCheck className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-white/15 transition-colors group-hover:bg-white/30" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-6 text-center text-xs font-medium text-white/50">
                    موردی یافت نشد
                  </div>
                )}
              </div>
            </div>,
            portalTarget,
          )
        : null}
    </>
  );
}

const triggerClasses = {
  admin: `
    flex h-11 cursor-pointer items-center justify-between gap-2.5 rounded-xl
    border border-shah-gold-500/16 bg-white/80 px-3.5
    text-right text-[13px] font-bold text-foreground shadow-sm backdrop-blur-xl
    hover:border-shah-gold-500/40 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07] dark:hover:border-white/20
  `,
  filter: `
    flex h-13 cursor-pointer items-center justify-between gap-3 rounded-full
    border border-border bg-background/60 px-5
    text-sm font-black text-foreground/90 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl
    hover:bg-background/90 hover:border-accent/30
    dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]
  `,
  toolbar: `
    flex h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl
    border border-shah-gold-500/12 bg-white/70 px-4
    text-sm font-bold text-foreground outline-none backdrop-blur-xl transition
    hover:border-shah-gold-500/35 hover:bg-white
    dark:border-white/10 dark:bg-white/4.5 dark:hover:bg-white/7.5
  `,
};

// دراپ‌داون همیشه با استایل تیره مدیریتی پرمیوم نمایش داده می‌شود، صرف‌نظر
// از تم روشن/تاریک صفحه، چون از طریق پورتال بیرون از استک بصری فرم رندر می‌شود.
const dropdownClasses = {
  admin: `
    max-h-72 min-w-56 overflow-hidden rounded-2xl
    border border-shah-gold-500/20 bg-shah-black-950/95 shadow-2xl shadow-black/50
    backdrop-blur-xl
  `,
  filter: `
    max-h-96 w-72 overflow-hidden rounded-[1.75rem]
    border border-shah-gold-500/20 bg-shah-black-950/95 shadow-2xl shadow-black/50
    backdrop-blur-xl
  `,
  toolbar: `
    max-h-80 min-w-56 overflow-hidden rounded-2xl
    border border-shah-gold-500/20 bg-shah-black-950/95 shadow-2xl shadow-black/50
    backdrop-blur-xl
  `,
};

function toFaNumber(value: number | string) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}
