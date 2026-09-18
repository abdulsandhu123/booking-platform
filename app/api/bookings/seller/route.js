import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db.js";
import Booking from "../../../../lib/models/Booking.js";
import Property from "../../../../lib/models/Property.js";
import { requireRole } from "../../../../lib/auth.js";

// Returns all bookings made on any property owned by the logged-in seller.
// Admins get every booking across the platform.
export async function GET(request) {
  const auth = await requireRole(request, ["seller", "admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    let propertyFilter = {};
    if (auth.user.role !== "admin") {
      const myProperties = await Property.find({ owner: auth.user._id }).select("_id").lean();
      const propertyIds = myProperties.map((p) => p._id);
      propertyFilter = { property: { $in: propertyIds } };
    }

    const bookings = await Booking.find(propertyFilter)
      .populate("property", "title city")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ count: bookings.length, bookings });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
