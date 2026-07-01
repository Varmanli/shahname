"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

import type { Character } from "@/types/character";
import type { SiteSettings } from "@/types/site-settings";
import type { Story } from "@/types/story";

type HomeFeaturedSettingsProps = {
  characters: Character[];
  initialSettings: SiteSettings;
  stories: Story[];
};

type SelectableItem = {
  id: string;
  image: string;
  searchText: string;
  subtitle: string;
  title: string;
};

const MAX_ITEMS = 6;
const INITIAL_RESULT_COUNT = 8;

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

function toggleSelection(current: string[], id: string) {
  if (current.includes(id)) return current.filter((item) => item !== id);
  if (current.length >= MAX_ITEMS) return current;
  return [...current, id];
}

function getCharacterImage(character: Character) {
  return character.portraitImage.trim() || character.sceneImage.trim();
}

function normalizeSearch(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}

export function HomeFeaturedSettings({
  characters,
  initialSettings,
  stories,
}: HomeFeaturedSettingsProps) {
  const [homeCharacterIds, setHomeCharacterIds] = useState(
    initialSettings.homeCharacterIds,
  );
  const [homeStoryIds, setHomeStoryIds] = useState(initialSettings.homeStoryIds);
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setStatus("");

    const response = await fetch("/api/settings/home-featured", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ homeCharacterIds, homeStoryIds }),
    });
    const payload = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setStatus(payload.message ?? "ذخیره تنظیمات با خطا روبه‌رو شد.");
      return;
    }

    setStatus("تنظیمات صفحه اصلی ذخیره شد.");
  }

  const characterItems = characters.map((character) => ({
    id: character.id,
    title: character.name,
    subtitle: character.title || character.role || "شخصیت شاهنامه",
    image: getCharacterImage(character),
    searchText: [
      character.name,
      character.title,
      character.role,
      character.dynasty,
      character.nationality,
      character.nameMeaning,
      character.slug,
      ...character.epithets,
      ...character.enemies,
      ...character.achievements,
      ...character.traits.map((trait) => trait.key),
    ]
      .filter(Boolean)
      .join(" "),
  }));

  const storyItems = stories.map((story) => ({
    id: story.id,
    title: story.title,
    subtitle: story.subtitle || story.shortDescription,
    image: story.coverImage,
    searchText: [
      story.title,
      story.subtitle,
      story.shortDescription,
      story.slug,
      ...story.characters.map((character) => character.name),
    ]
      .filter(Boolean)
      .join(" "),
  }));

  return (
    <section className="grid gap-6 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <header className="text-right">
        <h2 className="text-2xl font-black text-foreground">انتخاب‌های صفحه اصلی</h2>
        <p className="mt-2 text-sm font-medium leading-7 text-muted-foreground">
          ۶ شخصیت و ۶ روایت انتخاب‌شده در صفحه اصلی نمایش داده می‌شوند.
        </p>
      </header>

      {status ? (
        <div className="rounded-2xl border border-shah-gold-500/25 bg-shah-gold-500/10 px-5 py-4 text-sm font-bold text-shah-gold-800 dark:text-shah-gold-100">
          {status}
        </div>
      ) : null}

      <FeaturedPicker
        items={characterItems}
        placeholder="جستجو در نام، لقب، نقش یا تبار شخصیت..."
        selectedIds={homeCharacterIds}
        title="شخصیت‌های صفحه اصلی"
        onToggle={(id) =>
          setHomeCharacterIds((current) => toggleSelection(current, id))
        }
      />

      <FeaturedPicker
        items={storyItems}
        placeholder="جستجو در عنوان، خلاصه، برچسب یا شخصیت‌های روایت..."
        selectedIds={homeStoryIds}
        title="روایت‌های صفحه اصلی"
        onToggle={(id) => setHomeStoryIds((current) => toggleSelection(current, id))}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="h-12 rounded-xl bg-primary px-8 text-base font-bold text-white shadow-md transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "در حال ذخیره..." : "ذخیره انتخاب‌ها"}
        </button>
      </div>
    </section>
  );
}

