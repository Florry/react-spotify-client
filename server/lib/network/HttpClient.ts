import * as request from "request";

export default class HttpClient {

	/**
	 * @param {String} apiRoot
	*/
	constructor(private apiRoot) { }

    /**
     * @param {String} path
     */
	get(accessToken: string, path: string) {
		return this.request("GET", accessToken, path, null);
	}

	post(accessToken: string, path: string, body: any) {
		return this.request("POST", accessToken, path, body);
	}

	delete(accessToken: string, path: string, body: any) {
		return this.request("DELETE", accessToken, path, body);
	}

	put(accessToken: string, path: string, body: string) {
		return this.request("PUT", accessToken, path, body);
	}

	async request(method: string, accessToken: string, path: string, body?: any, pathIsFull?: boolean, additionalHeaders?: any) {
		const options = {
			method: method,
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + accessToken,
				...additionalHeaders
			}
		};

		if (body)
			options.body = JSON.stringify(body);

		return new Promise(resolve => {
			request[method.toLowerCase()](pathIsFull ? path : this.apiRoot + path, options, (err, response, body) => {
				try {
					let responseBody = {};

					try {
						responseBody = JSON.parse(response.body);
					} catch (err) { }

					if (response.status === 401 && responseBody && responseBody.error && responseBody.error.message === "The access token expired") {

					}

					if (response.status >= 400)
						throw responseBody;

					resolve(responseBody);
				} catch (err) {
					throw err;
				}
			});

		});


	}

}
