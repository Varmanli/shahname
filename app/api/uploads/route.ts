import { saveUploadedImageAsset } from "@/lib/upload-parser";
import { requireAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      return Response.json(
        { message: "تصویر انتخاب نشده است." },
        { status: 400 },
      );
    }

    const uploaded = await saveUploadedImageAsset(image);

    return Response.json(
      { key: uploaded.key, url: uploaded.url },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error ? error.message : "آپلود تصویر با خطا روبه‌رو شد.",
      },
      { status: 500 },
    );
  }
}
