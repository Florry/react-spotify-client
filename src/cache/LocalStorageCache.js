import Utils from "../utils/Utils";

const TRACK_CACHE_PREFIX = `__SPOTIFY_TRACK_CACHE_`;
const PLAYLIST_CACHE_PREFIX = `__SPOTIFY_PLAYLIST_CACHE_`;

export default class LocalStorageCache {

	static addTrack(trackId, trackData) {
		window.localStorage.setItem(TRACK_CACHE_PREFIX + trackId, JSON.stringify(trackData));
	}

	static getTrack(trackId) {
		const item = window.localStorage.getItem(TRACK_CACHE_PREFIX + trackId);

		if (item)
			return JSON.parse(item);
	}

	static addPlaylist(playlistId, playlistData) {
		console.log(playlistData);
		window.localStorage.setItem(PLAYLIST_CACHE_PREFIX + playlistId, JSON.stringify(playlistData));
	}

	static getPlaylist(playlistId) {
		const item = window.localStorage.getItem(PLAYLIST_CACHE_PREFIX + playlistId);

		if (item)
			return JSON.parse(item);
	}

	static getAllPlaylists() {
		const output = [];

		Object.keys(window.localStorage).forEach(key => {
			if (key.indexOf(PLAYLIST_CACHE_PREFIX) === 0)
				output.push(JSON.parse(window.localStorage[key]));
		});

		return output;
	}

	static getTracksByUris(uris) {
		const output = [];

		Object.keys(window.localStorage).forEach(key => {
			if (key.indexOf(TRACK_CACHE_PREFIX) === 0) {
				if (uris.includes(key.replace(TRACK_CACHE_PREFIX, ""))) {
					output.push(JSON.parse(window.localStorage[key]));
				}
			}
		});

		return output.sort(Utils.sortBy("index"));
	}

}
