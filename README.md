## Development

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

Apply Drizzle migrations before using a new or updated database:

```bash
npm run db:migrate
```

`drizzle/0003_glamorous_korath.sql` is part of the tracked migration history and should be deployed with the app.

If an existing database still stores old absolute media URLs, normalize them once:

```bash
npm run media:backfill:uploads
```

## Uploads

Uploaded files are stored in Arvan Cloud / S3 and served through the app from same-domain paths like `/uploads/2026/07/file.webp`. The bucket can remain private; the app reads objects server-side with the S3 credentials.

The database should store relative asset URLs such as `/uploads/2026/07/file.webp`.
The underlying Arvan object key remains `uploads/2026/07/file.webp`.

If an existing database still contains absolute Arvan URLs, normalize them once:

```bash
npm run media:backfill:uploads
```

- Empty database: run `npm run db:migrate`, then create content normally.
- Existing database: run `npm run db:migrate`, then `npm run media:backfill:uploads` once.

For production, `ARVAN_S3_ENDPOINT` should be `https://s3.ir-thr-at1.arvanstorage.ir`, `ARVAN_S3_REGION` should be `ir-thr-at1`, and `ARVAN_S3_BUCKET` should be the exact bucket name. `ARVAN_S3_ACCESS_KEY` and `ARVAN_S3_SECRET_KEY` must be an Arvan Object Storage S3 access-key pair; API tokens do not work with this client. Run the standalone server with `npm start` (not `next start`) and make sure the PM2 user owns the deployed `.next` directory so Next can write its cache.

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
```
