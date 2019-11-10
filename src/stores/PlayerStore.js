import { observable, computed, action, IObservableValue } from "mobx";
import { PATH_PLAY_TRACK, PATH_PLAY, PATH_PAUSE } from "../constants/api-constants";
import APIClient from "../network/APIClient";

/** @typedef {import("./RootStore").default} RootStore*/

let Spotify;

/**
 * @typedef {Object} SpotifyPlayer
 * @property {Function} connect
 * @property {Function} addListener
 * @property {Function} getCurrentState
 * @property {Function} resume
 * @property {Function} pause
 * @property {Object} _options
 * @property {String} _options.id
 */

export default class PlayerStore {

	/** @type {SpotifyPlayer} */
	_playerInstance = null;

	@observable
	_ready = observable.box(false);

	@observable
	_state = observable.box({
		paused: true,
		shuffle: false,
		repeat_mode: 0,
		artists: [],
		album: { images: [] }
	});

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
		this._playerInstance.addListener("ready", ({ device_id }) => this._ready = true);
		this._playerInstance.addListener("not_ready", () => this._ready = false);
	}

	@action
	_updatePlayerState(state) {
		this._state = {
			paused: state.paused,
			shuffle: state.shuffle,
			repeat_mode: state.repeat_mode,
			artists: state.track_window.current_track.artists,
			album: state.track_window.current_track.album,
			name: state.track_window.current_track.name
		};
	}

	@computed
	get state() {
		return this._state.valueOf();
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

	async play() {
		await this._playerInstance.resume();
	}

	async pause() {
		await this._playerInstance.pause();
	}

	@computed
	get ready() {
		return this._ready.valueOf();
	}

}
