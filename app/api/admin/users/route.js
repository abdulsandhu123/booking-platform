import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db.js";
import User from "../../../../lib/models/User.js";
import { requireRole } from "../../../../lib/auth.js";

export async function GET(request) {
  const auth = await requireRole(request, ["admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ count: users.length, users });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
