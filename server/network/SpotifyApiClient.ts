import HttpClient from "./HttpClient";
import PlaylistCache from "../cache/PlaylistCache";
import PlaylistsCache from "../cache/PlaylistsCache";
import AuthCache from "../cache/AuthCache";
const request = require("request");

const promiseLimit = require("promise-limit");

// TODO: move to constants
const API_ROOT = "https://api.spotify.com/v1/";
const PATH_LOGGED_IN_USER_PLAYLISTS = "me/playlists";

interface AccessToken {
	accessToken: string;
	refreshToken: string;
	expiresIn: Date;
	scope: string;
}

// TODO: handle errors
export default class SpotifyApiClient {

	accessToken: AccessToken | null;

	httpClient: HttpClient;

	constructor(private playlistCache: PlaylistCache, private playlistsCache: PlaylistsCache, private authCache: AuthCache) {
		this.httpClient = new HttpClient(API_ROOT);
	}

	async getPlaylist(accessToken2, playlistUri, next?: string, inputOffset?: number) {
		const accessToken = await this.getAccessToken();

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
		// const accessToken = await this.getAccessToken();

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
		// TODO: BULK ADD
		const existingPlaylist = await this.playlistCache.get(playlistUri);

		if (!existingPlaylist)
			await this.playlistCache.put(playlistUri, playlist);
	}

	private async addSidebarPlaylist(playlistUri: string, playlist) {
		// TODO: BULK ADD
		new Promise(async () => {
			const existingPlaylist = await this.playlistsCache.get(playlistUri);

			if (!existingPlaylist)
				await this.playlistsCache.put(playlistUri, playlist);
		});
	}

	async getAuthToken(code) {
		return new Promise(resolve => {
			const CLIENT_ID = "e3ab4c22331045f0b7f6e57235b58b47";
			const CLIENT_SECRET = "4bcbb1592baf40548afae22c726df549";

			const authOptions = {
				url: "https://accounts.spotify.com/api/token",
				headers: { "Authorization": "Basic " + (new Buffer(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64")) },
				form: {
					code,
					redirect_uri: "http://localhost:3000/spotify-api-calllback",
					grant_type: "authorization_code"
				},
				json: true
			};

			// TODO: use HttpClient
			request.post(authOptions, (error, response, body) => {
				// TODO: handle error
				this.accessToken = {
					accessToken: body.access_token,
					refreshToken: body.refresh_token,
					expiresIn: new Date(Date.now() + (body.expires_in * 1000)),
					scope: body.scope
				};

				resolve(this.accessToken);
			});
		});
	}

	refreshToken(refreshToken) {
		return new Promise(resolve => {
			const CLIENT_ID = "e3ab4c22331045f0b7f6e57235b58b47";
			const CLIENT_SECRET = "4bcbb1592baf40548afae22c726df549";

			var authOptions = {
				url: "https://accounts.spotify.com/api/token",
				headers: { "Authorization": "Basic " + (new Buffer(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64")) },
				form: {
					grant_type: "refresh_token",
					refresh_token: refreshToken
				},
				json: true
			};


			// TODO: use HttpClient
			request.post(authOptions, async (error, response, body) => {
				const accessTokenFromDb = await this.authCache.get("accessToken");
				// TODO:
				await this.authCache.put("accessToken", { ...accessTokenFromDb, acessToken: body.access_token, expiresIn: new Date(Date.now() + (body.expires_in * 1000)) });
				// TODO: handle error
				resolve({
					accessToken: body.access_token
				});
			});
		});
	}

	async getAccessToken() {
		if (!this.accessToken) {
			const accessToken = await this.authCache.get("accessToken");

			if (accessToken)
				this.accessToken = accessToken;
		}

		console.log("\n");
		console.log(require("util").inspect(new Date() > this.accessToken.expiresIn, null, null, true));
		console.log("\n");

		if (new Date() > this.accessToken.expiresIn)
			await this.refreshToken(this.accessToken.refreshToken);

		return this.accessToken.accessToken;
	}

}
