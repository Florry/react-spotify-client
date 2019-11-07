import { API_ROOT, PATH_LOGGED_IN_USER_PLAYLISTS, PATH_MULTIPLE_TRACKS, PATH_GET_PLAYLIST_BY_ID } from "../constants/api-constants";
import { observable, computed, action, runInAction } from "mobx";
import APIClient from "../network/APIClient";

/** @typedef {import("./RootStore").default} RootStore*/

export default class PlaylistStore {

	/**
	 * @param {RootStore} rootStore
	*/
	constructor(rootStore) {
		this.rootStore = rootStore;
	}

	@observable
	_playlists = observable.map();

	@observable
	_tracks = observable.map();

	/**
	 * @param {String=} next
	 */
	@action
	async loadPlaylistsForLoggedInUser(next) {
		const LIMIT = 50;

		try {
			const response = await APIClient.get(this.rootStore.stores.authStore.accessToken, next || PATH_LOGGED_IN_USER_PLAYLISTS + `?limit=${LIMIT}`);

			response.items.map(playlist => this._playlists.set(playlist.uri, playlist));

			if (response.tracks && response.tracks.items)
				response.tracks.items.map(track => this._tracks.set(track.track.uri, track));

			// if (!next && response.total > this._playlists.size && response.next !== null) {
			// 	const promises = []; // TODO:

			// 	for (let i = 0; i < response.total; i += LIMIT)
			// 		promises.push(this.loadPlaylistsForLoggedInUser(this._getNextString(response.next)));

			// 	await Promise.all(promises);
			// }
		} catch (err) {
			console.error(err);
		}
	}

	async loadPlaylist(playlistUri) {
		const LIMIT = 50;

		try {
			const response = await APIClient.get(this.rootStore.stores.authStore.accessToken, PATH_GET_PLAYLIST_BY_ID.replace(":playlistId", playlistUri.replace("spotify:playlist:", "")));

			this._playlists.set(response.uri, response);

			if (response.tracks.items)
				response.tracks.items.map(track => this._tracks.set(track.track.uri, track));

		} catch (err) {
			console.error(err);
		}
	}

	@computed
	get playlists() {
		return Array.from(this._playlists.values());
	}

	async getPlaylist(playlistUri) {
		const playlist = this._playlists.get(playlistUri);

		if (!playlist)
			await this.loadPlaylist(playlistUri);

		return this._playlists.get(playlistUri);
	}

	/**
	 * @param {Array<String>} playlistUri
	 * @param {String=} next
	 */
	@action
	async loadTracksInPlaylist(playlistUri, next) {
		const LIMIT = 100;
		const playlist = await this.getPlaylist(playlistUri);

		try {
			const response = await APIClient.get(this.rootStore.stores.authStore.accessToken, next || playlist.tracks.href.replace(API_ROOT, ""));

			response.items.map(track => this._tracks.set(track.track.uri, track));

			if (!next && response.total > response.offset && response.next !== null) {
				const promises = [];
				const timesToFetch = Math.ceil(response.total / LIMIT);

				for (let i = 0; i < timesToFetch; i++)
					promises.push(this.loadTracksInPlaylist(playlistUri, this._getNextString(response.next).replace("offset=100", "offset=" + ((i + 1) * LIMIT))));

				runInAction(async () => {
					await Promise.all(promises);
				});
			}
		} catch (err) {
			console.error(err);
		}
	}

	@computed
	get tracks() {
		return Array.from(this._tracks.values());
	}

	_getNextString(next) {
		return next.replace(API_ROOT, "");
	}

}

// {
// 	"collaborative": true,
// 	"external_urls": {
// 	  "spotify": "https://open.spotify.com/playlist/5n924GIq60au831cuAWRgS"
// 	},
// 	"href": "https://api.spotify.com/v1/playlists/5n924GIq60au831cuAWRgS",
// 	"id": "5n924GIq60au831cuAWRgS",
// 	"images": [
// 	  {
// 		"height": 640,
// 		"url": "https://mosaic.scdn.co/640/ab67616d0000b273075c66063f45f0d2b61ccff2ab67616d0000b273a816fb15d9f12a9f88fc9d17ab67616d0000b273e1f5ee370c7f0688de3bb3c4ab67616d0000b273f1814f1b76df2fa196e4f45e",
// 		"width": 640
// 	  },
// 	  {
// 		"height": 300,
// 		"url": "https://mosaic.scdn.co/300/ab67616d0000b273075c66063f45f0d2b61ccff2ab67616d0000b273a816fb15d9f12a9f88fc9d17ab67616d0000b273e1f5ee370c7f0688de3bb3c4ab67616d0000b273f1814f1b76df2fa196e4f45e",
// 		"width": 300
// 	  },
// 	  {
// 		"height": 60,
// 		"url": "https://mosaic.scdn.co/60/ab67616d0000b273075c66063f45f0d2b61ccff2ab67616d0000b273a816fb15d9f12a9f88fc9d17ab67616d0000b273e1f5ee370c7f0688de3bb3c4ab67616d0000b273f1814f1b76df2fa196e4f45e",
// 		"width": 60
// 	  }
// 	],
// 	"name": "Eftermiddag på jobbet 💃",
// 	"owner": {
// 	  "display_name": "carolinahildings",
// 	  "external_urls": {
// 		"spotify": "https://open.spotify.com/user/carolinahildings"
// 	  },
// 	  "href": "https://api.spotify.com/v1/users/carolinahildings",
// 	  "id": "carolinahildings",
// 	  "type": "user",
// 	  "uri": "spotify:user:carolinahildings"
// 	},
// 	"primary_color": null,
// 	"public": false,
// 	"snapshot_id": "NjksMDEyMzk5NDIwMjNhNzk2NjE4OTI2ZGYwMDNhOWJkYzhjZjU5YjJjYw==",
// 	"tracks": {
// 	  "href": "https://api.spotify.com/v1/playlists/5n924GIq60au831cuAWRgS/tracks",
// 	  "total": 65
// 	},
// 	"type": "playlist",
// 	"uri": "spotify:playlist:5n924GIq60au831cuAWRgS"
//   }
