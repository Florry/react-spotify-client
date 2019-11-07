import { observable, computed, action } from "mobx";
import { API_LOGIN_URI } from "../constants/api-constants";

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
	setAccessToken(accessToken) {
		this._accessToken = accessToken;
		this.persistAccessToken(accessToken);
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

}
