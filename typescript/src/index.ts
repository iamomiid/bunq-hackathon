import axios from "axios";
import { nanoid } from "nanoid/non-secure";
import { writeFile, readFile } from "fs/promises";
import type {
	BunqAccountResponse,
	BunqCreateUserResponse,
	BunqInstallationResponse,
	BunqSessionResponse,
	ClientKey,
	GenerateSignature,
} from "./types";

const generatedKey = require("./client-key") as ClientKey;
const generateSignature = require("./session") as GenerateSignature;

const client = axios.create({
	baseURL: "https://public-api.sandbox.bunq.com",
});

client.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		console.log(error.response.data);
		return error.response.data;
	}
);

const saveOrReturn = async <T>(fn: () => Promise<T>, fileName: string) => {
	try {
		return await readFile(fileName, "utf-8").then((r) => JSON.parse(r) as T);
	} catch (error) {
		const data = await fn();
		await writeFile(fileName, JSON.stringify(data, null, 2));
		return data;
	}
};

const run = async () => {
	const key = await saveOrReturn(
		() => Promise.resolve(generatedKey),
		"bunq-client-key.json"
	);

	const user = await saveOrReturn(
		() =>
			client
				.post<BunqCreateUserResponse>("/v1/sandbox-user-person")
				.then((r) => r.data),
		"bunq-user.json"
	);

	const userId = user.Response[0].ApiKey.user.UserPerson.id;
	const apiKey = user.Response[0].ApiKey.api_key;

	const installation = await saveOrReturn(
		() =>
			client
				.post<BunqInstallationResponse>("/v1/installation", {
					client_public_key: key.public_key_client_fmt,
				})
				.then((r) => r.data),
		"bunq-installation.json"
	);

	const token = installation.Response[1].Token!.token;

	const deviceServer = await saveOrReturn(
		() =>
			client
				.post(
					"/v1/device-server",
					{
						description: "Postman",
						secret: apiKey,
						permitted_ips: ["*"],
					},
					{
						headers: {
							"X-Bunq-Client-Authentication": token,
						},
					}
				)
				.then((r) => r.data),
		"bunq-device-server.json"
	);

	const sessionReq = JSON.stringify({
		secret: apiKey,
	});
	const signature = generateSignature(sessionReq, key.private_key_client);

	const sessionRes = await saveOrReturn(
		() =>
			client
				.post<BunqSessionResponse>(
					"/v1/session-server",
					{
						secret: apiKey,
					},
					{
						headers: {
							"X-Bunq-Client-Authentication": token,
							"X-Bunq-Client-Signature": signature,
						},
					}
				)
				.then((r) => r.data),
		"bunq-session.json"
	);

	const sessionToken = sessionRes.Response[1].Token!.token;

	const account = await saveOrReturn<BunqAccountResponse>(
		() =>
			client
				.post(
					`/v1/user/${userId}/monetary-account-bank`,
					{
						currency: "EUR",
						status: "ACTIVE",
					},
					{
						headers: {
							"X-Bunq-Client-Authentication": sessionToken,
						},
					}
				)
				.then((r) => r.data),
		"bunq-account.json"
	);

	const accountId = account.Response[0].Id.id;

	console.log(key.private_key_client);

	// await client.post(
	// 	`/v1/user/${userId}/monetary-account/${accountId}/request-inquiry`,
	// 	{
	// 		amount_inquired: {
	// 			value: "500",
	// 			currency: "EUR",
	// 		},
	// 		counterparty_alias: {
	// 			type: "EMAIL",
	// 			value: "sugardaddy@bunq.com",
	// 			name: "Sugar Daddy",
	// 		},
	// 		description: "Youre the best!",
	// 		allow_bunqme: false,
	// 	},
	// 	{
	// 		headers: {
	// 			"X-Bunq-Client-Authentication": sessionToken,
	// 		},
	// 	}
	// );

	// await client.post(
	// 	`/v1/user/${userId}/notification-filter-url`,
	// 	{
	// 		notification_filters: [
	// 			{
	// 				category: "PAYMENT",
	// 				notification_target: "https://pitiful-daughter-86.webhook.cool",
	// 			},
	// 		],
	// 	},
	// 	{
	// 		headers: {
	// 			"X-Bunq-Client-Authentication": sessionToken,
	// 		},
	// 	}
	// );

	// await client.post(
	// 	`/v1/user/${userId}/monetary-account-bank/${accountId}`,
	// 	{
	// 		daily_limit: {
	// 			currency: "EUR",
	// 			value: "0",
	// 		},
	// 	},
	// 	{
	// 		headers: {
	// 			"X-Bunq-Client-Authentication": sessionToken,
	// 		},
	// 	}
	// );
};

run();
