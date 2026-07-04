import { randomBytes } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_UPLOAD_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "uploads",
);
const LEGACY_PUBLIC_UPLOAD_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "public",
  "uploads",
);
const DEFAULT_UPLOAD_BASE_URL = "/uploads";

type MaybeString = null | string | undefined;

export type UploadFileResult = {
  absolutePath: string;
  key: string;
  url: string;
};

function stripLeadingSlashes(value: string) {
  return value.replace(/^\/+/, "");
}

function stripLegacyUploadPrefixes(value: string) {
  return stripLeadingSlashes(value)
    .replace(/^public\/+/i, "")
    .replace(/^uploads\/+/i, "");
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

export function getUploadDir() {
  const configured = process.env.UPLOAD_DIR?.trim();

  if (!configured) return DEFAULT_UPLOAD_DIR;

  return path.isAbsolute(configured)
    ? configured
    : path.resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

export function getUploadBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL?.trim();

  if (!configured) return DEFAULT_UPLOAD_BASE_URL;
  if (/^https?:\/\//i.test(configured)) return configured.replace(/\/+$/, "");

  const normalized = `/${configured.replace(/^\/+|\/+$/g, "")}`;
  return normalized === "/" ? DEFAULT_UPLOAD_BASE_URL : normalized;
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

function createUploadKey(fileName: string) {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const ext = sanitizeFileName(fileName);
  const suffix = `${Date.now()}-${randomBytes(4).toString("hex")}`;

  return `${year}/${month}/${suffix}${ext}`;
}

function joinUploadBase(key: string) {
  const base = getUploadBaseUrl();
  const cleanKey = stripLegacyUploadPrefixes(key);

  if (/^https?:\/\//i.test(base)) {
    return `${base}/${cleanKey}`;
  }

  return `${base}/${cleanKey}`.replace(/\/{2,}/g, "/");
}

function toRelativeUploadPath(key: string) {
  return `${DEFAULT_UPLOAD_BASE_URL}/${stripLegacyUploadPrefixes(key)}`;
}

export function extractUploadKey(urlOrKey: MaybeString): string | null {
  if (!urlOrKey) return null;

  const pathname = extractPathname(urlOrKey);
  if (!pathname) return null;

  const withoutQuery = pathname.split("?")[0] ?? pathname;
  const publicUploadsMatch = withoutQuery.match(/^\/?public\/uploads\/(.+)$/i);
  if (publicUploadsMatch?.[1]) {
    return stripLeadingSlashes(publicUploadsMatch[1]);
  }

  const uploadsMatch = withoutQuery.match(/^\/?uploads\/(.+)$/i);
  if (uploadsMatch?.[1]) {
    return stripLeadingSlashes(uploadsMatch[1]);
  }

  const hostStyleMatch = withoutQuery.match(/^\/[^/]+\/uploads\/(.+)$/i);
  if (hostStyleMatch?.[1]) {
    return stripLeadingSlashes(hostStyleMatch[1]);
  }

  if (!withoutQuery.startsWith("/") && withoutQuery.includes("/")) {
    return stripLegacyUploadPrefixes(withoutQuery);
  }

  return null;
}

export function normalizeStoredAssetUrl(url: MaybeString): string | null {
  if (!url) return url ?? null;

  const key = extractUploadKey(url);
  if (!key) return typeof url === "string" ? url : null;

  return toRelativeUploadPath(key);
}

export function normalizeHtmlAssetUrls(html: MaybeString): string {
  if (!html) return "";

  return html.replace(
    /https?:\/\/[^"'\s)]+\/uploads\/([^"'?#\s)]+)/gi,
    (_match, key: string) => toRelativeUploadPath(key),
  );
}

function resolveManagedUploadPath(key: string) {
  const uploadDir = getUploadDir();
  const candidate = path.resolve(uploadDir, key);
  const relative = path.relative(uploadDir, candidate);

  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    relative.includes(`..${path.sep}`)
  ) {
    throw new Error("Invalid upload path.");
  }

  return candidate;
}

export async function saveUploadedFile(file: File): Promise<UploadFileResult> {
  const key = createUploadKey(file.name || "file");
  const absolutePath = resolveManagedUploadPath(key);
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);

  return {
    absolutePath,
    key,
    url: joinUploadBase(key),
  };
}

export async function readStoredUpload(
  key: string,
): Promise<{ absolutePath: string; buffer: Buffer; size: number }> {
  const candidatePaths = [
    resolveManagedUploadPath(key),
    path.resolve(LEGACY_PUBLIC_UPLOAD_DIR, key),
  ];

  for (const absolutePath of candidatePaths) {
    try {
      const info = await stat(absolutePath);

      if (!info.isFile()) continue;

      const buffer = await readFile(absolutePath);

      return {
        absolutePath,
        buffer,
        size: info.size,
      };
    } catch {
      continue;
    }
  }

  throw new Error("Upload not found.");
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
