import { Readable } from "node:stream";

import { getContentTypeForPath } from "@/lib/uploads";
import {
  getArvanObject,
  headArvanObject,
} from "@/lib/server/arvan-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function createObjectKey(pathSegments: string[]) {
  return ["uploads", ...pathSegments].join("/");
}

function createLegacyObjectKey(key: string) {
  if (/^uploads\/legacy\//i.test(key)) return null;
  return key.replace(/^uploads\//i, "uploads/legacy/");
}

function createHeaders(contentType: string, contentLength?: number) {
  const headers = new Headers({
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Type": contentType,
  });

  if (typeof contentLength === "number") {
    headers.set("Content-Length", String(contentLength));
  }

  return headers;
}

function bodyToWebStream(body: unknown): ReadableStream<Uint8Array> | null {
  if (
    typeof body === "object" &&
    body !== null &&
    "transformToWebStream" in body &&
    typeof body.transformToWebStream === "function"
  ) {
    return body.transformToWebStream();
  }

  if (body instanceof Readable) {
    return Readable.toWeb(body) as ReadableStream<Uint8Array>;
  }

  return null;
}

function isMissingObjectError(error: unknown) {
  if (typeof error !== "object" || error === null) return false;

  const value = error as {
    name?: unknown;
    Code?: unknown;
    $metadata?: { httpStatusCode?: unknown };
  };

  return (
    value.name === "NoSuchKey" ||
    value.name === "NotFound" ||
    value.Code === "NoSuchKey" ||
    value.Code === "NotFound" ||
    value.$metadata?.httpStatusCode === 404
  );
}

async function getObjectWithLegacyFallback(key: string) {
  try {
    return await getArvanObject(key);
  } catch (error) {
    const legacyKey = createLegacyObjectKey(key);
    if (!legacyKey || !isMissingObjectError(error)) throw error;

    return getArvanObject(legacyKey);
  }
}

async function headObjectWithLegacyFallback(key: string) {
  try {
    return await headArvanObject(key);
  } catch (error) {
    const legacyKey = createLegacyObjectKey(key);
    if (!legacyKey || !isMissingObjectError(error)) throw error;

    return headArvanObject(legacyKey);
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const { path } = await context.params;
  const key = createObjectKey(path);

  try {
    const object = await getObjectWithLegacyFallback(key);
    const body = bodyToWebStream(object.Body);

    if (!body) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(body, {
      status: 200,
      headers: createHeaders(
        object.ContentType || getContentTypeForPath(key),
        object.ContentLength,
      ),
    });
  } catch (error) {
    if (isMissingObjectError(error)) {
      return new Response("Not found", { status: 404 });
    }

    console.error("Failed to read upload from Arvan S3", { error, key });
    return new Response("Not found", { status: 404 });
  }
}

export async function HEAD(_request: Request, context: RouteContext) {
  const { path } = await context.params;
  const key = createObjectKey(path);

  try {
    const object = await headObjectWithLegacyFallback(key);

    return new Response(null, {
      status: 200,
      headers: createHeaders(
        object.ContentType || getContentTypeForPath(key),
        object.ContentLength,
      ),
    });
  } catch (error) {
    if (isMissingObjectError(error)) {
      return new Response(null, { status: 404 });
    }

    console.error("Failed to head upload from Arvan S3", { error, key });
    return new Response(null, { status: 404 });
  }
}
