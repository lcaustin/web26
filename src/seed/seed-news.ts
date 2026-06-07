// NOTE: This file is intentionally deprecated/unused.
//
// Running seed scripts through `payload run` hits a known loader
// incompatibility in this project (the Payload CLI's tsx/ESM script loader
// can't cleanly resolve this project's module graph — the same class of
// issue documented in project memory for `payload generate:importmap`).
//
// The working seed path is now a one-time Next.js API route, which runs
// through Next's own module resolution (proven to work via `next build`/
// `next dev`) instead of the Payload CLI loader:
//
//   src/app/(frontend)/api/seed-news/route.ts
//
// Sample data lives in ./news-data.ts and is shared by that route.
//
// To seed: run `pnpm dev`, then visit http://localhost:3000/api/seed-news
// once. Feel free to delete the route file afterward.
export {}
