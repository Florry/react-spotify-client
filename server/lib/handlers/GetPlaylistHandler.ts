import PlaylistCache from "../cache/PlaylistCache";
import SpotifyApiClient from "../network/SpotifyApiClient";
import { Response } from "express";
import { ServerRequest } from "../interfaces/ServerRequest";
import { API_LOGIN_URI } from "../constants";

export default class GetPlaylistHandler {

	constructor(private playlistCache: PlaylistCache, private spotifyApiClient: SpotifyApiClient) { }

	async handle(request: ServerRequest, response: Response) {
		const playlistId = decodeURI(request.params.playlistId);
		const accessToken = request.accessToken;

		try {
			let playlist = await this.playlistCache.get(playlistId);

			console.log("\n");
			console.log(require("util").inspect(!playlist, null, null, true));
			console.log("\n");

			if (!playlist)
				playlist = await this.spotifyApiClient.getPlaylist(accessToken, playlistId);

			if (!playlist)
				response.json({});
			else
				response.json(playlist);
		} catch (err) {
			console.error(err);
		}
	}

}
