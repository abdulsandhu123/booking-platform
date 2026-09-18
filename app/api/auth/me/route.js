import { NextResponse } from "next/server";
import { getUserFromRequest, unauthorized } from "../../../../lib/auth.js";

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();
  return NextResponse.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
}
