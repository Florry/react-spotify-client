import SpotifyApiClient from "../network/SpotifyApiClient";

export default function getToken(spotifyApiClient: SpotifyApiClient) {
	return async function (request, response, next) {
		const accessToken = await spotifyApiClient.getAccessToken();

		if (!request.headers.authorization) {
			response.status(401);
			response.end();
		}
		else
			request.accessToken = accessToken;

		next();
	}

}
