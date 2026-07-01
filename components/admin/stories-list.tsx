"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { Story } from "@/types/story";

type StoriesListProps = {
  stories: Story[];
};

export function StoriesList({ stories: initialStories }: StoriesListProps) {
  const [stories, setStories] = useState(initialStories);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const filteredStories = stories.filter((story) =>
    `${story.title} ${story.subtitle} ${story.shortDescription}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  async function handleDelete(story: Story) {
    const confirmed = window.confirm(`داستان «${story.title}» حذف شود؟`);
    if (!confirmed) return;

    const response = await fetch(`/api/stories/${story.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = await response.json();
      setStatus(payload.message ?? "حذف داستان با خطا روبه‌رو شد.");
      return;
    }

    setStories((current) => current.filter((item) => item.id !== story.id));
    setStatus("");
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-md md:flex-row md:items-center md:justify-between">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جستجو بر اساس عنوان یا خلاصه"
          className="admin-input md:max-w-md text-base"
        />
        <p className="text-base font-bold text-muted-foreground">
          {filteredStories.length} داستان
        </p>
      </div>

      {status ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-base font-bold text-red-700">
          {status}
        </div>
      ) : null}

      {filteredStories.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredStories.map((story) => (
            <article
              key={story.id}
              className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-md"
            >
              <div className="relative aspect-video bg-shah-lapis-950">
                {story.coverImage ? (
                  <Image
                    src={story.coverImage}
                    alt={story.title}
                    fill
                    sizes="(min-width: 1280px) 33vw, 100vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="grid gap-3 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">{story.title}</h2>
                    <p className="mt-1 text-sm font-bold text-accent">
                      رتبه زمانی {story.order}
                    </p>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">
                  {story.shortDescription}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Link
                    href={`/stories/${encodeURIComponent(story.slug)}`}
                    className="flex h-11 items-center justify-center rounded-lg border border-border text-sm font-bold transition hover:border-accent hover:text-accent"
                  >
                    نمایش
                  </Link>
                  <Link
                    href={`/admin/stories/${story.id}/edit`}
                    className="flex h-11 items-center justify-center rounded-lg border border-border text-sm font-bold transition hover:border-accent hover:text-accent"
                  >
                    ویرایش
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(story)}
                    className="h-11 rounded-lg border border-red-200 bg-red-50 text-sm font-bold text-red-700 transition hover:bg-red-100"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card px-8 py-20 text-center">
          <h2 className="text-xl font-extrabold">داستانی پیدا نشد</h2>
          <p className="mt-3 text-base text-muted-foreground">
            از مسیر ایجاد داستان جدید، اولین روایت را ثبت کنید.
          </p>
        </div>
      )}
    </section>
  );
}
