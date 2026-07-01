import { requireAdminRequest } from "@/lib/admin-auth";
import { uploadFileToArvan } from "@/lib/server/arvan-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const maxFileSize = 10 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "audio/mpeg",
  "application/pdf",
  "application/zip",
]);

function jsonError(message: string, status: number) {
  return Response.json({ success: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return jsonError("فایلی برای آپلود انتخاب نشده است.", 400);
    }

    if (file.size > maxFileSize) {
      return jsonError("حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.", 400);
    }

    if (!allowedMimeTypes.has(file.type)) {
      return jsonError("فرمت این فایل برای آپلود مجاز نیست.", 400);
    }

    const uploaded = await uploadFileToArvan(file);

    return Response.json(
      { success: true, key: uploaded.key, url: uploaded.url },
      { status: 201 },
    );
  } catch (error) {
    console.error("Arvan upload failed", error);

    return jsonError("خطا در آپلود فایل", 500);
  }
}
