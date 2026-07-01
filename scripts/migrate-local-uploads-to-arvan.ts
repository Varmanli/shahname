import "dotenv/config";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { promises as fs } from "node:fs";
import path from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const connectionString = databaseUrl;

const publicUploadsPrefix = "/uploads/";
const uploadsDir = path.join(process.cwd(), "public", "uploads");
const dataDir = path.join(process.cwd(), "data");

const mimeTypesByExtension = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
]);

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getS3Client() {
  return new S3Client({
    endpoint: requiredEnv("ARVAN_S3_ENDPOINT"),
    region: requiredEnv("ARVAN_S3_REGION"),
    credentials: {
      accessKeyId: requiredEnv("ARVAN_S3_ACCESS_KEY"),
      secretAccessKey: requiredEnv("ARVAN_S3_SECRET_KEY"),
    },
    forcePathStyle: true,
  });
}

function createPublicUrl(key: string) {
  const baseUrl = requiredEnv("ARVAN_S3_PUBLIC_BASE_URL").replace(/\/+$/, "");
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${baseUrl}/${encodedKey}`;
}

function isLocalUpload(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(publicUploadsPrefix);
}

function localPathFromUrl(url: string) {
  const relativePath = decodeURIComponent(url.slice(publicUploadsPrefix.length));
  return path.join(uploadsDir, relativePath);
}

function arvanKeyFromUrl(url: string) {
  const relativePath = decodeURIComponent(url.slice(publicUploadsPrefix.length));
  return `uploads/legacy/${relativePath.replace(/^\/+/, "")}`;
}

function collectLocalUploads(value: unknown, urls = new Set<string>()) {
  if (isLocalUpload(value)) {
    urls.add(value);
    return urls;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectLocalUploads(item, urls);
    }
    return urls;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      collectLocalUploads(item, urls);
    }
  }

  return urls;
}

function replaceLocalUploads<T>(value: T, replacements: Map<string, string>): T {
  if (isLocalUpload(value)) {
    return (replacements.get(value) ?? value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceLocalUploads(item, replacements)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        replaceLocalUploads(item, replacements),
      ]),
    ) as T;
  }

  return value;
}

async function readJsonFile(filePath: string) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as unknown;
}

async function collectDataFileUploads() {
  const urls = new Set<string>();
  const fileNames = await fs.readdir(dataDir);

  for (const fileName of fileNames) {
    if (!fileName.endsWith(".json")) continue;
    collectLocalUploads(await readJsonFile(path.join(dataDir, fileName)), urls);
  }

  return urls;
}

async function collectDatabaseUploads(sql: postgres.Sql) {
  const urls = new Set<string>();
  const [characters, stories, sections, scenes, media] = await Promise.all([
    sql<{ avatar_url: string; portrait_image: string; scene_image: string }[]>`
      select avatar_url, portrait_image, scene_image from characters
    `,
    sql<{ cover_image: string }[]>`
      select cover_image from stories
    `,
    sql<{ image: string | null }[]>`
      select image from story_sections
    `,
    sql<{ image: string }[]>`
      select image from story_scenes
    `,
    sql<{ key: string; url: string }[]>`
      select key, url from media
    `,
  ]);

  for (const row of characters) collectLocalUploads(row, urls);
  for (const row of stories) collectLocalUploads(row, urls);
  for (const row of sections) collectLocalUploads(row, urls);
  for (const row of scenes) collectLocalUploads(row, urls);
  for (const row of media) collectLocalUploads(row, urls);

  return urls;
}

async function uploadLocalFileToArvan(client: S3Client, url: string) {
  const filePath = localPathFromUrl(url);
  const key = arvanKeyFromUrl(url);
  const extension = path.extname(filePath).toLowerCase();
  const contentType = mimeTypesByExtension.get(extension) ?? "application/octet-stream";
  const body = await fs.readFile(filePath);

  await client.send(
    new PutObjectCommand({
      Bucket: requiredEnv("ARVAN_S3_BUCKET"),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return createPublicUrl(key);
}

async function updateDataFiles(replacements: Map<string, string>) {
  const fileNames = await fs.readdir(dataDir);
  let updatedFiles = 0;

  for (const fileName of fileNames) {
    if (!fileName.endsWith(".json")) continue;

    const filePath = path.join(dataDir, fileName);
    const current = await readJsonFile(filePath);
    const next = replaceLocalUploads(current, replacements);
    const currentJson = `${JSON.stringify(current, null, 2)}\n`;
    const nextJson = `${JSON.stringify(next, null, 2)}\n`;

    if (nextJson !== currentJson) {
      await fs.writeFile(filePath, nextJson, "utf8");
      updatedFiles += 1;
    }
  }

  return updatedFiles;
}

async function updateDatabase(sql: postgres.Sql, replacements: Map<string, string>) {
  const replace = (value: string | null) =>
    value && replacements.has(value) ? replacements.get(value)! : value;
  const [characters, stories, sections, scenes, mediaRows] = await Promise.all([
    sql<{
      id: string;
      avatar_url: string;
      portrait_image: string;
      scene_image: string;
    }[]>`
      select id, avatar_url, portrait_image, scene_image from characters
    `,
    sql<{ id: string; cover_image: string }[]>`
      select id, cover_image from stories
    `,
    sql<{ id: string; image: string | null }[]>`
      select id, image from story_sections
    `,
    sql<{ id: string; image: string }[]>`
      select id, image from story_scenes
    `,
    sql<{ id: string; key: string; url: string }[]>`
      select id, key, url from media
    `,
  ]);

  let updatedRows = 0;

  await sql.begin(async (tx) => {
    for (const row of characters) {
      const nextAvatarUrl = replace(row.avatar_url);
      const nextPortraitImage = replace(row.portrait_image);
      const nextSceneImage = replace(row.scene_image);
      if (
        nextAvatarUrl === row.avatar_url &&
        nextPortraitImage === row.portrait_image &&
        nextSceneImage === row.scene_image
      ) {
        continue;
      }

      await tx`
        update characters
        set avatar_url = ${nextAvatarUrl}, portrait_image = ${nextPortraitImage}, scene_image = ${nextSceneImage}, updated_at = now()
        where id = ${row.id}
      `;
      updatedRows += 1;
    }

    for (const row of stories) {
      const nextCoverImage = replace(row.cover_image);
      if (nextCoverImage === row.cover_image) continue;

      await tx`
        update stories
        set cover_image = ${nextCoverImage}, updated_at = now()
        where id = ${row.id}
      `;
      updatedRows += 1;
    }

    for (const row of sections) {
      const nextImage = replace(row.image);
      if (nextImage === row.image) continue;

      await tx`
        update story_sections
        set image = ${nextImage}, updated_at = now()
        where id = ${row.id}
      `;
      updatedRows += 1;
    }

    for (const row of scenes) {
      const nextImage = replace(row.image);
      if (nextImage === row.image) continue;

      await tx`
        update story_scenes
        set image = ${nextImage}
        where id = ${row.id}
      `;
      updatedRows += 1;
    }

    for (const row of mediaRows) {
      const nextKey = replace(row.key);
      const nextUrl = replace(row.url);
      if (nextKey === row.key && nextUrl === row.url) continue;

      await tx`
        update media
        set key = ${nextKey}, url = ${nextUrl}
        where id = ${row.id}
      `;
      updatedRows += 1;
    }
  });

  return updatedRows;
}

async function main() {
  const sql = postgres(connectionString, { max: 1, prepare: false });

  try {
    const localUrls = new Set([
      ...(await collectDataFileUploads()),
      ...(await collectDatabaseUploads(sql)),
    ]);

    if (!localUrls.size) {
      console.log("No local /uploads references found.");
      return;
    }

    const client = getS3Client();
    const replacements = new Map<string, string>();
    const missingFiles: string[] = [];

    for (const url of [...localUrls].sort()) {
      try {
        await fs.access(localPathFromUrl(url));
        const arvanUrl = await uploadLocalFileToArvan(client, url);
        replacements.set(url, arvanUrl);
        console.log(`${url} -> ${arvanUrl}`);
      } catch (error) {
        missingFiles.push(url);
        console.warn(
          `Skipped ${url}: ${error instanceof Error ? error.message : "unknown error"}`,
        );
      }
    }

    const [updatedRows, updatedFiles] = await Promise.all([
      updateDatabase(sql, replacements),
      updateDataFiles(replacements),
    ]);

    console.log(
      `Uploaded ${replacements.size} files, updated ${updatedRows} database rows and ${updatedFiles} data files.`,
    );

    if (missingFiles.length) {
      console.warn(`Missing local files: ${missingFiles.join(", ")}`);
    }
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
