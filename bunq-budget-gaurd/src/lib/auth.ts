import { cookies } from "next/headers";
import Iron from "@hapi/iron";

// Define the structure of your session data
interface SessionData {
  apiKey: string;
  userId: string;
  // Add other user/session data as needed
  // e.g., createdAt?: number;
}

// Use environment variables for sensitive data like the secret key
const TOKEN_SECRET =
  process.env.SESSION_SECRET || "this-is-a-default-secret-key-replace-it"; // Replace with a strong secret in .env!
const TOKEN_NAME = "bunq_session";

if (TOKEN_SECRET === "this-is-a-default-secret-key-replace-it") {
  console.warn(
    "WARNING: Using default session secret. Please set SESSION_SECRET environment variable."
  );
}

// Encrypts session data
async function encrypt(data: SessionData): Promise<string> {
  return await Iron.seal(data, TOKEN_SECRET, Iron.defaults);
}

// Decrypts session data
async function decrypt(token: string): Promise<SessionData | null> {
  try {
    return await Iron.unseal(token, TOKEN_SECRET, Iron.defaults);
  } catch (error) {
    console.error("Failed to decrypt session token:", error);
    return null;
  }
}

// Sets the session cookie
export async function setSessionCookie(
  sessionData: SessionData
): Promise<void> {
  const encryptedToken = await encrypt(sessionData);
  const cookieStore = await cookies(); // Await the cookie store

  cookieStore.set(TOKEN_NAME, encryptedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // Example: 7 days
    path: "/",
    sameSite: "lax", // Or 'strict' depending on your needs
  });
}

// Gets session data from the cookie
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies(); // Await the cookie store
  const cookie = cookieStore.get(TOKEN_NAME);

  if (!cookie || !cookie.value) {
    return null;
  }

  const sessionData = await decrypt(cookie.value);
  return sessionData;
}

// Gets only the API key from the session cookie
export async function getApiKeyFromSession(): Promise<string | null> {
  const session = await getSession();
  return session?.apiKey ?? null;
}

// Clears the session cookie (logout)
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies(); // Await the cookie store
  cookieStore.delete(TOKEN_NAME);
}
