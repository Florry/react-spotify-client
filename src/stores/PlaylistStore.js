import { API_ROOT, PATH_ADD_TRACKS_TO_PLAYLIST, SERVER_API_ROOT } from "../constants/api-constants";
import { observable, computed, action } from "mobx";
import APIClient from "../network/APIClient";
import LocalStorageCache from "../cache/LocalStorageCache";
import Utils from "../utils/Utils";

/** @typedef {import("./RootStore").default} RootStore*/

// TODO: investigate https://spclient.wg.spotify.com/playlist/v2/user/counterwille/rootlist?decorate=revision%2Clength%2Cattributes%2Ctimestamp%2Cowner&market=from_token

export default class PlaylistStore {

	/**
	 * @param {RootStore} rootStore
	*/
	constructor(rootStore) {
		this.rootStore = rootStore;

		const cachedPlaylists = LocalStorageCache.getAllPlaylists();

		if (cachedPlaylists.length > 0)
			cachedPlaylists.forEach(playlist => this._playlists.set(playlist.uri, playlist));

		const cachedTracks = LocalStorageCache.getAllTracks();

		if (cachedTracks.length > 0)
			cachedTracks.forEach(track => {
				this._tracks.set(track.track.uri, track);
			});

		console.log("cachedPlaylists", JSON.parse(JSON.stringify(this.playlists)));
		console.log("cachedTracks", cachedTracks);

		window.getState = () => {
			console.log(JSON.parse(JSON.stringify(this._playlists)));
		}
	}

	@observable
	_playlists = observable.map();

	@observable
	_playlistGroups = observable.array();

	@observable
	_tracks = observable.map();

	@observable
	_isDraggingTrack = observable.box(false);

	@action
	async loadPlaylistsForLoggedInUser() {
		await this._fetchPlaylistsForLoggedInUser();
	}

	/**
	 * @param {String=} next
	 */
	async _fetchPlaylistsForLoggedInUser(next, offset = 0) {
		// const LIMIT = 50;

		// let response;

		// try {
		// 	response = await APIClient.get(this.rootStore.stores.authStore.accessToken, next || PATH_LOGGED_IN_USER_PLAYLISTS + `?limit=${LIMIT}`);
		// } catch (err) {
		// 	console.warn(err);

		// 	if (err.error && err.error.status === 401) {
		// 		await this.wait();
		// 		await this._fetchPlaylistsForLoggedInUser();
		// 	}

		// 	return;
		// }

		// response.items.map((playlist, i) => this._addPlaylist(playlist, offset + i));

		// if (!next && response.total > response.offset && response.next !== null) {
		// 	const promises = [];
		// 	const timesToFetch = Math.ceil(response.total / LIMIT);
		// 	const limit = promiseLimit(10);

		// 	for (let i = 0; i < timesToFetch; i++)
		// 		promises.push(
		// 			limit(() =>
		// 				this._fetchPlaylistsForLoggedInUser(this._getNextString(response.next).replace(`offset=${LIMIT}`, "offset=" + ((i + 1) * LIMIT)), (i + 1) * LIMIT)
		// 			));

		// 	await Promise.all(promises)
		// 		.catch(err => console.log(err));
		// }

		const response = await APIClient.get(await this.rootStore.stores.authStore.getAccessToken(), `${SERVER_API_ROOT}/playlist`, true);

		console.log("response", response);

		if (!!response && !!response.map)
			response.map((playlist, i) => this._addPlaylist(playlist, i));
	}

	async wait(ms = 1000) {
		return new Promise(resolve => {
			setTimeout(async () => {
				resolve();
			}, ms);
		});
	}

