import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db.js";
import User from "../../../../lib/models/User.js";
import Property from "../../../../lib/models/Property.js";
import Booking from "../../../../lib/models/Booking.js";
import { requireRole } from "../../../../lib/auth.js";

export async function GET(request) {
  const auth = await requireRole(request, ["admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const [users, sellers, properties, bookings] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "seller" }),
      Property.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
    ]);
    return NextResponse.json({ users, sellers, properties, bookings });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
