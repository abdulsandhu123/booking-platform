import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db.js";
import Booking from "../../../../../lib/models/Booking.js";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const bookings = await Booking.find({ guestEmail: decodeURIComponent(params.email) })
      .populate("property", "title city images pricePerNight")
      .sort({ checkIn: 1 })
      .lean();
    return NextResponse.json(bookings);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
