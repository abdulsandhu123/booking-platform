import path from "path";

// On Vercel, only /tmp is writable, and it does not persist between
// invocations or deployments (uploaded images will not survive a cold
// start or redeploy). Locally, write into public/uploads so Next.js
// serves them automatically at /uploads/<file> and they survive restarts.
//
// For real production persistence, swap this out for durable storage
// (Vercel Blob, S3, Cloudinary, etc).
export function getUploadsDir() {
  return process.env.VERCEL
    ? path.join("/tmp", "uploads")
    : path.join(process.cwd(), "public", "uploads");
}
