import PlaylistCache from "../cache/PlaylistCache";
import SpotifyApiClient from "../network/SpotifyApiClient";
import { Response } from "express";
import { ServerRequest } from "../interfaces/ServerRequest";

export default class GetPlaylistHandler {

	constructor(private playlistCache: PlaylistCache, private spotifyApiClient: SpotifyApiClient) { }

	async handle(request: ServerRequest, response: Response) {
		const playlistId = decodeURI(request.params.playlistId);
		const accessToken = request.accessToken;

		try {
			let playlist = await this.playlistCache.get(playlistId);

			if (!playlist)
				playlist = await this.spotifyApiClient.getPlaylist(accessToken, playlistId);

			response.json(playlist);
		} catch (err) {
			console.error(err);
		}
	}

}