function FeaturedPicker({
  items,
  onToggle,
  placeholder,
  selectedIds,
  title,
}: {
  items: SelectableItem[];
  onToggle: (id: string) => void;
  placeholder: string;
  selectedIds: string[];
  title: string;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearch(query);
  const itemById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );
  const selectedItems = selectedIds
    .map((id) => itemById.get(id))
    .filter((item): item is SelectableItem => Boolean(item));
  const filteredItems = useMemo(() => {
    if (!normalizedQuery) return items;

    return items.filter((item) => {
      const searchable = normalizeSearch(
        `${item.title} ${item.subtitle} ${item.searchText}`,
      );

      return searchable.includes(normalizedQuery);
    });
  }, [items, normalizedQuery]);
  const visibleItems = normalizedQuery
    ? filteredItems
    : filteredItems.slice(0, INITIAL_RESULT_COUNT);
  const hiddenCount = Math.max(filteredItems.length - visibleItems.length, 0);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-black text-foreground">{title}</h3>
        <span className="rounded-xl border border-shah-lapis-700/20 bg-shah-lapis-700/5 px-4 py-2 text-sm font-black text-shah-lapis-800 dark:text-shah-lapis-100">
          {toFaNumber(selectedIds.length)} از {toFaNumber(MAX_ITEMS)}
        </span>
      </div>

      <label className="relative block">
        <span className="sr-only">جستجو در {title}</span>
        <FiSearch
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="admin-input pe-12 ps-12"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="پاک کردن جستجو"
            className="absolute left-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <FiX aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </label>

      {selectedItems.length ? (
        <div className="grid gap-2">
          <p className="text-xs font-black text-muted-foreground">انتخاب‌شده‌ها</p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {selectedItems.map((item, index) => (
              <SelectableButton
                key={item.id}
                item={item}
                onToggle={onToggle}
                selected
                selectedIndex={index}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => {
          const selectedIndex = selectedIds.indexOf(item.id);
          const selected = selectedIndex !== -1;
          const disabled = !selected && selectedIds.length >= MAX_ITEMS;

          return (
            <SelectableButton
              key={item.id}
              item={item}
              onToggle={onToggle}
              disabled={disabled}
              selected={selected}
              selectedIndex={selectedIndex}
            />
          );
        })}
      </div>

      {!visibleItems.length ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm font-bold text-muted-foreground">
          نتیجه‌ای برای این جستجو پیدا نشد.
        </div>
      ) : null}

      {hiddenCount ? (
        <p className="text-xs font-bold text-muted-foreground">
          {toFaNumber(hiddenCount)} مورد دیگر پنهان است؛ برای محدود کردن نتیجه‌ها جستجو کن.
        </p>
      ) : null}
    </div>
  );
}

function SelectableButton({
  disabled,
  item,
  onToggle,
  selected,
  selectedIndex,
}: {
  disabled?: boolean;
  item: SelectableItem;
  onToggle: (id: string) => void;
  selected: boolean;
  selectedIndex: number;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(item.id)}
      disabled={disabled}
      className={`group flex min-h-24 items-center gap-4 rounded-2xl border p-3 text-right shadow-sm transition disabled:cursor-not-allowed disabled:opacity-45 ${
        selected
          ? "border-shah-gold-500 bg-shah-gold-500/10"
          : "border-border bg-muted/20 hover:border-shah-gold-500/45 hover:bg-shah-gold-500/5"
      }`}
    >
      <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-shah-gold-500/20 bg-shah-lapis-700 text-sm font-black text-white">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="64px"
            className="object-cover"
            unoptimized={item.image.startsWith("/uploads/")}
          />
        ) : (
          item.title.slice(0, 1)
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-black text-foreground">
          {item.title}
        </span>
        <span className="mt-1 line-clamp-2 text-xs font-bold leading-6 text-muted-foreground">
          {item.subtitle}
        </span>
      </span>
      {selected ? (
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-shah-gold-500 text-sm font-black text-shah-black-950">
          {toFaNumber(selectedIndex + 1)}
        </span>
      ) : null}
    </button>
  );
}
