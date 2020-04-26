import HttpClient from "./HttpClient";
import PlaylistCache from "../cache/PlaylistCache";
import PlaylistsCache from "../cache/PlaylistsCache";
const promiseLimit = require("promise-limit");

// TODO: move to constants
const API_ROOT = "https://api.spotify.com/v1/";
const PATH_LOGGED_IN_USER_PLAYLISTS = "me/playlists";


// TODO: handle errors
export default class SpotifyApiClient {

	httpClient: HttpClient;

	constructor(private playlistCache: PlaylistCache, private playlistsCache: PlaylistsCache) {
		this.httpClient = new HttpClient(API_ROOT);
	}

	async getPlaylist(accessToken, playlistUri, next?: string, inputOffset?: number) {
		const tracks = [];

		let playlist = await this.getPlaylistFromCache(playlistUri);
		let total = 0;

		if (!playlist) {
			playlist = await this.httpClient.get(accessToken, `playlists/${playlistUri}`);
			await this.playlistCache.put(playlistUri, playlist);
		}

		const load = async (id, next, inputOffset) => {
			const LIMIT = 100;
			const playlist = await this.getPlaylistFromCache(playlistUri);
			const offset = inputOffset || 0;

			if (!!playlist && offset >= playlist.tracks.total)
				return;

			try {
				let path = next || `playlists/${playlistUri}/tracks`;

				if (!!offset)
					path = path.replace("offset=0", "offset=" + offset);

				const response = await this.httpClient.get(accessToken, path);

				tracks.push(...response.items);

				total = response.total;

				if (!next && response.total > response.offset && response.next !== null) {
					const promises = [];
					const timesToFetch = Math.ceil(response.total / LIMIT);
					const limit = promiseLimit(10);

					for (let i = 0; i < timesToFetch; i++)
						promises.push(limit(() => load(id, this.getNextString(response.next).replace(`offset=${LIMIT}`, "offset=" + ((i + 1 + offset) * LIMIT)), offset)));

					await Promise.all(promises);
				}
			} catch (err) {
				console.error(err);
			}
		}

		await load(playlistUri, next, inputOffset);

		// this._addTracks(tracks);

		if (!playlist.tracks)
			playlist = {
				tracks: {
					items: [],
					total: 0
				}
			};

		playlist.tracks.items = [...tracks.map((item, i) => ({ ...item, id: i }))];

		playlist.tracks.total = total;

		// TODO: bulk add
		if (!playlist.error)
			await this.addPlaylist(playlistUri, playlist);

		return playlist;
	}

	async getPlaylistsForLoggedInUser(accessToken: string, next?: string, offset?: number, fetchedPlaylists?: any[]) {
		if (!offset)
			offset = 0;

		const LIMIT = 50;

		let response;

		try {
			response = await this.httpClient.get(accessToken, next || PATH_LOGGED_IN_USER_PLAYLISTS + `?limit=${LIMIT}`);
		} catch (err) {
			console.warn(err);
			return;
		}

		const playlists: any[] = response.items;

		if (!next && response.total > response.offset && response.next !== null) {
			const promises = [];
			const timesToFetch = Math.ceil(response.total / LIMIT);
			const limit = promiseLimit(10);

			for (let i = 0; i < timesToFetch; i++)
				promises.push(
					limit(() =>
						this.getPlaylistsForLoggedInUser(accessToken, this.getNextString(response.next).replace(`offset=${LIMIT}`, "offset=" + ((i + 1) * LIMIT)), (i + 1) * LIMIT, playlists)
							.then(nextPlaylists => nextPlaylists.forEach(playlist => playlists.push(playlist)))
					));

			await Promise.all(promises)
				.catch(err => console.log(err));
		}

		// TODO: bulk add
		if (!response.error)
			playlists.forEach((playlist, i) => this.addSidebarPlaylist(playlist.uri?.replace("spotify:playlist:", ""), { ...playlist, index: offset + i }));

		return playlists;
	}

	private async getPlaylistFromCache(id: string) {
		return await this.playlistCache.get(id);
	}

	private getNextString(next: string) {
		return next.replace(API_ROOT, "");
	}

	private async addPlaylist(playlistUri: string, playlist) {
		const existingPlaylist = await this.playlistCache.get(playlistUri);

		if (!existingPlaylist)
			await this.playlistCache.put(playlistUri, playlist);
	}

	private async addSidebarPlaylist(playlistUri: string, playlist) {
		new Promise(async () => {
			const existingPlaylist = await this.playlistsCache.get(playlistUri);

			if (!existingPlaylist)
				await this.playlistsCache.put(playlistUri, playlist);
		});
	}

}
