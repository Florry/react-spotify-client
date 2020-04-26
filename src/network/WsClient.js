import uuid from "uuid";

/** A drop in replacement for the HttpClient where needed */
export default class WsClient {

	_queuedRequests = [];

	constructor() {
		//TODO: move to constant
		this._ws = new WebSocket("ws://localhost:8080");

		this._ws.addEventListener("open", () => console.log("\x1b[42mWEBSOCKET OPEN"));
		this._ws.addEventListener("close", (event) => console.log("\x1b[41mWEBSOCKET CLOSED", event));
		this._ws.addEventListener("error", (event) => console.log("\x1b[41mWEBSOCKET ERROR", event));
		this._ws.addEventListener("message", (msg) => console.log("\x1b[44mWEBSOCKET MESSAGE", msg));
	}

    /**
     * @param {String} accessToken
     * @param {String} path
     * @param {Boolean} fullPath
     */
	get(accessToken, path, fullPath = false) {
		return this._request("GET", accessToken, path, null, fullPath);
	}

    /**
     * @param {String} path
     * @param {Object=} body
     */
	post(accessToken, path, body) {
		return this._request("POST", accessToken, path, body);
	}

    /**
     * @param {String} path
     * @param {Object=} body
     */
	delete(accessToken, path, body) {
		return this._request("DELETE", accessToken, path, body);
	}

    /**
     * @param {String} path
     * @param {Object=} body
     */
	put(accessToken, path, body) {
		return this._request("PUT", accessToken, path, body);
	}

    /**
     * @param {String} method
     * @param {String} path
     * @param {Object=} body
     * @param {Boolean=} pathIsFull
     * @param {Object=} additionalHeaders
     */
	async _request(method, accessToken, path, body = null, pathIsFull, additionalHeaders) {
		const options = {
			method: method,
			headers: {
				"content-Type": "application/json",
				accessToken,
				...additionalHeaders
			}
		};

		if (body)
			options.body = JSON.stringify(body);

		const replyTo = uuid.v4();
		const message = JSON.stringify({
			path,
			...options,
			replyTo
		});

		console.log(message);

		if (!this._ws.readyState) {
			await new Promise((resolve) => {
				this._ws.addEventListener("open", () => resolve());
				this._ws.removeEventListener("open", () => resolve());
			});
		}

		return new Promise(resolve => {
			this._ws.send(message);

			const handleResponse = (msg) => {
				const message = JSON.parse(msg.data);

				console.log(message.data, replyTo);

				if (message.replyTo === replyTo) {
					this._ws.removeEventListener("message", (msg) => handleResponse(msg));

					resolve(message.data);
				}
			};

			this._ws.addEventListener("message", (msg) => handleResponse(msg));
		});
	}

}
