"use server";

import { db } from "@/db";
import { user } from "@/db/schema/tables";
import { getSession } from "@/lib/auth";
import { bunqClient } from "@/lib/bunq/client";
import type { GenerateSignature } from "@/lib/bunq/types";
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

export const getAccount = async () => {
  const dbUser = await getDBUser();

  const account = await bunqClient.get<{
    Response: {
      MonetaryAccountBank: {
        balance: {
          value: string;
        };
        daily_limit: {
          value: string;
        };
      };
    }[];
  }>(`/v1/user/${dbUser.externalId}/monetary-account-bank/${dbUser.accountId}`, {
    headers: {
      "X-Bunq-Client-Authentication": dbUser.sessionToken,
    },
  });

  return account.data;
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

  const generateSignature = require("../lib/bunq/session") as GenerateSignature;

  const body = JSON.stringify({
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
  });

  const signature = generateSignature(body, dbUser.privateKey);

  await bunqClient.post(`/v1/user/${dbUser.externalId}/monetary-account/${dbUser.accountId}/payment`, body, {
    headers: {
      "X-Bunq-Client-Authentication": dbUser.sessionToken,
      "X-Bunq-Client-Signature": signature,
    },
  });
};

export const getAccountInfo = async () => {
  const dbUser = await getDBUser();
  const account = await getAccount();

  return {
    balance: Number(account.Response[0].MonetaryAccountBank.balance.value),
    dailyLimit: Number(account.Response[0].MonetaryAccountBank.daily_limit.value),
    accountId: dbUser.accountId,
    externalId: dbUser.externalId,
  };
};
