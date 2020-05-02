import { ServerRequest } from "../interfaces/ServerRequest";
import { Response } from "express";
import AuthCache from "../cache/AuthCache";
import SpotifyApiClient from "../network/SpotifyApiClient";

export default class SaveAccessToken {

	constructor(private authCache: AuthCache, private spotifyClient: SpotifyApiClient) { }

	async handle(request: ServerRequest, response: Response) {
		const accessToken = request.body.accessToken;
		const spotifyResponse = await this.spotifyClient.getAuthToken(accessToken);

		// TODO:
		this.authCache.put("accessToken", spotifyResponse);

		try {
			response.json(spotifyResponse);
		} catch (err) {
			console.error(err);
		}
	}


}
