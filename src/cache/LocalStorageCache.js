import Utils from "../utils/Utils";

const TRACK_CACHE_PREFIX = `__SPOTIFY_TRACK_CACHE_`;
const PLAYLIST_CACHE_PREFIX = `__SPOTIFY_PLAYLIST_CACHE_`;

const cache = {};

export default class LocalStorageCache {

	static addPlaylist(playlistId, playlistData) {

		cache[PLAYLIST_CACHE_PREFIX + playlistId] = {
			...playlistData,
			tracks: {
				...playlistData.tracks,
				items: playlistData.tracks.items || []
			}
		};
		// window.localStorage.setItem(PLAYLIST_CACHE_PREFIX + playlistId, JSON.stringify({
		// 	...playlistData,
		// 	tracks: {
		// 		...playlistData.tracks,
		// 		items: playlistData.tracks.items || []
		// 	}
		// }));
	}

	static getPlaylist(playlistId) {
		// const item = window.localStorage.getItem(PLAYLIST_CACHE_PREFIX + playlistId);
		const item = cache[PLAYLIST_CACHE_PREFIX + playlistId];

		if (item)
			return item;
	}

	static getAllPlaylists() {
		const output = [];

		Object.keys(cache).forEach(key => {
			if (key.indexOf(PLAYLIST_CACHE_PREFIX) === 0)
				output.push(cache[key]);
		});

		return output;
	}

	static addTrack(trackId, trackData) {
		// TODO: only save data we need
		// window.localStorage.setItem(TRACK_CACHE_PREFIX + trackId, JSON.stringify(trackData));
		cache[TRACK_CACHE_PREFIX + trackId] = trackData;
	}

	static getTrack(trackId) {
		const item = cache[TRACK_CACHE_PREFIX + trackId];

		if (item)
			return item;
	}

	static getAllTracks() {
		const output = [];

		Object.keys(cache).forEach(key => {
			if (key.indexOf(TRACK_CACHE_PREFIX) === 0)
				output.push(cache[key]);
		});

		return output;
	}

	static getTracksByUris(uris = []) {
		const output = [];

		Object.keys(cache).forEach(key => {
			if (key.indexOf(TRACK_CACHE_PREFIX) === 0) {
				if (uris.includes(key.replace(TRACK_CACHE_PREFIX, ""))) {
					output.push(cache[key]);
				}
			}
		});

		return output.sort(Utils.sortBy("index"));
	}

}


window.cache = () => {
	cache.length = 0;
}
