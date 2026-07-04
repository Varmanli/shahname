import "server-only";

import { saveUploadedFile } from "@/lib/uploads";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function saveUploadedImageAsset(file: File) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("فقط فایل تصویری jpeg، png، webp، gif یا svg مجاز است.");
  }

  return saveUploadedFile(file);
}

export async function saveUploadedImage(file: File) {
  const uploaded = await saveUploadedImageAsset(file);
  return uploaded.url;
}