	@action
	async loadPlaylistGroups() {
		const authToken = "Bearer BQA0BBhoAxObBMu-ilgSYqD72V-8UeUYx455CNFMva-ipNcfHpW83FTvuBwbj-BIcD1kwTfVyuzs_rGE83o7t1GtdysRqysXAowdd8OMFfHDAWfhXk8ixl8bOrjYfgxtrLfhcko6zsv_2Htc4fX1L94NRnvI-ydp1MU_-ZG5EK4WAOo29kjY8Fu_32-TjXnN7hYnz9BFx6eUWmy7x9C9rYiZu18Ef8t9cQgNbV7xX9B8QQGzlIBOZliH2EWh6MKE7Dtprui0bxza1HnsPqNEigbYEzMUHA";

		const response = await fetch("https://spclient.wg.spotify.com/playlist/v2/user/counterwille/rootlist?decorate=revision%2Clength%2Cattributes%2Ctimestamp%2Cowner&market=from_token", {
			"method": "GET",
			"headers": {
				"cookie": "sp_t=1fba33fc38f6a113aa2ab8442b7543df",
				"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0",
				"accept": "application/json",
				"accept-language": "sv",
				"referer": "https://spclient.wg.spotify.com/playlist/v2/user/counterwille/rootlist?decorate=revision%2Clength%2Cattributes%2Ctimestamp%2Cowner&market=from_token",
				"authorization": authToken,
				"app-platform": "WebPlayer",
				"spotify-app-version": "1582330945"
			}
		});
		try {
			const resp = await response.json();

			if (resp.error)
				throw resp.error;

			const { contents: { items } } = resp;
			const groups = [];

			for (let i = 0; i < items.length; i++) {
				const { uri } = items[i];

				if (uri.includes("start-group")) {
					const group = getGroups(items, i);

					if (!!group) {
						i = group.endIndex;
						groups.push(group);
					}
				}
			}

			this._playlistGroups.push(...groups);

			console.log(groups);
		} catch (err) {
			console.log(err);
		}

		function getGroups(items, startFrom, stopAtIndex) {
			// TODO: TEMP
			const PLAYLIST = "PLAYLIST"
			const GROUP = "GROUP";

			let startIndex = -1;
			let endIndex = -1;
			let groupItems = [];

			if (!stopAtIndex)
				stopAtIndex = items.length;

			for (let i = startFrom; i < stopAtIndex; i++) {
				const item = items[i];

				if (startIndex === -1 && item.uri.includes("spotify:start-group:"))
					startIndex = i;
				else if (item.uri.includes("spotify:end-group:") &&
					getGroupId(item.uri) === getGroupId(items[startIndex].uri)) {
					endIndex = i;
				} else if (item.uri.includes("spotify:start-group:")) {
					const subGroupsOfGroup = getGroups(items, i, endIndex !== -1 ? endIndex : stopAtIndex);

					if (!!subGroupsOfGroup)
						groupItems.push(subGroupsOfGroup);
				}
			}

			for (let i = startIndex; i < endIndex; i++) {
				if (items[i].uri.includes("spotify:playlist"))
					groupItems.push({ ...items[i], type: PLAYLIST });
			}

			if (startIndex === -1 || endIndex === -1)
				return;

			return {
				startIndex,
				endIndex,
				items: groupItems,
				uri: items[startIndex].uri,
				name: getGroupName(items[startIndex].uri),
				type: GROUP
			};

			function getGroupId(uri) {
				let str = uri.replace("spotify:start-group:", "");
				str = str.replace("spotify:end-group:", "");

				const lastIndexOfColon = str.lastIndexOf(":");

				if (lastIndexOfColon !== -1)
					str = str.substring(0, lastIndexOfColon);

				return str
			}

			/**
			 * @param {String} itemUri
			 */
			function getGroupName(itemUri) {
				return itemUri.substring(itemUri.lastIndexOf(":") + 1).split("+").join(" "); // fix unicode
			}
		}
	}

	@computed
	get playlists() {
		return Array.from(this._playlists.values()).sort(Utils.sortBy("index"));
	}

	@computed
	get playlistGroups() {
		return Array.from(this._playlistGroups.values());
	}

	@action
	getPlaylist(playlistUri) {
		return this._playlists.get(playlistUri);
	}

