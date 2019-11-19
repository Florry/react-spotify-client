import { API_ROOT, PATH_LOGGED_IN_USER_PLAYLISTS, PATH_GET_PLAYLIST_BY_ID, PATH_ADD_TRACKS_TO_PLAYLIST } from "../constants/api-constants";
import { observable, computed, action } from "mobx";
import promiseLimit from "promise-limit";
import APIClient from "../network/APIClient";
import uuid from "uuid";

/** @typedef {import("./RootStore").default} RootStore*/

// TODO: investigate https://spclient.wg.spotify.com/playlist/v2/user/counterwille/rootlist?decorate=revision%2Clength%2Cattributes%2Ctimestamp%2Cowner&market=from_token

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

	@observable
	_isDraggingTrack = observable.box(false);

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

			if (!next && response.total > response.offset && response.next !== null) {
				const promises = [];
				const timesToFetch = Math.ceil(response.total / LIMIT);
				const limit = promiseLimit(10);

				for (let i = 0; i < timesToFetch; i++)
					promises.push(limit(() => this.loadPlaylistsForLoggedInUser(this._getNextString(response.next).replace(`offset=${LIMIT}`, "offset=" + ((i + 1) * LIMIT)))));

				await Promise.all(promises);
			}
		} catch (err) {
			// console.error(err);
		}
	}

	async loadPlaylist(playlistUri) {
		const LIMIT = 50;

		try {
			const response = await APIClient.get(this.rootStore.stores.authStore.accessToken, PATH_GET_PLAYLIST_BY_ID.replace(":playlistId", playlistUri.replace("spotify:playlist:", "")));

			response.tracks.items = response.tracks.items.map(track => ({ ...track, clientId: uuid.v4() }));

			this._playlists.set(response.uri, response);

			if (response.tracks.items)
				response.tracks.items.map(track => this._tracks.set(track.track.uri, track));

		} catch (err) {
			// console.error(err);
		}
	}

	@computed
	get playlists() {
		return Array.from(this._playlists.values());
	}

	@action
	async getPlaylist(playlistUri) {
		const playlist = this._playlists.get(playlistUri);

		if (!playlist)
			await this.loadPlaylist(playlistUri);

		return this._playlists.get(playlistUri);
	}

	/**
	 * @param {Array<String>} playlistUri
	 * @param {String=} next
	 * @param {Number=} inputOffset
	 */
	@action
	async loadTracksInPlaylist(playlistUri, next, inputOffset) {
		const LIMIT = 100;
		const playlist = await this.getPlaylist(playlistUri);
		const offset = inputOffset || playlist && playlist.tracks && playlist.tracks.items ? playlist.tracks.items.length : 0;

		if (!!playlist && offset >= playlist.tracks.total)
			return;

		try {
			let path = next || playlist.tracks.href.replace(API_ROOT, "");

			if (!!offset)
				path = path.replace("offset=0", "offset=" + offset);

			const response = await APIClient.get(this.rootStore.stores.authStore.accessToken, path);

			response.items = response.items.map(track => ({ ...track, clientId: uuid.v4() })).filter(track => !!track.track);

			response.items.map(track => this._tracks.set(track.track.uri, track));

			if (!playlist.tracks.items)
				playlist.tracks.items = [];

			const trackUris = playlist.tracks.items.map(track => track.track.uri);

			playlist.tracks.items.push(...response.items);
			playlist.tracks.total = response.total;

			this._playlists.set(playlistUri, playlist);

			if (!next && response.total > response.offset && response.next !== null) {
				const promises = [];
				const timesToFetch = Math.ceil(response.total / LIMIT);
				const limit = promiseLimit(10);

				for (let i = 0; i < timesToFetch; i++)
					promises.push(limit(() => this.loadTracksInPlaylist(playlistUri, this._getNextString(response.next).replace(`offset=${LIMIT}`, "offset=" + ((i + 1 + offset) * LIMIT)), offset)));

				await Promise.all(promises);
			}
		} catch (err) {
			console.error(err);
		}
	}

	@computed
	get tracks() {
		return Array.from(this._tracks.values());
	}

	@action
	getTracksInPlaylist(playlistUri) {
		return !!this._playlists.size ? this._playlists.get(playlistUri).tracks.items : [];
	}

	_getNextString(next) {
		return next.replace(API_ROOT, "");
	}

	@action
	setIsDraggingTrack(isDraggingTrack) {
		this._isDraggingTrack.set(isDraggingTrack);
	}

	@computed
	get isDraggingTrack() {
		return this._isDraggingTrack.get();
	}

	/**
	 * @param {String} playlistUri
	 * @param {Array<String>} tracks
	 */
	@action
	addTracksToPlaylist(playlistUri, tracks) {
		const urisQuery = tracks.join(",");
		const path = `${PATH_ADD_TRACKS_TO_PLAYLIST.replace(":playlistId", playlistUri.replace("spotify:playlist:", ""))}?uris=${urisQuery}`;
		APIClient.post(this.rootStore.stores.authStore.accessToken, path);
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
