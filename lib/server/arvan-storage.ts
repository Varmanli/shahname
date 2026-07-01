import "server-only";

import { randomUUID } from "node:crypto";
import path from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const allowedExtensionsByType = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"],
  ["audio/mpeg", ".mp3"],
  ["application/pdf", ".pdf"],
  ["application/zip", ".zip"],
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

function getSafeExtension(file: File) {
  const extensionFromType = allowedExtensionsByType.get(file.type);
  if (extensionFromType) return extensionFromType;

  return path.extname(file.name).toLowerCase();
}

function createObjectKey(file: File) {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const extension = getSafeExtension(file);

  return `uploads/${year}/${month}/${randomUUID()}${extension}`;
}

function createPublicUrl(key: string) {
  const baseUrl = requiredEnv("ARVAN_S3_PUBLIC_BASE_URL").replace(/\/+$/, "");
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${baseUrl}/${encodedKey}`;
}

export async function uploadFileToArvan(file: File) {
  const bucket = requiredEnv("ARVAN_S3_BUCKET");
  const key = createObjectKey(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    }),
  );

  return {
    key,
    url: createPublicUrl(key),
  };
}
