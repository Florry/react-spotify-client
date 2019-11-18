import { observable, computed, action, IObservableValue } from "mobx";
import { PATH_PLAY_TRACK } from "../constants/api-constants";
import APIClient from "../network/APIClient";
import Utils from "../utils/Utils";

/** @typedef {import("./RootStore").default} RootStore*/

let Spotify;

/**
 * @typedef {Object} SpotifyPlayer
 * @property {Function} connect
 * @property {Function} addListener
 * @property {Function} getCurrentState
 * @property {Function} resume
 * @property {Function} pause
 * @property {Function} nextTrack
 * @property {Function} previousTrack
 * @property {Function} seek
 * @property {Function} setVolume
 * @property {Function} getVolume
 * @property {Object} _options
 * @property {String} _options.id
 */

/** @type {?} */
const DEFAULT_STATE = {
	paused: true,
	shuffle: false,
	repeat_mode: 0,
	artists: [],
	album: { images: [] },
	position: 0,
	duration: 0
};

// TODO: all actions should be cancelled if run again before they are completed, e.g. changing songs quickly and only change song to the last input

export default class PlayerStore {

	/** @type {SpotifyPlayer} */
	_playerInstance = null;

	@observable
	_ready = observable.box(false);

	@observable
	_playing = observable.box(false);

	@observable
	_state = observable.box(DEFAULT_STATE);

	@observable
	_currentPlaylist = observable.box(null);

	@observable
	_playQueue = observable.array();

	@observable
	_playHistory = observable.array();

	/**
	 * @param {RootStore} rootStore
	*/
	constructor(rootStore) {
		this.rootStore = rootStore;

		window.onSpotifyWebPlaybackSDKReady = () => {
			Spotify = window.Spotify;
			this._playerInstance = new Spotify.Player({
				name: "React spotify client",
				getOAuthToken: (cb) => cb(this.rootStore.stores.authStore._accessToken)
			});

			this._setupStateListeners();

			this._playerInstance.connect().then(success => {
				if (success)
					console.log("Connected to spotify web playback");
				console.log(this._playerInstance);
			});
		};
	}

	_setupStateListeners() {
		this._playerInstance.addListener("initialization_error", (resp) => { console.error(resp); });
		this._playerInstance.addListener("authentication_error", (resp) => { console.error(resp); });
		this._playerInstance.addListener("account_error", (resp) => { console.error(resp); });
		this._playerInstance.addListener("playback_error", (resp) => { console.error(resp); });
		this._playerInstance.addListener("player_state_changed", state => this._updatePlayerState(state));
		this._playerInstance.addListener("ready", ({ device_id }) => this._ready.set(true));
		this._playerInstance.addListener("not_ready", () => this._ready.set(false));
	}

	@action
	_updatePlayerState(state) {
		console.log(state);
		if (state === null) {
			this._playing.set(false);
			this._state.set(DEFAULT_STATE);
		} else {
			this._playing.set(true);
			this._state.set({
				paused: state.paused,
				shuffle: state.shuffle,
				repeatMode: state.repeat_mode,
				artists: state.track_window.current_track.artists,
				album: state.track_window.current_track.album,
				name: state.track_window.current_track.name,
				currentTrack: state.track_window.current_track,
				position: state.position,
				duration: state.duration
			});
		}
	}

	@computed
	get state() {
		return this._state.get();
	}

	@computed
	get playing() {
		return this._playing.get();
	}

	@action
	async playTrack(trackUri) {
		const { _options: { id } } = this._playerInstance;
		const accessToken = this.rootStore.stores.authStore._accessToken;

		try {
			await APIClient.put(accessToken, `${PATH_PLAY_TRACK}?device_id=${id}`, { uris: [trackUri] });
		} catch (err) {
			console.warn(err);
		}
	}

	@action
	async play() {
		await this._playerInstance.resume();
	}

	@action
	async pause() {
		await this._playerInstance.pause();
	}

	@action
	nextTrack() {
		const nextTrack = this._playQueue.shift();

		if (!!nextTrack) {
			this._playHistory.unshift(this._state.get().currentTrack);

			this.playTrack(nextTrack.track ? nextTrack.track.uri : nextTrack.uri);
		}
	}

	@action
	previousTrack() {
		// TODO: play track from beginning if x seconds have passed
		const previousTrack = this._playHistory.shift();

		if (!!previousTrack) {
			this._playQueue.unshift(this._state.get().currentTrack);

			this.playTrack(previousTrack.track ? previousTrack.track.uri : previousTrack.uri);
		}
	}

	@computed
	get ready() {
		return this._ready.get();
	}

	@action
	async setCurrentPlaylist(playlistUri, excludeTrack) {
		try {
			this._currentPlaylist.set(playlistUri);

			const { tracks: { items: tracks } } = await this.rootStore.stores.playlistStore.getPlaylist(playlistUri);

			const shuffledTracks = Utils.shuffleArray(tracks);

			this._playQueue.clear();
			this._playHistory.clear();

			if (!excludeTrack) {
				this.playTrack(shuffledTracks[0].track.uri);
				shuffledTracks.shift();
			}

			shuffledTracks.filter(track => track.track.uri !== excludeTrack).forEach(track => this._playQueue.push(track));
		} catch (err) {
			console.error(err);
		}
	}

	@computed
	get playQueue() {
		return Array.from(this._playQueue.values()).map(track => track.track ? track : { track: track });
	}

	@action
	seekTrack(position) {
		this._playerInstance.seek(position);
	}

	@action
	setVolume(volume) {
		this._playerInstance.setVolume(volume);
	}

	@action
	getVolume(volume) {
		return this._playerInstance.getVolume();
	}

}
