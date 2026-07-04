"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  FiCheck,
  FiImage,
  FiSave,
  FiSearch,
  FiStar,
  FiX,
} from "react-icons/fi";

import { shouldUseUnoptimizedImage } from "@/lib/images";
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
  const [homeStoryIds, setHomeStoryIds] = useState(
    initialSettings.homeStoryIds,
  );
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
    <section className="relative overflow-visible rounded-[1.7rem] border border-shah-gold-500/14 bg-white/72 p-4 text-card-foreground shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5 md:p-5">
      <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-shah-gold-500/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-12 size-72 rounded-full bg-shah-lapis-500/8 blur-3xl" />

      <div className="relative grid gap-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-shah-gold-500/14 bg-shah-gold-500/8 px-3 py-1.5 text-[11px] font-black text-shah-gold-800 dark:border-shah-gold-300/12 dark:text-shah-gold-100">
              <FiStar aria-hidden className="size-3.5" />
              Featured Home
            </div>

            <h2 className="mt-3 text-xl font-black text-foreground md:text-2xl">
              انتخاب‌های صفحه اصلی
            </h2>

            <p className="mt-2 max-w-2xl text-xs font-bold leading-6 text-muted-foreground md:text-sm">
              حداکثر {toFaNumber(MAX_ITEMS)} شخصیت و {toFaNumber(MAX_ITEMS)}{" "}
              روایت در صفحه اصلی برجسته نمایش داده می‌شوند.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:w-72">
            <FeaturedStat label="شخصیت‌ها" value={homeCharacterIds.length} />
            <FeaturedStat label="روایت‌ها" value={homeStoryIds.length} />
          </div>
        </header>

        {status ? <StatusMessage message={status} /> : null}

        <FeaturedPicker
          items={characterItems}
          placeholder="جستجو در نام، لقب، نقش یا تبار شخصیت..."
          selectedIds={homeCharacterIds}
          title="شخصیت‌های صفحه اصلی"
          eyebrow="Characters"
          onToggle={(id) =>
            setHomeCharacterIds((current) => toggleSelection(current, id))
          }
        />

        <FeaturedPicker
          items={storyItems}
          placeholder="جستجو در عنوان، خلاصه یا شخصیت‌های روایت..."
          selectedIds={homeStoryIds}
          title="روایت‌های صفحه اصلی"
          eyebrow="Stories"
          onToggle={(id) =>
            setHomeStoryIds((current) => toggleSelection(current, id))
          }
        />

        <div className="sticky bottom-4 z-20 flex justify-end rounded-2xl border border-shah-gold-500/12 bg-white/80 p-3 shadow-2xl shadow-shah-black-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-shah-black-950/80">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-black shadow-lg transition active:scale-95 ${
              isSaving
                ? "cursor-not-allowed bg-shah-lapis-900/55 text-white/65"
                : "bg-shah-lapis-900 text-shah-gold-100 shadow-shah-lapis-900/15 hover:-translate-y-0.5 hover:bg-shah-lapis-800 hover:text-white dark:bg-shah-gold-500 dark:text-shah-black-950 dark:hover:bg-shah-gold-400"
            }`}
          >
            <FiSave aria-hidden className="size-4" />
            {isSaving ? "در حال ذخیره..." : "ذخیره انتخاب‌ها"}
          </button>
        </div>
      </div>
    </section>
  );
}

function FeaturedPicker({
  eyebrow,
  items,
  onToggle,
  placeholder,
  selectedIds,
  title,
}: {
  eyebrow: string;
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
    <section className="rounded-[1.45rem] border border-shah-gold-500/12 bg-white/52 p-3 shadow-inner shadow-white/20 dark:border-white/8 dark:bg-black/12 dark:shadow-none md:p-4">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-shah-gold-800 dark:text-shah-gold-200">
            {eyebrow}
          </p>

          <h3 className="mt-2 text-base font-black text-foreground md:text-lg">
            {title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-8 items-center rounded-full border border-shah-gold-500/14 bg-shah-gold-500/8 px-3 text-[11px] font-black text-shah-gold-800 dark:border-shah-gold-300/12 dark:text-shah-gold-100">
            {toFaNumber(selectedIds.length)} از {toFaNumber(MAX_ITEMS)}
          </span>

          {selectedIds.length >= MAX_ITEMS ? (
            <span className="inline-flex h-8 items-center rounded-full border border-emerald-500/16 bg-emerald-500/8 px-3 text-[11px] font-black text-emerald-700 dark:text-emerald-200">
              تکمیل
            </span>
          ) : null}
        </div>
      </div>

      <label className="relative block">
        <span className="sr-only">جستجو در {title}</span>

        <FiSearch
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/70"
        />

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-2xl border border-shah-gold-500/12 bg-white/70 pr-12 pl-12 text-sm font-bold text-foreground outline-none backdrop-blur-xl transition placeholder:text-muted-foreground/60 focus:border-shah-gold-500/35 focus:bg-white focus:ring-4 focus:ring-shah-gold-500/8 dark:border-white/10 dark:bg-white/4.5 dark:focus:bg-white/7.5"
        />

        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="پاک کردن جستجو"
            className="absolute left-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-xl text-muted-foreground transition hover:bg-shah-gold-500/10 hover:text-foreground"
          >
            <FiX aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </label>

      {selectedItems.length ? (
        <div className="mt-4 grid gap-2">
          <p className="text-xs font-black text-muted-foreground">
            انتخاب‌شده‌ها
          </p>

          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item, index) => (
              <SelectedChip
                key={item.id}
                item={item}
                index={index}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
        <div className="mt-4 rounded-2xl border border-dashed border-shah-gold-500/18 bg-white/52 px-4 py-8 text-center dark:border-white/10 dark:bg-white/[0.035]">
          <p className="text-sm font-black text-foreground">
            نتیجه‌ای پیدا نشد
          </p>
          <p className="mt-2 text-xs font-bold text-muted-foreground">
            عبارت جستجو را کوتاه‌تر یا دقیق‌تر وارد کن.
          </p>
        </div>
      ) : null}

      {hiddenCount ? (
        <p className="mt-3 text-xs font-bold leading-6 text-muted-foreground">
          {toFaNumber(hiddenCount)} مورد دیگر پنهان است؛ برای محدود کردن
          نتیجه‌ها جستجو کن.
        </p>
      ) : null}
    </section>
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
      className={`group relative flex min-h-20 items-center gap-3 rounded-2xl border p-2.5 text-right shadow-lg shadow-shah-black-900/4 transition disabled:cursor-not-allowed disabled:opacity-45 ${
        selected
          ? "border-shah-gold-500/42 bg-shah-gold-500/12"
          : "border-shah-gold-500/12 bg-white/64 hover:-translate-y-0.5 hover:border-shah-gold-500/35 hover:bg-white dark:border-white/8 dark:bg-white/4 dark:hover:bg-white/[0.07]"
      }`}
    >
      <ItemImage item={item} />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black text-foreground">
          {item.title}
        </span>

        <span className="mt-0.5 line-clamp-2 text-[11px] font-bold leading-5 text-muted-foreground">
          {item.subtitle}
        </span>
      </span>

      {selected ? (
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-shah-gold-500 text-xs font-black text-shah-black-950 shadow-lg shadow-shah-gold-500/15">
          {toFaNumber(selectedIndex + 1)}
        </span>
      ) : (
        <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-shah-gold-500/12 bg-shah-gold-500/8 text-shah-gold-800 opacity-0 transition group-hover:opacity-100 dark:text-shah-gold-100">
          <FiCheck aria-hidden className="size-4" />
        </span>
      )}
    </button>
  );
}

function SelectedChip({
  index,
  item,
  onToggle,
}: {
  index: number;
  item: SelectableItem;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(item.id)}
      className="group inline-flex max-w-full items-center gap-2 rounded-full border border-shah-gold-500/18 bg-shah-gold-500/10 py-1 pl-1 pr-1 text-xs font-black text-foreground transition hover:border-red-400/35 hover:bg-red-500/10 hover:text-red-700 dark:border-shah-gold-300/12 dark:hover:text-red-200"
    >
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-shah-gold-500 text-[10px] font-black text-shah-black-950">
        {toFaNumber(index + 1)}
      </span>

      <span className="max-w-36 truncate">{item.title}</span>

      <span className="grid size-6 place-items-center rounded-full bg-current/8 transition group-hover:bg-current/12">
        <FiX aria-hidden className="size-3.5" />
      </span>
    </button>
  );
}

function ItemImage({ item }: { item: SelectableItem }) {
  return (
    <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-shah-gold-500/14 bg-shah-lapis-900 text-sm font-black text-shah-gold-100">
      {item.image ? (
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="48px"
          className="object-cover transition duration-500 group-hover:scale-110"
          unoptimized={shouldUseUnoptimizedImage(item.image)}
        />
      ) : (
        <span className="grid h-full w-full place-items-center bg-shah-lapis-950">
          <FiImage aria-hidden className="size-4 text-shah-gold-200" />
        </span>
      )}
    </span>
  );
}

function FeaturedStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-shah-gold-500/12 bg-shah-gold-500/8 px-4 py-3 dark:border-white/8 dark:bg-white/[0.035]">
      <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-black text-foreground">
        {toFaNumber(value)} / {toFaNumber(MAX_ITEMS)}
      </p>
    </div>
  );
}

function StatusMessage({ message }: { message: string }) {
  const isSuccess = message.includes("ذخیره شد");

  return (
    <div
      className={`rounded-[1.25rem] border px-4 py-3 text-sm font-black leading-7 shadow-lg ${
        isSuccess
          ? "border-emerald-500/18 bg-emerald-500/10 text-emerald-700 shadow-emerald-950/5 dark:text-emerald-200"
          : "border-red-500/18 bg-red-50/90 text-red-700 shadow-red-950/5 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200"
      }`}
    >
      {message}
    </div>
  );
}
