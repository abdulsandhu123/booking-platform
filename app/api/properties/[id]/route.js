import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db.js";
import Property from "../../../../lib/models/Property.js";
import { requireRole } from "../../../../lib/auth.js";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const property = await Property.findById(params.id).lean();
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });
    return NextResponse.json(property);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireRole(request, ["seller", "admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const property = await Property.findById(params.id);
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    const isOwner = property.owner.toString() === auth.user._id.toString();
    if (!isOwner && auth.user.role !== "admin") {
      return NextResponse.json(
        { error: "You can only edit your own properties." },
        { status: 403 }
      );
    }

    const body = await request.json();
    Object.assign(property, body);
    await property.save();
    return NextResponse.json(property);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireRole(request, ["seller", "admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const property = await Property.findById(params.id);
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    const isOwner = property.owner.toString() === auth.user._id.toString();
    if (!isOwner && auth.user.role !== "admin") {
      return NextResponse.json(
        { error: "You can only delete your own properties." },
        { status: 403 }
      );
    }

    await property.deleteOne();
    return NextResponse.json({ message: "Property deleted." });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
