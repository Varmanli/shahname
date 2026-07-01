import type { MetadataRoute } from "next";

import { readCharacters } from "@/lib/character-store";
import { absoluteUrl } from "@/lib/seo";
import { readStories } from "@/lib/story-store";

// نقشه سایت همیشه با داده‌های زنده ساخته می‌شود تا روایت‌ها و شخصیت‌های تازه را پوشش دهد.
export const dynamic = "force-dynamic";

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/stories", changeFrequency: "weekly", priority: 0.9 },
  { path: "/characters", changeFrequency: "weekly", priority: 0.9 },
  { path: "/lineage", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.3 },
  { path: "/search", changeFrequency: "monthly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const base: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const [stories, characters] = await Promise.all([
      readStories(),
      readCharacters(),
    ]);

    const storyRoutes: MetadataRoute.Sitemap = stories.map((story) => ({
      url: absoluteUrl(`/stories/${encodeURIComponent(story.slug)}`),
      lastModified: story.updatedAt ? new Date(story.updatedAt) : now,
      changeFrequency: "monthly",
      priority: 0.8,
      ...(story.coverImage ? { images: [story.coverImage] } : {}),
    }));

    const characterRoutes: MetadataRoute.Sitemap = characters.map(
      (character) => ({
        url: absoluteUrl(`/characters/${encodeURIComponent(character.slug)}`),
        lastModified: character.updatedAt ? new Date(character.updatedAt) : now,
        changeFrequency: "monthly",
        priority: 0.7,
        ...(character.portraitImage || character.sceneImage
          ? { images: [character.portraitImage || character.sceneImage] }
          : {}),
      }),
    );

    return [...base, ...storyRoutes, ...characterRoutes];
  } catch {
    // اگر پایگاه‌داده در دسترس نبود، حداقل مسیرهای ثابت سالم بمانند.
    return base;
  }
}
