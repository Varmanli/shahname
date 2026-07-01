import { readSiteSettings, writeSiteSettings } from "@/lib/site-settings-store";
import { requireAdminRequest } from "@/lib/admin-auth";
import type { SiteSettings } from "@/types/site-settings";

export const dynamic = "force-dynamic";

function toLimitedStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, 6)
    : [];
}

export async function GET() {
  const settings = await readSiteSettings();
  return Response.json({ settings });
}

export async function PUT(request: Request) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const payload = (await request.json()) as Partial<SiteSettings>;
    const settings: SiteSettings = {
      homeCharacterIds: toLimitedStringArray(payload.homeCharacterIds),
      homeStoryIds: toLimitedStringArray(payload.homeStoryIds),
    };

    await writeSiteSettings(settings);

    return Response.json({ settings });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "خطای ناشناخته رخ داد." },
      { status: 500 },
    );
  }
}
