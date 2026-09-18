# StayFinder — Next.js (unified full-stack app)

This project was converted from a two-service setup (Vite frontend +
Express backend, glued together with a custom `vercel.json`) into a single
Next.js 14 App Router application. The backend logic now lives in Next.js
Route Handlers under `app/api/**`, and the frontend pages live under
`app/**/page.jsx`. Same MongoDB models, same business logic (booking
conflict detection, JWT auth, roles) — just one app instead of two.

## Why this fixes the deployment problems

- **No `vercel.json` needed.** Next.js is a first-class, zero-config
  framework on Vercel — it auto-detects the build, no custom `services`/
  `rewrites` config, no entrypoint path to get wrong.
- **No CORS or cross-service routing.** Frontend and API are the same app,
  same origin, by construction.
- **One deployment, one set of environment variables.** No more "which
  service does this env var apply to."

## Structure

```
app/
  layout.jsx              # root layout (nav + auth provider)
  page.jsx                # Home ("/")
  properties/[id]/page.jsx
  my-bookings/page.jsx
  login/page.jsx
  signup/page.jsx
  seller/page.jsx         # protected: seller, admin
  admin/page.jsx          # protected: admin
  uploads/[filename]/route.js   # serves uploaded images
  api/
    auth/{register,login,me}/route.js
    properties/route.js            # GET (search), POST (create)
    properties/mine/route.js
    properties/[id]/route.js       # GET, PUT, DELETE
    bookings/route.js              # POST (create, with conflict logic)
    bookings/property/[propertyId]/route.js
    bookings/guest/[email]/route.js
    bookings/seller/route.js
    bookings/[id]/cancel/route.js
    uploads/route.js               # POST (multipart image upload)
    admin/overview/route.js
    admin/users/route.js
    admin/users/[id]/route.js
    admin/users/[id]/role/route.js
    health/route.js
lib/
  db.js                # cached Mongo connection (serverless-safe)
  auth.js              # JWT verification + role check helper
  jwt.js
  dateOverlap.js
  uploads.js           # where uploaded files physically live
  api.js               # axios client used by the frontend
  models/{User,Property,Booking}.js
components/            # ported from the old frontend/src/components
scripts/seed.mjs       # demo data + demo accounts
```

## Local development

```bash
npm install
cp .env.example .env.local   # then edit MONGO_URI / JWT_SECRET
npm run dev
```

Open http://localhost:3000. Optionally seed demo data:

```bash
npm run seed
```

Demo accounts after seeding:
- seller@demo.com / password123
- admin@demo.com / password123

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel — no configuration needed, it auto-detects Next.js.
3. In Project Settings → Environment Variables, set for Production:
   - `MONGO_URI` — a real MongoDB Atlas connection string (not localhost)
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` (optional, defaults to `7d`)
4. In MongoDB Atlas → Network Access, allow `0.0.0.0/0` (Vercel functions
   have no fixed IP).
5. Deploy.

## A note on uploaded images

Vercel's serverless functions have a **read-only filesystem except `/tmp`**,
and `/tmp` does **not persist** between invocations or deployments.

- Locally, uploaded images are written to `public/uploads/` and served by
  Next's normal static file handling.
- On Vercel, they're written to `/tmp/uploads` and served through
  `app/uploads/[filename]/route.js`, but they will **not survive** a cold
  start or redeploy.

This is enough to get the app fully working and deployed, but for real
production use with durable image storage, swap `lib/uploads.js` to write
to something persistent — e.g. Vercel Blob, S3, or Cloudinary — instead of
the local filesystem.
