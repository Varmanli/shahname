"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

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
  const availableOptions = options.filter((option) => option.id !== currentCharacterId);
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return normalizedQuery
      ? availableOptions.filter((option) =>
          `${option.name} ${option.shortTitle} ${option.dynasty}`
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : availableOptions;
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
      <span className="text-base font-semibold text-foreground">{label}</span>
      <div className="rounded-2xl border border-border bg-card p-3">
        {selectedOptions.length ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => toggle(option.id)}
                className="inline-flex items-center gap-2 rounded-full border border-shah-gold-500/30 bg-shah-gold-50 px-2 py-1 text-xs font-bold text-shah-gold-900 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:bg-shah-gold-500/15 dark:text-shah-gold-100"
              >
                <Avatar option={option} />
                {option.name}
                <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        ) : null}
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={
            availableOptions.length
              ? "جستجوی شخصیت..."
              : "هنوز شخصیت دیگری ثبت نشده است."
          }
          disabled={!availableOptions.length}
          className="admin-input h-11 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        />
        {availableOptions.length ? (
          <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-border">
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const selected = selectedIds.includes(option.id);

                return (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => toggle(option.id)}
                    className={`flex w-full items-center gap-3 border-b border-border px-3 py-2 text-right last:border-b-0 transition hover:bg-muted ${
                      selected ? "bg-shah-gold-500/10" : "bg-transparent"
                    }`}
                  >
                    <Avatar option={option} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black text-foreground">
                        {option.name}
                      </span>
                      <span className="block truncate text-xs font-bold text-muted-foreground">
                        {[option.shortTitle, option.dynasty].filter(Boolean).join("، ")}
                      </span>
                    </span>
                    <span className="text-xs font-black text-shah-gold-700 dark:text-shah-gold-300">
                      {selected ? "انتخاب شده" : "انتخاب"}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-4 text-center text-sm font-bold text-muted-foreground">
                شخصیتی با این جستجو پیدا نشد.
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-xs font-bold text-muted-foreground">
            برای ساخت رابطه، ابتدا شخصیت‌های بیشتری اضافه کنید.
          </p>
        )}
      </div>
    </div>
  );
}

function Avatar({ option }: { option: CharacterSummary }) {
  return (
    <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted">
      {option.avatar ? (
        <Image src={option.avatar} alt={option.name} fill sizes="32px" className="object-cover" />
      ) : (
        <span className="grid h-full place-items-center text-xs font-black">
          {option.name.slice(0, 1)}
        </span>
      )}
    </span>
  );
}
