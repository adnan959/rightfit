import { NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "rightfit_admin_session";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Clear session cookie
  response.cookies.delete(ADMIN_SESSION_COOKIE);

  return response;
}
