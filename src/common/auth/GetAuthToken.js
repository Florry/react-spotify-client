import { PLAYLIST } from "../../constants/routes";
import { Redirect } from "react-router-dom";
import { inject } from "mobx-react";
import React from "react";

/** @typedef {import("../../stores/AuthStore").default} AuthStore */

@inject("authStore")
class GetAuthToken extends React.Component {

	/** @type {AuthStore}*/
	authStore = this.props.authStore;

	state = { shouldRedirect: false };

	componentDidMount() {
		const hashComponents = window.location.hash.replace("#", "").split("&");
		const hashKeyValue = {};

		hashComponents.forEach(component => {
			const decodedComponent = decodeURIComponent(component);
			const parts = decodedComponent.split("=");
			hashKeyValue[parts[0]] = parts[1];
		});

		if (!hashKeyValue.error) {
			this.authStore.setAccessToken(hashKeyValue.access_token);

			this.setState({ shouldRedirect: true });
		}
	}

	render() {
		if (this.state.shouldRedirect)
			return <Redirect to={PLAYLIST.replace(":playlistId", "spotify:playlist:7Go8gbNkcBt8vSSYTMLHwl")} />;
		else
			return (
				<div>
					Logging in...
				</div>
			);
	}

}

export default GetAuthToken;
