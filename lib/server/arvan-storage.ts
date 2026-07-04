import "server-only";

import { randomUUID } from "node:crypto";
import path from "node:path";

import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

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

function sanitizeFileName(fileName: string) {
  const justName = (fileName ?? "").split(/[\\/]/).pop() ?? "";
  const dot = justName.lastIndexOf(".");
  const rawExt = dot > 0 ? justName.slice(dot + 1) : "";

  const ext = rawExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 8);

  return ext ? `.${ext}` : "";
}

function createRelativeUploadUrl(key: string) {
  return `/uploads/${key.replace(/^uploads\/+/i, "")}`;
}

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

export const s3Client = getS3Client();

export function getBucketName() {
  return requiredEnv("ARVAN_S3_BUCKET");
}

function getSafeExtension(file: File) {
  const extensionFromType = allowedExtensionsByType.get(file.type);
  if (extensionFromType) return extensionFromType;

  return sanitizeFileName(file.name) || path.extname(file.name).toLowerCase();
}

function createObjectKey(file: File) {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const extension = getSafeExtension(file);

  return `uploads/${year}/${month}/${randomUUID()}${extension}`;
}

export async function uploadFileToArvan(file: File) {
  const key = createObjectKey(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  await s3Client.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    }),
  );

  return {
    key,
    url: createRelativeUploadUrl(key),
  };
}

export function getArvanObject(key: string) {
  return s3Client.send(
    new GetObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    }),
  );
}

export function headArvanObject(key: string) {
  return s3Client.send(
    new HeadObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    }),
  );
}
