import Booking from "./models/Booking.js";

/**
 * Two date ranges [aStart, aEnd) and [bStart, bEnd) overlap iff:
 *    aStart < bEnd  AND  aEnd > bStart
 *
 * We treat checkOut as exclusive (checkout morning === new checkin morning
 * is allowed, same-day turnover), which mirrors how real booking platforms
 * work.
 *
 * Returns an array of conflicting bookings (empty array = no conflict).
 */
export async function findConflictingBookings({
  propertyId,
  checkIn,
  checkOut,
  excludeBookingId = null,
}) {
  const query = {
    property: propertyId,
    status: "confirmed",
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return Booking.find(query).lean();
}

export function isValidDateRange(checkIn, checkOut) {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(inDate) || isNaN(outDate)) return { valid: false, reason: "Invalid date format" };
  if (inDate < today) return { valid: false, reason: "Check-in date cannot be in the past" };
  if (outDate <= inDate) return { valid: false, reason: "Check-out must be after check-in" };

  return { valid: true, inDate, outDate };
}
