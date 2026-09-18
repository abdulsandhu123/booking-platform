import { NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/db.js";
import User from "../../../../../../lib/models/User.js";
import { requireRole } from "../../../../../../lib/auth.js";

export async function PATCH(request, { params }) {
  const auth = await requireRole(request, ["admin"]);
  if (auth.response) return auth.response;

  try {
    await connectDB();
    const { role } = await request.json();
    if (!["guest", "seller", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    if (params.id === auth.user._id.toString()) {
      return NextResponse.json({ error: "You can't change your own role." }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(params.id, { role }, { new: true });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
