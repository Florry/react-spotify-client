import { observable, computed, action } from "mobx";
import { API_LOGIN_URI, SERVER_API_ROOT } from "../constants/api-constants";
import APIClient from "../network/APIClient";

/** @typedef {import("./RootStore").default} RootStore*/

export default class AuthStore {

	/**
	 * @param {RootStore} rootStore
	*/
	constructor(rootStore) {
		this.rootStore = rootStore;
	}

	@observable
	_accessToken = null;

	@observable
	_displayName = observable.box("counterwille"); // TODO: make dynamic!

	@action
	login() {
		this._getPersistedAccessToken();

		if (!this._accessToken)
			window.location.href = API_LOGIN_URI;
	}

	/**
	 * @param {String} accessToken
	*/
	@action
	async setAccessToken(accessToken) {
		this._accessToken = accessToken;
		this.persistAccessToken(accessToken);

		const accessTokenResp = await APIClient.post(null, `${SERVER_API_ROOT}/access-token`, { accessToken }, true);

		this.persistAccessToken(accessTokenResp);
	}

	_getPersistedAccessToken() {
		try {
			const accessToken = JSON.parse(localStorage.getItem("accessToken"));
			this._accessToken = accessToken;
		} catch (err) { }
	}

	/**
	 * @param {String} accessToken
	*/
	persistAccessToken(accessToken) {
		localStorage.setItem("accessToken", JSON.stringify(accessToken));
		this._accessToken = accessToken;
	}

	@computed
	get accessToken() {
		if (!this._accessToken)
			this._getPersistedAccessToken();

		return this._accessToken;
	}

	async getAccessToken() {
		if (!this._accessToken)
			this._getPersistedAccessToken();

		if (!this._accessToken || new Date() > this._accessToken.expiresIn) {
			const accessToken = await APIClient.get(null, `http://localhost:8080/access-token`, true);

			this.persistAccessToken(accessToken);
		}

		return this._accessToken ? this._accessToken.accessToken : "";
	}

	@computed
	get displayName() {
		return this._displayName.get();
	}

}
