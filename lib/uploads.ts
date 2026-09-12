import path from "node:path";

import { uploadFileToArvan } from "@/lib/server/arvan-storage";

const DEFAULT_UPLOAD_BASE_URL = "/uploads";

type MaybeString = null | string | undefined;

export type UploadFileResult = {
  key: string;
  url: string;
};

function stripLeadingSlashes(value: string) {
  return value.replace(/^\/+/, "");
}

function extractPathname(value: string): string | null {
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    try {
      return new URL(value).pathname;
    } catch {
      return null;
    }
  }

  return value;
}

function normalizeUploadKey(value: string) {
  const trimmed = value.split("?")[0]?.trim() ?? "";
  const withoutLeadingSlash = stripLeadingSlashes(trimmed);
  const withoutPublicPrefix = withoutLeadingSlash.replace(/^public\/+/i, "");
  const withoutUploadBase = withoutPublicPrefix.replace(/^uploads\/+/i, "");

  if (!withoutUploadBase) {
    throw new Error("Invalid upload key.");
  }

  return `uploads/${withoutUploadBase}`;
}

export function createRelativeUploadUrl(key: string) {
  const normalizedKey = normalizeUploadKey(key);
  return `${DEFAULT_UPLOAD_BASE_URL}/${normalizedKey.slice("uploads/".length)}`;
}

export function sanitizeFileName(fileName: string) {
  const justName = (fileName ?? "").split(/[\\/]/).pop() ?? "";
  const dot = justName.lastIndexOf(".");
  const rawExt = dot > 0 ? justName.slice(dot + 1) : "";

  const ext = rawExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 8);

  return ext ? `.${ext}` : "";
}

export function extractUploadKey(urlOrKey: MaybeString): string | null {
  if (!urlOrKey) return null;

  const pathname = extractPathname(urlOrKey);
  if (!pathname) return null;

  const withoutQuery = pathname.split("?")[0] ?? pathname;
  const publicUploadsMatch = withoutQuery.match(/^\/?public\/uploads\/(.+)$/i);
  if (publicUploadsMatch?.[1]) {
    return normalizeUploadKey(publicUploadsMatch[1]);
  }

  const uploadsMatch = withoutQuery.match(/^\/?uploads\/(.+)$/i);
  if (uploadsMatch?.[1]) {
    return normalizeUploadKey(uploadsMatch[1]);
  }

  const hostStyleMatch = withoutQuery.match(/^\/[^/]+\/uploads\/(.+)$/i);
  if (hostStyleMatch?.[1]) {
    return normalizeUploadKey(hostStyleMatch[1]);
  }

  if (!withoutQuery.startsWith("/") && withoutQuery.includes("/")) {
    return normalizeUploadKey(withoutQuery);
  }

  return null;
}

export function normalizeStoredAssetUrl(url: MaybeString): string | null {
  if (!url) return url ?? null;

  const key = extractUploadKey(url);
  if (!key) return typeof url === "string" ? url : null;

  return createRelativeUploadUrl(key);
}

export function normalizeHtmlAssetUrls(html: MaybeString): string {
  if (!html) return "";

  return html.replace(
    /https?:\/\/[^"'\s)]+\/uploads\/([^"'?#\s)]+)/gi,
    (_match, key: string) => createRelativeUploadUrl(key),
  );
}

export async function saveUploadedFile(file: File): Promise<UploadFileResult> {
  return uploadFileToArvan(file);
}

export function getContentTypeForPath(filePath: string) {
  switch (path.extname(filePath).toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".ico":
      return "image/x-icon";
    case ".svg":
      return "image/svg+xml";
    case ".pdf":
      return "application/pdf";
    case ".zip":
      return "application/zip";
    case ".mp3":
      return "audio/mpeg";
    default:
      return "application/octet-stream";
  }
}
