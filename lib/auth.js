import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectDB } from "./db.js";
import User from "./models/User.js";

// Reads the Bearer token from the request, verifies it, and returns the
// user document (minus password) — or null if not authenticated.
// Equivalent to the old Express `protect` middleware, but as a plain
// function since Route Handlers don't have a middleware chain.
export async function getUserFromRequest(request) {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();
    const user = await User.findById(decoded.id);
    return user || null;
  } catch {
    return null;
  }
}

export function unauthorized(message = "Not authenticated. Please log in.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(roles) {
  return NextResponse.json(
    { error: `This action requires one of these roles: ${roles.join(", ")}` },
    { status: 403 }
  );
}

// Convenience: fetch the user and check their role in one call.
// Returns { user } on success, or { response } holding the error to return.
export async function requireRole(request, roles) {
  const user = await getUserFromRequest(request);
  if (!user) return { response: unauthorized() };
  if (roles && !roles.includes(user.role)) return { response: forbidden(roles) };
  return { user };
}
