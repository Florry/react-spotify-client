/** @typedef {import("../stores/AuthStore").default} AuthStore */

/**
 * Generic http client
 */
class HttpClient {

	/**
	 * @param {String} apiRoot
	*/
	constructor(apiRoot) {
		this.apiRoot = apiRoot;
	}

    /**
     * @param {String} path
     */
	get(accessToken, path) {
		return this._request("GET", accessToken, path, null);
	}

    /**
     * @param {String} path
     * @param {Object} body
     */
	post(accessToken, path, body) {
		return this._request("POST", accessToken, path, body);
	}

    /**
     * @param {String} path
     * @param {Object} body
     */
	delete(accessToken, path, body) {
		return this._request("DELETE", accessToken, path, body);
	}

    /**
     * @param {String} path
     * @param {Object} body
     */
	put(accessToken, path, body) {
		return this._request("PUT", accessToken, path, body);
	}

    /**
     * @param {String} method
     * @param {String} path
     * @param {Object=} body
     */
	async _request(method, accessToken, path, body = null) {
		const options = {
			method: method,
			headers: new Headers({
				'Authorization': 'Bearer ' + accessToken
			})
		};

		if (body)
			options.body = JSON.stringify(body);

		try {
			const response = await fetch(this.apiRoot + path, options);

			if (response.status === 401) {
				// localStorage.removeItem("accessToken");
				// window.location.href = "./";
			}

			let responseBody = {};

			try {
				responseBody = await response.json();
			} catch (err) { }

			if (response.status >= 400)
				throw responseBody;

			return responseBody;
		} catch (err) {
			throw err;
		}
	}
}

export default HttpClient;
