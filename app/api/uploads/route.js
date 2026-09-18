import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { requireRole } from "../../../lib/auth.js";
import { getUploadsDir } from "../../../lib/uploads.js";

const MAX_FILES = 6;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = /jpeg|jpg|png|webp|gif/;

// POST /api/uploads  (multipart/form-data, field name "images", up to 6 files)
// seller/admin only
export async function POST(request) {
  const auth = await requireRole(request, ["seller", "admin"]);
  if (auth.response) return auth.response;

  try {
    const formData = await request.formData();
    const files = formData.getAll("images").filter((f) => typeof f === "object" && f.name);

    if (files.length === 0) {
      return NextResponse.json({ error: "No image files received." }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Up to ${MAX_FILES} images at a time.` }, { status: 400 });
    }

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase().replace(".", "");
      if (!ALLOWED_TYPES.test(ext) || !ALLOWED_TYPES.test(file.type)) {
        return NextResponse.json(
          { error: "Only image files (jpg, png, webp, gif) are allowed." },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "Each image must be under 5MB." }, { status: 400 });
      }
    }

    const uploadsDir = getUploadsDir();
    if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

    const urls = [];
    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(path.join(uploadsDir, unique), buffer);
      urls.push(`/uploads/${unique}`);
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
