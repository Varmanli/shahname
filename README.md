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

Uploaded files are stored in Arvan Cloud / S3 and served by the app from same-domain paths like `/uploads/2026/07/file.webp`.

The database should store relative asset URLs such as `/uploads/2026/07/file.webp`.
The underlying Arvan object key remains `uploads/2026/07/file.webp`.

If an existing database still contains absolute Arvan URLs, normalize them once:

```bash
npm run media:backfill:uploads
```

- Empty database: run `npm run db:migrate`, then create content normally.
- Existing database: run `npm run db:migrate`, then `npm run media:backfill:uploads` once.

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
```
