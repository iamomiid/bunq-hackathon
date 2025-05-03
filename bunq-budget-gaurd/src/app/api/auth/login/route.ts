import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema/tables";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import Iron from "@hapi/iron";
import type {
  BunqAccountResponse,
  BunqInstallationResponse,
  BunqSessionResponse,
  ClientKey,
  GenerateSignature,
} from "@/lib/bunq/types";
import { bunqClient } from "@/lib/bunq/client";

// Use environment variables for sensitive data like the secret key
const TOKEN_SECRET = process.env.SESSION_SECRET || "this-is-a-default-secret-key-replace-it";
const TOKEN_NAME = "bunq_session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
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
    const existingUser = await db.select().from(user).where(eq(user.apiKey, apiKey)).limit(1);

    if (existingUser.length > 0) {
      // User exists, get ID
      userId = existingUser[0].id;
    } else {
      // Create new user
      const generatedKey = require("../../../../lib/bunq/client-key") as ClientKey;
      const generateSignature = require("../../../../lib/bunq/session") as GenerateSignature;
      console.log("Generated Key");

      const installation = await bunqClient
        .post<BunqInstallationResponse>("/v1/installation", {
          client_public_key: generatedKey.public_key_client_fmt,
        })
        .then((r) => r.data);
      const installationToken = installation.Response[1].Token!.token;
      console.log("Installation Token", installationToken);

      const deviceServer = await bunqClient
        .post<BunqAccountResponse>(
          "/v1/device-server",
          {
            description: "Postman",
            secret: apiKey,
            permitted_ips: ["*"],
          },
          {
            headers: {
              "X-Bunq-Client-Authentication": installationToken,
            },
          },
        )
        .then((r) => r.data);
      const deviceId = deviceServer.Response[0].Id!.id;
      console.log("Device ID", deviceId);

      const sessionReq = JSON.stringify({
        secret: apiKey,
      });
      const signature = generateSignature(sessionReq, generatedKey.private_key_client);

      const session = await bunqClient
        .post<BunqSessionResponse>(
          "/v1/session-server",
          {
            secret: apiKey,
          },
          {
            headers: {
              "X-Bunq-Client-Authentication": installationToken,
              "X-Bunq-Client-Signature": signature,
            },
          },
        )
        .then((r) => r.data);
      const sessionToken = session.Response[1].Token!.token;
      const externalUserId = session.Response[2].UserPerson!.id;

      console.log("Session", sessionToken, externalUserId);

      const account = await bunqClient
        .post<BunqAccountResponse>(
          `/v1/user/${externalUserId}/monetary-account-bank`,
          {
            currency: "EUR",
            status: "ACTIVE",
          },
          {
            headers: {
              "X-Bunq-Client-Authentication": sessionToken,
            },
          },
        )
        .then((r) => r.data);
      const accountId = account.Response[0].Id.id;
      console.log("Account", accountId);

      await bunqClient.post(
        `/v1/user/${externalUserId}/notification-filter-url`,
        {
          notification_filters: [
            {
              category: "PAYMENT",
              notification_target: process.env.BASE_URL + "/api/webhook",
            },
          ],
        },
        {
          headers: {
            "X-Bunq-Client-Authentication": sessionToken,
          },
        },
      );
      console.log("Registered Webhook");

      const newUserId = uuidv4();
      const [createdUser] = await db
        .insert(user)
        .values({
          id: newUserId,
          apiKey: apiKey,
          privateKey: generatedKey.private_key_client,
          publicKey: generatedKey.public_key_client,
          publicKeyFmt: generatedKey.public_key_client_fmt,
          installationToken: installationToken,
          sessionToken: sessionToken,
          deviceId: deviceId.toString(),
          externalId: externalUserId.toString(),
          accountId: accountId.toString(),
        })
        .returning();

      userId = createdUser.id;
      console.log("Created User", userId);
    }

    // Create session data
    const sessionData = { apiKey, userId };

    // Encrypt the session data
    const encryptedToken = await Iron.seal(sessionData, TOKEN_SECRET, Iron.defaults);

    // Create the response
    const response = NextResponse.json({ message: "Login successful" }, { status: 200 });

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
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Placeholder for actual Bunq API key validation
// async function validateBunqApiKey(apiKey: string): Promise<boolean> {
//     // Implement Bunq API call here to validate the key
//     console.warn("API Key validation is not implemented.");
//     return true; // Assuming valid for now
// }
