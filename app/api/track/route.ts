import type { NextRequest } from "next/server";

import { recordSiteView } from "@/lib/analytics-store";

// همیشه در زمان درخواست اجرا شود؛ این مسیر کش نمی‌شود.
export const dynamic = "force-dynamic";

/**
 * نقطه‌ی ثبت بازدید عمومی صفحه‌ها.
 * fire-and-forget: همیشه ۲۰۴ برمی‌گرداند و هیچ خطایی به کلاینت نشت نمی‌کند.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { path?: unknown };

    if (typeof body?.path === "string") {
      await recordSiteView({ headersList: request.headers, path: body.path });
    }
  } catch {
    // بدنه نامعتبر یا خطای پایگاه‌داده نباید درخواست را بشکند.
  }

  return new Response(null, { status: 204 });
}
