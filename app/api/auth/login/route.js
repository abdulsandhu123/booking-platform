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
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    const token = signToken(user);
    return NextResponse.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
