import {
  deleteHomeHeroSlide,
  updateHomeHeroSlide,
} from "@/lib/home-hero-slides-store";
import { requireAdminRequest } from "@/lib/admin-auth";
import type {
  HomeHeroContentPosition,
  HomeHeroSlideInput,
} from "@/types/home-hero-slide";

export const dynamic = "force-dynamic";

function normalizeContentPosition(
  value: unknown,
): HomeHeroContentPosition | null {
  return value === "left" || value === "right" ? value : null;
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  return NaN;
}

function normalizeBoolean(value: unknown) {
  return value === true || value === "true";
}

function parseSlideInput(payload: Record<string, unknown>): HomeHeroSlideInput {
  const title = normalizeString(payload.title);
  const subtitle = normalizeString(payload.subtitle);
  const image = normalizeString(payload.image);
  const primaryButtonLabel = normalizeString(payload.primaryButtonLabel);
  const primaryButtonHref = normalizeString(payload.primaryButtonHref);
  const secondaryButtonLabel = normalizeString(payload.secondaryButtonLabel);
  const secondaryButtonHref = normalizeString(payload.secondaryButtonHref);
  const contentPosition = normalizeContentPosition(payload.contentPosition);
  const order = normalizeNumber(payload.order);
  const isActive = normalizeBoolean(payload.isActive);

  if (!title) throw new Error("عنوان اسلاید الزامی است.");
  if (!subtitle) throw new Error("زیرعنوان اسلاید الزامی است.");
  if (!image) throw new Error("تصویر اسلاید الزامی است.");
  if (!primaryButtonLabel) throw new Error("متن دکمه اصلی الزامی است.");
  if (!primaryButtonHref) throw new Error("لینک دکمه اصلی الزامی است.");
  if (!contentPosition) {
    throw new Error("موقعیت محتوا باید سمت چپ یا سمت راست باشد.");
  }
  if (Number.isNaN(order)) throw new Error("ترتیب نمایش باید عدد باشد.");
  if (secondaryButtonLabel && !secondaryButtonHref) {
    throw new Error("وقتی متن دکمه دوم وارد می‌شود، لینک آن هم الزامی است.");
  }
  if (secondaryButtonHref && !secondaryButtonLabel) {
    throw new Error("وقتی لینک دکمه دوم وارد می‌شود، متن آن هم الزامی است.");
  }

  return {
    title,
    subtitle,
    image,
    primaryButtonLabel,
    primaryButtonHref,
    secondaryButtonLabel,
    secondaryButtonHref,
    contentPosition,
    order,
    isActive,
  };
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const { id } = await context.params;
    const payload = (await request.json()) as Record<string, unknown>;
    const slide = await updateHomeHeroSlide(id, parseSlideInput(payload));

    if (!slide) {
      return Response.json({ message: "اسلاید پیدا نشد." }, { status: 404 });
    }

    return Response.json({ slide });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "خطای ناشناخته رخ داد." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const { id } = await context.params;
    const deleted = await deleteHomeHeroSlide(id);

    if (!deleted) {
      return Response.json({ message: "اسلاید پیدا نشد." }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "خطای ناشناخته رخ داد." },
      { status: 500 },
    );
  }
}
