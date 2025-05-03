"use server";

import { bunqClient } from "@/lib/bunq/client";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { getSession } from "@/lib/auth";
import { user } from "../db/schema/tables";
import type { PaymentAccountDetailsResponse } from "@/lib/bunq/types";

export const isAccountLimited = async () => {
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

  const account = await bunqClient
    .get<PaymentAccountDetailsResponse>(`/v1/user/${dbUser.externalId}/monetary-account-bank/${dbUser.accountId}`, {
      headers: {
        "X-Bunq-Client-Authentication": dbUser.sessionToken,
      },
    })
    .then((res) => res.data);

  return account.Response[0].MonetaryAccountBank.daily_limit.value === "0";
};
