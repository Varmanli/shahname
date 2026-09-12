import { eq } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";

import { db } from "@/lib/server/db";
import { siteSettings } from "@/lib/server/db/schema";
import type { SiteSettings } from "@/types/site-settings";

const settingsKey = "home-featured";
const SETTINGS_CACHE_TAG = "site-settings";
const defaultSettings: SiteSettings = {
  homeCharacterIds: [],
  homeStoryIds: [],
};

function toStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeSettings(settings: Partial<SiteSettings>): SiteSettings {
  return {
    homeCharacterIds: toStringArray(settings.homeCharacterIds).slice(0, 6),
    homeStoryIds: toStringArray(settings.homeStoryIds).slice(0, 6),
  };
}

async function readSiteSettingsUncached(): Promise<SiteSettings> {
  const [row] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, settingsKey));

  if (!row || typeof row.value !== "object" || row.value === null) {
    return defaultSettings;
  }

  return normalizeSettings(row.value as Partial<SiteSettings>);
}

const readCachedSiteSettings = unstable_cache(
  readSiteSettingsUncached,
  [SETTINGS_CACHE_TAG],
  { revalidate: 60, tags: [SETTINGS_CACHE_TAG] },
);

export function readSiteSettings(): Promise<SiteSettings> {
  return readCachedSiteSettings();
}

export async function writeSiteSettings(settings: SiteSettings) {
  const value = normalizeSettings(settings);
  await db
    .insert(siteSettings)
    .values({
      key: settingsKey,
      value,
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: {
        value,
        updatedAt: new Date().toISOString(),
      },
    });

  revalidateTag(SETTINGS_CACHE_TAG, "max");
}
