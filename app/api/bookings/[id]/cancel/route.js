import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db.js";
import Booking from "../../../../../lib/models/Booking.js";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const booking = await Booking.findByIdAndUpdate(
      params.id,
      { status: "cancelled" },
      { new: true }
    );
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    return NextResponse.json(booking);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
