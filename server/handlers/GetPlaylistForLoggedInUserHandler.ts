import PlaylistsCache from "../cache/PlaylistsCache";
import SpotifyApiClient from "../network/SpotifyApiClient";
import { ServerRequest } from "../interfaces/ServerRequest";
import { Response } from "express";

export default class GetPlaylistForLoggedInUserHandler {

	constructor(private playlistsCache: PlaylistsCache, private spotifyApiClient: SpotifyApiClient) { }

	async handle(request: ServerRequest, response: Response) {
		const accessToken = request.accessToken;

		let playlists: any[];

		const cachedPlaylists = await this.playlistsCache.getAll();

		if (cachedPlaylists.length === 0)
			// TODO: implement more flexible caching for this
			playlists = await this.spotifyApiClient.getPlaylistsForLoggedInUser(accessToken);
		else
			playlists = cachedPlaylists.sort((a, b) => a.index - b.index);

		response.json(playlists);
	}

}
