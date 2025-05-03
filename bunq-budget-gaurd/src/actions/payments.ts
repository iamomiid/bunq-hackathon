"use server";

import { db } from "@/db";
import { user } from "@/db/schema/tables";
import { getSession } from "@/lib/auth";
import { bunqClient } from "@/lib/bunq/client";
import { eq } from "drizzle-orm";

const getDBUser = async () => {
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

  return dbUser;
};

export const getBalance = async () => {
  const dbUser = await getDBUser();

  const account = await bunqClient.get<{
    Response: {
      MonetaryAccountBank: {
        balance: {
          value: string;
        };
      };
    }[];
  }>(`/v1/user/${dbUser.externalId}/monetary-account-bank/${dbUser.accountId}`, {
    headers: {
      "X-Bunq-Client-Authentication": dbUser.sessionToken,
    },
  });

  return Number(account.data.Response[0].MonetaryAccountBank.balance.value);
};

export const addMoneyBySugarDadddy = async (amount: number) => {
  const dbUser = await getDBUser();

  await bunqClient.post(
    `/v1/user/${dbUser.externalId}/monetary-account/${dbUser.accountId}/request-inquiry`,
    {
      amount_inquired: {
        value: amount.toString(),
        currency: "EUR",
      },
      counterparty_alias: {
        type: "EMAIL",
        value: "sugardaddy@bunq.com",
        name: "Sugar Daddy",
      },
      description: "Youre the best!",
      allow_bunqme: false,
    },
    {
      headers: {
        "X-Bunq-Client-Authentication": dbUser.sessionToken,
      },
    },
  );
};

export const doPayment = async (amount: number, description: string) => {
  const dbUser = await getDBUser();

  await bunqClient.post(
    `/v1/user/${dbUser.externalId}/monetary-account/${dbUser.accountId}/payment`,
    {
      amount: {
        value: amount.toString(),
        currency: "EUR",
      },
      counterparty_alias: {
        type: "EMAIL",
        value: "sugardaddy@bunq.com",
        name: "Sugar Daddy",
      },
      description: description,
    },
    {
      headers: {
        "X-Bunq-Client-Authentication": dbUser.sessionToken,
      },
    },
  );
};
