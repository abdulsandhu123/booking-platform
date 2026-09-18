import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db.js";
import Property from "../../../../lib/models/Property.js";
import { requireRole } from "../../../../lib/auth.js";

export async function GET(request) {
  const auth = await requireRole(request, ["seller", "admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const properties = await Property.find({ owner: auth.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ count: properties.length, properties });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
