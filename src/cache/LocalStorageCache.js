const TRACK_CACHE_PREFIX = "SPOTIFY_TRACK_CACHE_";

export default class LocalStorageCache {

	static addTrack(trackId, trackData) {
		window.localStorage.setItem(TRACK_CACHE_PREFIX + trackId, trackData);
	}

	static getTrack(trackId) {
		window.localStorage.getItem(TRACK_CACHE_PREFIX + trackId);
	}

}
