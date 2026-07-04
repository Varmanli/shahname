import { extractUploadKey, getContentTypeForPath, readStoredUpload } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function responseHeaders(contentType: string, size: number) {
  return {
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Length": String(size),
    "Content-Type": contentType,
  };
}

async function buildUploadResponse(pathSegments: string[]) {
  const joined = pathSegments.join("/");
  const key = extractUploadKey(`/uploads/${joined}`);

  if (!key) {
    return Response.json({ message: "فایل پیدا نشد." }, { status: 404 });
  }

  try {
    const upload = await readStoredUpload(key);
    const contentType = getContentTypeForPath(upload.absolutePath);

    return new Response(
      Uint8Array.from(upload.buffer),
      {
        status: 200,
        headers: responseHeaders(contentType, upload.size),
      },
    );
  } catch {
    return Response.json({ message: "فایل پیدا نشد." }, { status: 404 });
  }
}

async function getPathSegments(paramsPromise: Promise<unknown>) {
  const params = await paramsPromise;

  if (
    typeof params === "object" &&
    params !== null &&
    "path" in params &&
    Array.isArray(params.path)
  ) {
    return params.path.filter(
      (segment): segment is string => typeof segment === "string",
    );
  }

  return [];
}

export async function GET(
  _request: Request,
  context: { params: Promise<unknown> },
) {
  return buildUploadResponse(await getPathSegments(context.params));
}

export async function HEAD(
  _request: Request,
  context: { params: Promise<unknown> },
) {
  const path = await getPathSegments(context.params);
  const joined = path.join("/");
  const key = extractUploadKey(`/uploads/${joined}`);

  if (!key) {
    return new Response(null, { status: 404 });
  }

  try {
    const upload = await readStoredUpload(key);
    const contentType = getContentTypeForPath(upload.absolutePath);

    return new Response(null, {
      status: 200,
      headers: responseHeaders(contentType, upload.size),
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
