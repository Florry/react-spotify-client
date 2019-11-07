import React from "react";
import { inject } from "mobx-react";
import { Redirect } from "react-router-dom";
import { PLAYLIST } from "../../constants/routes";

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
			return <Redirect to={PLAYLIST} />;
		else
			return (
				<div>
					Logging in...
				</div>
			);
	}

}

export default GetAuthToken;
