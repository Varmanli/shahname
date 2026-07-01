"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { Character } from "@/types/character";

type CharactersListProps = {
  characters: Character[];
};

function richTextToPlainText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasLineageRelations(character: Character) {
  return Boolean(
    character.fatherId ||
      character.motherId ||
      character.spouseIds.length ||
      character.childrenIds.length ||
      character.siblingIds.length ||
      character.relations.length,
  );
}

export function CharactersList({
  characters: initialCharacters,
}: CharactersListProps) {
  const [characters, setCharacters] = useState(initialCharacters);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredCharacters = normalizedQuery
    ? characters.filter((character) =>
        `${character.name} ${character.title} ${character.role} ${character.nationality} ${character.nameMeaning} ${character.dynasty}`
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : characters;

  async function handleDelete(character: Character) {
    const confirmed = window.confirm(`شخصیت «${character.name}» حذف شود؟`);
    if (!confirmed) return;

    const response = await fetch(`/api/characters/${character.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = await response.json();
      setStatus(payload.message ?? "حذف شخصیت با خطا روبه‌رو شد.");
      return;
    }

    setCharacters((current) =>
      current.filter((item) => item.id !== character.id),
    );
    setStatus("");
  }

  return (
    <section>
      {/* Search + Count */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-md md:flex-row md:items-center md:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو بر اساس نام یا لقب"
          className="admin-input md:max-w-md text-base"
        />
        <p className="text-base font-bold text-muted-foreground mt-2 md:mt-0">
          {filteredCharacters.length} شخصیت
        </p>
      </div>

      {/* Status */}
      {status && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-base font-bold text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {status}
        </div>
      )}

      {/* Empty state */}
      {filteredCharacters.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-8 py-20 text-center text-card-foreground">
          <h2 className="text-xl font-extrabold">شخصیتی پیدا نشد</h2>
          <p className="mt-3 text-base text-muted-foreground">
            از منوی ایجاد شخصیت جدید، اولین شخصیت را ثبت کنید.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCharacters.map((character) => (
            <article
              key={character.id}
              className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-md transition hover:shadow-lg"
            >
              {/* Banner */}
              <div className="relative aspect-video w-full bg-zinc-900">
                {character.sceneImage ? (
                  <Image
                    src={character.sceneImage}
                    alt={`بنر ${character.name}`}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-l from-shah-lapis-900 via-zinc-900 to-shah-gold-900" />
                )}
              </div>

              {/* Content */}
              <div className="relative px-6 pb-6">
                <div className="relative -mt-16 h-28 w-28 overflow-hidden rounded-xl border-4 border-card bg-muted shadow-lg">
                  <Image
                    src={character.portraitImage}
                    alt={character.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <h2 className="mt-4 text-2xl font-extrabold">
                  {character.name}
                </h2>
                {character.role || character.title ? (
                  <p className="mt-1 text-base font-bold text-accent">
                    {character.role || character.title}
                  </p>
                ) : null}
                {character.nationality || character.nameMeaning ? (
                  <p className="mt-2 text-sm font-bold leading-6 text-muted-foreground">
                    {[character.nationality, character.nameMeaning]
                      .filter(Boolean)
                      .join("، ")}
                  </p>
                ) : null}
                <div className="mt-3">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${
                      hasLineageRelations(character)
                        ? "border-shah-gold-500/35 bg-shah-gold-500/10 text-shah-gold-800 dark:text-shah-gold-200"
                        : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {hasLineageRelations(character)
                      ? "دارای تبارنامه"
                      : "بدون رابطه تبارنامه‌ای"}
                  </span>
                </div>
                {character.shortDescription ? (
                  <p className="mt-3 line-clamp-2 text-base leading-7 text-muted-foreground">
                    {richTextToPlainText(character.shortDescription)}
                  </p>
                ) : null}

                {/* Actions */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <Link
                    href={`/characters/${encodeURIComponent(character.slug)}`}
                    className="flex h-12 items-center justify-center rounded-lg border border-border text-base font-bold transition hover:border-accent hover:text-accent"
                  >
                    نمایش
                  </Link>
                  <Link
                    href={`/admin/characters/${character.id}/edit`}
                    className="flex h-12 flex-1 items-center justify-center rounded-lg border border-border text-base font-bold transition hover:border-accent hover:text-accent"
                  >
                    ویرایش
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(character)}
                    className="h-12 flex-1 rounded-lg border border-red-200 bg-red-50 text-base font-bold text-red-700 transition hover:bg-red-100"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
