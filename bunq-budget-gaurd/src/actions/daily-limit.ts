"use server";
import { getSession } from "@/lib/auth";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { user } from "../db/schema/tables";
import { bunqClient } from "@/lib/bunq/client";
import { redirect } from "next/navigation";

export const setDailyLimit = async (amount: number, userId: string, accountId: string, token: string) => {
  return await bunqClient.put(
    `/v1/user/${userId}/monetary-account-bank/${accountId}`,
    {
      daily_limit: {
        currency: "EUR",
        value: amount.toString(),
      },
    },
    {
      headers: {
        "X-Bunq-Client-Authentication": token,
      },
    },
  );
};

export const setUserDailyLimit = async (amount: number) => {
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

  await setDailyLimit(amount, dbUser.externalId, dbUser.accountId, dbUser.sessionToken).then((res) => {
    redirect("/dashboard");
  });
};
