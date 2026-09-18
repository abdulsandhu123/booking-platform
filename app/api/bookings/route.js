import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db.js";
import Booking from "../../../lib/models/Booking.js";
import Property from "../../../lib/models/Property.js";
import { isValidDateRange } from "../../../lib/dateOverlap.js";

// Checks for overlapping confirmed bookings and, if none exist, creates the
// new booking. Runs inside a Mongo session when one is provided (real ACID
// transaction on a replica set); runs without one on a standalone server.
async function checkAndCreateBooking(
  { property, propertyDoc, guestName, guestEmail, dateCheck, guests },
  session
) {
  let query = Booking.find({
    property,
    status: "confirmed",
    checkIn: { $lt: dateCheck.outDate },
    checkOut: { $gt: dateCheck.inDate },
  });
  if (session) query = query.session(session);
  const conflicts = await query;

  if (conflicts.length > 0) {
    throw Object.assign(new Error("Dates unavailable"), {
      code: "DATE_CONFLICT",
      conflicts,
    });
  }

  const nights = Math.round(
    (dateCheck.outDate - dateCheck.inDate) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = nights * propertyDoc.pricePerNight;

  const createOptions = session ? { session } : {};
  const docs = await Booking.create(
    [
      {
        property,
        guestName,
        guestEmail,
        checkIn: dateCheck.inDate,
        checkOut: dateCheck.outDate,
        guests,
        totalPrice,
      },
    ],
    createOptions
  );

  return docs[0];
}

// MongoDB only allows multi-document transactions on a replica set / mongos.
// A plain standalone `mongod` (the default for local dev installs) throws
// this specific error — we detect it and fall back to a non-transactional
// check-then-create instead of crashing the request.
function isTransactionsUnsupported(err) {
  return (
    err.codeName === "IllegalOperation" ||
    err.code === 20 ||
    /Transaction numbers are only allowed/i.test(err.message || "")
  );
}

// POST /api/bookings
// Body: { property, guestName, guestEmail, checkIn, checkOut, guests }
export async function POST(request) {
  try {
    await connectDB();
    const { property, guestName, guestEmail, checkIn, checkOut, guests } = await request.json();

    if (!property || !guestName || !guestEmail || !checkIn || !checkOut || !guests) {
      return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 });
    }

    const dateCheck = isValidDateRange(checkIn, checkOut);
    if (!dateCheck.valid) {
      return NextResponse.json({ error: dateCheck.reason }, { status: 400 });
    }

    const propertyDoc = await Property.findById(property);
    if (!propertyDoc) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    if (guests > propertyDoc.maxGuests) {
      return NextResponse.json(
        { error: `This property allows a maximum of ${propertyDoc.maxGuests} guests` },
        { status: 400 }
      );
    }

    const bookingInput = { property, propertyDoc, guestName, guestEmail, dateCheck, guests };

    let createdBooking;
    const session = await mongoose.startSession();
    try {
      try {
        // Preferred path: atomic transaction (works when MongoDB is a
        // replica set / Atlas cluster / mongos).
        await session.withTransaction(async () => {
          createdBooking = await checkAndCreateBooking(bookingInput, session);
        });
      } catch (txErr) {
        if (isTransactionsUnsupported(txErr)) {
          // Fallback for a standalone MongoDB instance (typical local dev
          // setup). Slightly weaker guarantee against a same-instant race,
          // but the conflict check still runs immediately before creation.
          createdBooking = await checkAndCreateBooking(bookingInput, null);
        } else {
          throw txErr;
        }
      }
    } finally {
      session.endSession();
    }

    return NextResponse.json(createdBooking, { status: 201 });
  } catch (err) {
    if (err.code === "DATE_CONFLICT") {
      return NextResponse.json(
        {
          error: "Selected dates are no longer available for this property",
          conflictingRanges: err.conflicts.map((c) => ({
            checkIn: c.checkIn,
            checkOut: c.checkOut,
          })),
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
