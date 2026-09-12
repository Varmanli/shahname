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
  return (
    typeof error === "object" &&
      error !== null &&
      ("name" in error
        ? error.name === "NoSuchKey" || error.name === "NotFound"
        : false)
  );
}

export async function GET(_request: Request, context: RouteContext) {
  const { path } = await context.params;
  const key = createObjectKey(path);

  try {
    const object = await getArvanObject(key);
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
    const object = await headArvanObject(key);

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
