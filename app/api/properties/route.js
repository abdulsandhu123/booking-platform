import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db.js";
import Property from "../../../lib/models/Property.js";
import { findConflictingBookings } from "../../../lib/dateOverlap.js";
import { requireRole } from "../../../lib/auth.js";

// GET /api/properties?city=&minPrice=&maxPrice=&guests=&checkIn=&checkOut=&q=
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const guests = searchParams.get("guests");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const q = searchParams.get("q");

    const filter = {};
    if (city) filter.city = new RegExp(city, "i");
    if (guests) filter.maxGuests = { $gte: Number(guests) };
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }
    if (q) filter.$text = { $search: q };

    let properties = await Property.find(filter).sort({ createdAt: -1 }).lean();

    // If dates provided, filter out properties that are already booked
    // for that range (availability-aware search).
    if (checkIn && checkOut) {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);

      const availabilityChecks = await Promise.all(
        properties.map(async (p) => {
          const conflicts = await findConflictingBookings({
            propertyId: p._id,
            checkIn: inDate,
            checkOut: outDate,
          });
          return { property: p, available: conflicts.length === 0 };
        })
      );

      properties = availabilityChecks.filter((r) => r.available).map((r) => r.property);
    }

    return NextResponse.json({ count: properties.length, properties });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/properties  (seller/admin only)
export async function POST(request) {
  const auth = await requireRole(request, ["seller", "admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const body = await request.json();
    const property = await Property.create({ ...body, owner: auth.user._id });
    return NextResponse.json(property, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
