import type { Donation, StreamAPI, streamKey } from "trakteerjs";
import { PassThrough } from "node:stream";
import trakteer from "trakteerjs";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const { pageId, streamApiKey } = body;

	if (!pageId || !streamApiKey) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing pageId or streamApiKey"
		});
	}

	try {
		const connectionResult = await new Promise<{ client: StreamAPI, ts: Date }>(
			(resolve, reject) => {
				let settled = false;
				const tempClient = new trakteer.streamAPI(
					pageId,
					streamApiKey as streamKey
				);

				const onError = (err: any) => {
					if (!settled) {
						settled = true;
						reject(err);
					}
				};

				const onConnect = (ts: Date) => {
					if (!settled) {
						settled = true;
						resolve({ client: tempClient, ts });
					}
				};

				tempClient.on("connect", onConnect);
				tempClient.on("error", onError);
			}
		);

		const { client, ts } = connectionResult;
		const stream = new PassThrough();
		const sendEvent = (type: string, payload: any) => {
			stream.write(`data: ${JSON.stringify({ type, payload })}\n\n`);
		};

		sendEvent("log", `Berhasil terkoneksi dengan API Trakteer pada ${ts.toLocaleTimeString()}`);

		client.on("donation", (donation: Donation) => {
			sendEvent("donation", {
				name: donation.supporter_name,
				message: donation.supporter_message
			});
		});

		client.on("error", (err: any) => {
			// Errors after initial connection
			sendEvent("log", `Trakteer client error: ${err}`);
			stream.end();
		});

		event.node.res.on("close", () => {
			stream.end();
		});

		return sendStream(event, stream);
	} catch (error: any) {
		// Catches the rejection from the new Promise
		if (error.response && error.response.status === 404) {
			throw createError({
				statusCode: 401,
				statusMessage:
          "Authentication failed. Please check your Page ID and Stream API Key."
			});
		}
		console.error("Trakteer connection error:", error);
		throw createError({
			statusCode: 500,
			statusMessage: "An unexpected error occurred while connecting to Trakteer."
		});
	}
});
