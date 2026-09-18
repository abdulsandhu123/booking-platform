import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    city: { type: String, required: true, index: true },
    address: { type: String, required: true },
    pricePerNight: { type: Number, required: true, min: 0 },
    maxGuests: { type: Number, required: true, min: 1 },
    bedrooms: { type: Number, default: 1 },
    amenities: [{ type: String }],
    images: [{ type: String }],
    hostName: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Text index for basic search across title/description/city
propertySchema.index({ title: "text", description: "text", city: "text" });

export default mongoose.models.Property || mongoose.model("Property", propertySchema);
