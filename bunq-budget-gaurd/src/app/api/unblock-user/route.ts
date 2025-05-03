import { setDailyLimit } from "@/actions/daily-limit";
import { db } from "@/db";
import { user } from "@/db/schema/tables";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, body.user_id),
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await setDailyLimit(10_000, dbUser.id, dbUser.accountId, dbUser.sessionToken);

  return NextResponse.json({ message: "User is unblocked" }, { status: 200 });
};
