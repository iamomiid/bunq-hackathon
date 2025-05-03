import { NextResponse } from "next/server";
import db from "../../../../../db";
import { user } from "../../../../../db/schema/tables";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import Iron from "@hapi/iron";

// Use environment variables for sensitive data like the secret key
const TOKEN_SECRET =
  process.env.SESSION_SECRET || "this-is-a-default-secret-key-replace-it";
const TOKEN_NAME = "bunq_session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Here you might want to add validation to check if the API key is valid
    // by making a simple call to the Bunq API (e.g., fetching user info).
    // This is crucial for security.
    // Example:
    // const isValid = await validateBunqApiKey(apiKey);
    // if (!isValid) {
    //     return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    // }

    // Check if user exists with this API key
    let userId;
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.apiKey, apiKey))
      .limit(1);

    if (existingUser.length > 0) {
      // User exists, get ID
      userId = existingUser[0].id;
    } else {
      // Create new user
      const newUserId = uuidv4();
      const [createdUser] = await db
        .insert(user)
        .values({
          id: newUserId,
          apiKey: apiKey,
        })
        .returning();

      userId = createdUser.id;
    }

    // Create session data
    const sessionData = { apiKey, userId };

    // Encrypt the session data
    const encryptedToken = await Iron.seal(
      sessionData,
      TOKEN_SECRET,
      Iron.defaults
    );

    // Create the response
    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

    // Set the cookie in the response headers
    response.cookies.set(TOKEN_NAME, encryptedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    // Check if the error is due to invalid JSON
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Placeholder for actual Bunq API key validation
// async function validateBunqApiKey(apiKey: string): Promise<boolean> {
//     // Implement Bunq API call here to validate the key
//     console.warn("API Key validation is not implemented.");
//     return true; // Assuming valid for now
// }