	@action
	getOfflinePlaylist(playlistUri) {
		if (this._playlists.has(playlistUri))
			return this._playlists.get(playlistUri);
		else
			return null;
	}

	/**
	 * @param {String} playlistUri
	 * @param {String=} next
	 * @param {Number=} inputOffset
	 */
	@action
	async loadTracksInPlaylist(playlistUri, next, inputOffset) {
		let playlist = this.getPlaylist(playlistUri);

		if (playlist && playlist.tracks && playlist.tracks.items && playlist.tracks.items.length > 0)
			return;

		playlistUri = playlistUri.replace("spotify:playlist:", "");

		const response = await APIClient.get(await this.rootStore.stores.authStore.getAccessToken(), `${SERVER_API_ROOT}/playlist/${playlistUri}`, true);

		if (!playlist)
			playlist = response;

		this._addTracks(response.tracks.items);

		if (!!playlist.tracks && !!playlist.tracks.items && !!response.tracks && !!response.tracks.items) {
			playlist.tracks.items = [...response.tracks.items.map(item => item.track.uri)];

			playlist.tracks.total = response.tracks.total;

			this._addPlaylist(playlist);
		}
	}

	_addTracks(tracks, offset) {
		if (!tracks)
			return;

		tracks = tracks.map((track, i) => ({ ...track })).filter(track => !!track.track);
		tracks.map(track => this._tracks.set(track.track.uri, track));
		tracks.map((item, i) => LocalStorageCache.addTrack(item.track.uri, { ...item, index: item.id }));
	}

	@action
	_addPlaylist(playlist, index) {
		const items = playlist.tracks.items ? playlist.tracks.items.map(item => item.track ? item.track.uri : item) : [];
		const statePlaylist = {
			...playlist,
			index: index || playlist.index,
			tracks: {
				...playlist.tracks,
				items
			}
		};

		const existingStatePlaylist = this._playlists.get(playlist.uri);

		if (!!existingStatePlaylist && !!existingStatePlaylist.tracks && !!existingStatePlaylist.tracks.items && !!existingStatePlaylist.tracks.items.length) {
			statePlaylist.tracks.items = existingStatePlaylist.tracks.items;
			statePlaylist.tracks.total = existingStatePlaylist.tracks.total;
		}

		this._playlists.set(playlist.uri, statePlaylist);

		const cachePlaylist = {
			...playlist,
			index: index || 1,
			tracks: {
				...playlist.tracks,
				items // TODO: add/remove tracks to keep in sync
			}
		};

		const existingCache = LocalStorageCache.getPlaylist(playlist.uri);

		if (!!existingCache) {
			if (existingCache.tracks.items.length)
				cachePlaylist.tracks.items = existingCache.tracks.items;

			cachePlaylist.tracks.total = existingCache.tracks.total;
			cachePlaylist.index = index !== undefined ? index : existingCache.index;
		}

		LocalStorageCache.addPlaylist(playlist.uri, cachePlaylist);
	}

	@computed
	get tracks() {
		return Array.from(this._tracks.values());
	}

	@action
	getTracksInPlaylist(playlistUri) {
		if (!this._playlists.size)
			return [];
		else {
			const playlistInQuestion = this._playlists.get(playlistUri);

			if (playlistInQuestion && playlistInQuestion.tracks && playlistInQuestion.tracks.items)
				return this.getTracksByUris(playlistInQuestion.tracks.items);
		}

		return [];
	}

	@action
	getTrack(trackUri) {
		return this._tracks.get(trackUri);
	}

	@action
	getTracksByUris(trackUris) {
		const output = [];

		for (const uri of trackUris)
			output.push(this.getTrack(uri));

		return output;
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
	async addTracksToPlaylist(playlistUri, tracks) {
		const urisQuery = tracks.join(",");
		const path = `${PATH_ADD_TRACKS_TO_PLAYLIST.replace(":playlistId", playlistUri.replace("spotify:playlist:", ""))}?uris=${urisQuery}`;

		APIClient.post(await this.rootStore.stores.authStore.getAccessToken(), path);
	}

}
