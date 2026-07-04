"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { FiCheck, FiSearch, FiX } from "react-icons/fi";

import { shouldUseUnoptimizedImage } from "@/lib/images";
import type { CharacterSummary } from "@/types/character";

type CharacterRelationSelectProps = {
  label: string;
  options: CharacterSummary[];
  value: string | string[];
  currentCharacterId?: string;
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
};

export function CharacterRelationSelect({
  currentCharacterId,
  label,
  multiple,
  onChange,
  options,
  value,
}: CharacterRelationSelectProps) {
  const [query, setQuery] = useState("");

  const selectedIds = Array.isArray(value) ? value : value ? [value] : [];

  const availableOptions = useMemo(
    () => options.filter((option) => option.id !== currentCharacterId),
    [currentCharacterId, options],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return availableOptions;

    return availableOptions.filter((option) =>
      `${option.name} ${option.shortTitle} ${option.dynasty}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [availableOptions, query]);

  const selectedOptions = selectedIds
    .map((id) => availableOptions.find((option) => option.id === id))
    .filter((option): option is CharacterSummary => Boolean(option));

  function toggle(id: string) {
    if (multiple) {
      onChange(
        selectedIds.includes(id)
          ? selectedIds.filter((selectedId) => selectedId !== id)
          : [...selectedIds, id],
      );
      return;
    }

    onChange(selectedIds.includes(id) ? "" : id);
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black text-foreground">{label}</span>

        {multiple && selectedOptions.length ? (
          <span className="rounded-full border border-shah-gold-500/12 bg-shah-gold-500/8 px-2.5 py-1 text-[10px] font-black text-shah-gold-800 dark:border-shah-gold-300/12 dark:text-shah-gold-100">
            {selectedOptions.length} انتخاب
          </span>
        ) : null}
      </div>

      <div className="rounded-2xl border border-shah-gold-500/12 bg-white/58 p-2 shadow-inner shadow-white/20 backdrop-blur-xl transition focus-within:border-shah-gold-500/32 focus-within:bg-white/72 focus-within:ring-4 focus-within:ring-shah-gold-500/8 dark:border-white/10 dark:bg-white/[0.035] dark:shadow-none dark:focus-within:bg-white/5.5">
        {selectedOptions.length ? (
          <div className="mb-2 flex max-h-20 flex-wrap gap-1.5 overflow-y-auto custom-scrollbar">
            {selectedOptions.map((option) => (
              <SelectedChip
                key={option.id}
                option={option}
                onRemove={() => toggle(option.id)}
              />
            ))}
          </div>
        ) : null}

        <div className="relative">
          <FiSearch
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/65"
          />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              availableOptions.length
                ? "جستجوی شخصیت..."
                : "هنوز شخصیت دیگری ثبت نشده است."
            }
            disabled={!availableOptions.length}
            className="h-9 w-full rounded-xl border border-shah-gold-500/10 bg-white/64 pr-9 pl-3 text-xs font-bold text-foreground outline-none transition placeholder:text-muted-foreground/55 focus:border-shah-gold-500/32 focus:bg-white disabled:cursor-not-allowed disabled:opacity-55 dark:border-white/10 dark:bg-black/16 dark:focus:bg-black/24"
          />
        </div>

        {availableOptions.length ? (
          <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-shah-gold-500/10 bg-white/42 p-1 custom-scrollbar dark:border-white/8 dark:bg-black/12">
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const selected = selectedIds.includes(option.id);

                return (
                  <OptionButton
                    key={option.id}
                    option={option}
                    selected={selected}
                    onClick={() => toggle(option.id)}
                  />
                );
              })
            ) : (
              <div className="grid place-items-center px-3 py-6 text-center">
                <div className="grid size-10 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <FiSearch aria-hidden className="size-4" />
                </div>
                <p className="mt-3 text-xs font-bold text-muted-foreground">
                  شخصیتی با این جستجو پیدا نشد.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-2 rounded-xl border border-shah-gold-500/10 bg-shah-gold-500/6 px-3 py-2 text-[11px] font-bold leading-5 text-muted-foreground dark:border-white/8 dark:bg-white/3">
            برای ساخت رابطه، ابتدا شخصیت‌های بیشتری اضافه کنید.
          </p>
        )}
      </div>
    </div>
  );
}

function SelectedChip({
  onRemove,
  option,
}: {
  option: CharacterSummary;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="group inline-flex max-w-full items-center gap-1.5 rounded-full border border-shah-gold-500/18 bg-shah-gold-500/10 py-1 pl-2 pr-1 text-[11px] font-black text-shah-gold-900 transition hover:border-red-400/35 hover:bg-red-500/10 hover:text-red-700 dark:border-shah-gold-300/12 dark:text-shah-gold-100 dark:hover:text-red-200"
    >
      <Avatar option={option} size="sm" />

      <span className="max-w-28 truncate">{option.name}</span>

      <span className="grid size-4 place-items-center rounded-full bg-current/8 transition group-hover:bg-current/12">
        <FiX aria-hidden className="size-3" />
      </span>
    </button>
  );
}

function OptionButton({
  onClick,
  option,
  selected,
}: {
  onClick: () => void;
  option: CharacterSummary;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-right transition ${
        selected
          ? "bg-shah-gold-500/12"
          : "hover:bg-shah-gold-500/8 dark:hover:bg-white/4.5"
      }`}
    >
      <Avatar option={option} size="md" />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-black text-foreground">
          {option.name}
        </span>

        <span className="mt-0.5 block truncate text-[10px] font-bold text-muted-foreground">
          {[option.shortTitle, option.dynasty].filter(Boolean).join("، ") ||
            "بدون توضیح"}
        </span>
      </span>

      <span
        className={`grid size-6 shrink-0 place-items-center rounded-full border text-[10px] font-black transition ${
          selected
            ? "border-shah-gold-500/24 bg-shah-gold-500 text-shah-black-950"
            : "border-shah-gold-500/12 text-muted-foreground group-hover:border-shah-gold-500/28 group-hover:text-shah-gold-800 dark:group-hover:text-shah-gold-100"
        }`}
      >
        {selected ? <FiCheck aria-hidden className="size-3.5" /> : "+"}
      </span>
    </button>
  );
}

function Avatar({
  option,
  size,
}: {
  option: CharacterSummary;
  size: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "size-5" : "size-8";
  const textClass = size === "sm" ? "text-[9px]" : "text-xs";

  return (
    <span
      className={`relative grid ${sizeClass} shrink-0 place-items-center overflow-hidden rounded-full border border-shah-gold-500/10 bg-muted text-muted-foreground`}
    >
      {option.avatar ? (
        <Image
          src={option.avatar}
          alt={option.name}
          fill
          sizes={size === "sm" ? "20px" : "32px"}
          className="object-cover"
          unoptimized={shouldUseUnoptimizedImage(option.avatar)}
        />
      ) : (
        <span className={`${textClass} font-black`}>
          {option.name.slice(0, 1)}
        </span>
      )}
    </span>
  );
}
