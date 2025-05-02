import axios from "axios";
import { nanoid } from "nanoid/non-secure";
import { writeFile, readFile } from "fs/promises";
import type {
	BunqCreateUserResponse,
	BunqInstallationResponse,
	ClientKey,
} from "./types";

const key = require("./client-key") as ClientKey;

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
	const user = await saveOrReturn(
		() =>
			client
				.post<BunqCreateUserResponse>("/v1/sandbox-user-person")
				.then((r) => r.data),
		"bunq-user.json"
	);

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
			client.post(
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
			),
		"bunq-device-server.json"
	);

	console.log({ deviceServer });
};

run();
