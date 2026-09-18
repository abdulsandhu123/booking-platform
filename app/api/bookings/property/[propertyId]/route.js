import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db.js";
import Booking from "../../../../../lib/models/Booking.js";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const bookings = await Booking.find({
      property: params.propertyId,
      status: "confirmed",
    })
      .select("checkIn checkOut -_id")
      .lean();
    return NextResponse.json(bookings);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
