import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import Property from "../lib/models/Property.js";
import User from "../lib/models/User.js";

dotenv.config({ path: ".env.local" });
dotenv.config(); // fall back to .env if .env.local isn't present

const sampleProperties = [
  {
    title: "Cozy Studio near Liberty Market",
    description: "Bright studio apartment, walking distance to cafes and shopping.",
    city: "Lahore",
    address: "Liberty Market, Gulberg III, Lahore",
    pricePerNight: 6500,
    maxGuests: 2,
    bedrooms: 1,
    amenities: ["WiFi", "AC", "Kitchen"],
    images: [],
    hostName: "Ayesha K.",
  },
  {
    title: "Modern 2BHK in DHA Phase 6",
    description: "Spacious modern apartment with balcony views and secure parking.",
    city: "Lahore",
    address: "DHA Phase 6, Lahore",
    pricePerNight: 12000,
    maxGuests: 4,
    bedrooms: 2,
    amenities: ["WiFi", "AC", "Parking", "Washer"],
    images: [],
    hostName: "Bilal R.",
  },
  {
    title: "Sea View Apartment, Clifton",
    description: "Stunning sea-facing apartment with a rooftop terrace.",
    city: "Karachi",
    address: "Clifton Block 5, Karachi",
    pricePerNight: 15000,
    maxGuests: 5,
    bedrooms: 2,
    amenities: ["WiFi", "AC", "Sea View", "Elevator"],
    images: [],
    hostName: "Sana M.",
  },
  {
    title: "Hillside Cottage, Murree",
    description: "Peaceful pine-forest cottage, perfect for weekend getaways.",
    city: "Murree",
    address: "Jhika Gali, Murree",
    pricePerNight: 9000,
    maxGuests: 6,
    bedrooms: 3,
    amenities: ["WiFi", "Fireplace", "Parking"],
    images: [],
    hostName: "Usman T.",
  },
  {
    title: "Budget Room in F-10",
    description: "Simple, clean private room close to Islamabad's business district.",
    city: "Islamabad",
    address: "F-10 Markaz, Islamabad",
    pricePerNight: 4000,
    maxGuests: 2,
    bedrooms: 1,
    amenities: ["WiFi", "AC"],
    images: [],
    hostName: "Hina F.",
  },
];

async function seed() {
  await connectDB();
  await Property.deleteMany({});
  await User.deleteMany({ email: { $in: ["seller@demo.com", "admin@demo.com"] } });

  // Demo accounts so you can log in immediately without registering.
  const demoSeller = await User.create({
    name: "Demo Seller",
    email: "seller@demo.com",
    password: "password123",
    role: "seller",
  });

  await User.create({
    name: "Demo Admin",
    email: "admin@demo.com",
    password: "password123",
    role: "admin",
  });

  const withOwner = sampleProperties.map((p) => ({ ...p, owner: demoSeller._id }));
  await Property.insertMany(withOwner);

  console.log(`Seeded ${sampleProperties.length} properties.`);
  console.log("Demo seller login -> email: seller@demo.com | password: password123");
  console.log("Demo admin login  -> email: admin@demo.com  | password: password123");
  await mongoose.disconnect();
}

seed();
