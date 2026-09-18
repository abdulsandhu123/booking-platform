import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db.js";
import User from "../../../../lib/models/User.js";
import { signToken } from "../../../../lib/jwt.js";

function sanitizeUser(user) {
  return { _id: user._id, name: user.name, email: user.email, role: user.role };
}

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const allowedRoles = ["guest", "seller"]; // admin accounts are never self-registered
    const finalRole = allowedRoles.includes(role) ? role : "guest";

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const user = await User.create({ name, email, password, role: finalRole });
    const token = signToken(user);

    return NextResponse.json({ token, user: sanitizeUser(user) }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
