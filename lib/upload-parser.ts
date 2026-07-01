import "server-only";

import { uploadFileToArvan } from "@/lib/server/arvan-storage";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function saveUploadedImage(file: File) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("فقط فایل تصویری jpeg، png، webp، gif یا svg مجاز است.");
  }

  const uploaded = await uploadFileToArvan(file);
  return uploaded.url;
}
