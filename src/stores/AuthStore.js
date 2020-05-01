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

		const response = await APIClient.post(this.rootStore.stores.authStore.accessToken, `${SERVER_API_ROOT}/access-token`, null, true);
	}

	_getPersistedAccessToken() {
		const accessToken = localStorage.getItem("accessToken");
		this._accessToken = accessToken;
	}

	/**
	 * @param {String} accessToken
	*/
	persistAccessToken(accessToken) {
		localStorage.setItem("accessToken", accessToken);
	}

	@computed
	get accessToken() {
		if (!this._accessToken)
			this._getPersistedAccessToken();

		return this._accessToken;
	}

	@computed
	get displayName() {
		return this._displayName.get();
	}

}
