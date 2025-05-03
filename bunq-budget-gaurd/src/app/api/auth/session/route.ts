import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth"; // Use path alias

// This route handler checks the session cookie and returns basic session status.
// It DOES NOT expose the sensitive API key to the client.
export async function GET() {
  try {
    const session = await getSession();

    if (session && session.apiKey) {
      // User is logged in
      // Return non-sensitive data. Add other relevant user info if needed.
      return NextResponse.json({
        isLoggedIn: true,
        userId: session.userId,
      });
    } else {
      // User is not logged in
      return NextResponse.json({ isLoggedIn: false });
    }
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
