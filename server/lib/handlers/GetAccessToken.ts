import { ServerRequest } from "../interfaces/ServerRequest";
import { Response } from "express";
import SpotifyApiClient from "../network/SpotifyApiClient";

export default class GetAccessToken {

	constructor(private spotifyClient: SpotifyApiClient) { }

	// TODO: security

	async handle(request: ServerRequest, response: Response) {
		const spotifyResponse = await this.spotifyClient.getAccessToken();

		try {
			response.json(spotifyResponse);
		} catch (err) {
			console.error(err);
		}
	}


}
