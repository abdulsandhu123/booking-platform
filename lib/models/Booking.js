import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

// Speeds up the overlap query used in dateOverlap.js
bookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
