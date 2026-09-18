import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db.js";
import User from "../../../../../lib/models/User.js";
import Property from "../../../../../lib/models/Property.js";
import { requireRole } from "../../../../../lib/auth.js";

export async function DELETE(request, { params }) {
  const auth = await requireRole(request, ["admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    if (params.id === auth.user._id.toString()) {
      return NextResponse.json(
        { error: "You can't delete your own account." },
        { status: 400 }
      );
    }

    const user = await User.findById(params.id);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    await Property.deleteMany({ owner: user._id });
    await user.deleteOne();

    return NextResponse.json({ message: "User and their listings were removed." });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
