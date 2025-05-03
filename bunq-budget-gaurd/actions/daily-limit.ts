import { getSession } from "@/lib/auth";
import db from "../db";
import { eq } from "drizzle-orm";
import { user } from "../db/schema/tables";
import { bunqClient } from "@/lib/bunq/client";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export const MIN_DAILY_LIMIT = 0;
export const MAX_DAILY_LIMIT = 10_000;

export const setDailyLimit = async (amount: number) => {
  console.log("Setting daily limit:", amount);
  const session = await getSession();

  if (!session) {
    throw new Error("User not found");
  }

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.userId),
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  await bunqClient
    .put(
      `/v1/user/${dbUser.externalId}/monetary-account-bank/${dbUser.accountId}`,
      {
        daily_limit: {
          currency: "EUR",
          value: amount.toString(),
        },
      },
      {
        headers: {
          "X-Bunq-Client-Authentication": dbUser.sessionToken,
        },
      },
    )
    .then((res) => {
      if (amount === 10_000) toast("Your account has been unlocked.");
      redirect("/dashboard");
    });
};
