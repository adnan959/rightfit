import { NextRequest, NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "rightfit_admin_session";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD not configured in environment");
      return NextResponse.json(
        { error: "Admin access not configured" },
        { status: 500 }
      );
    }

    // Check password
    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Create session hash
    const sessionHash = Buffer.from(adminPassword).toString("base64");

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    // Set session cookie (HttpOnly, Secure in production)
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionHash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
