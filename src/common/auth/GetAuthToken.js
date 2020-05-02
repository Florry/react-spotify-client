import { PLAYLIST } from "../../constants/routes";
import { Redirect } from "react-router-dom";
import { inject } from "mobx-react";
import React from "react";
import queryString from "query-string";


/** @typedef {import("../../stores/AuthStore").default} AuthStore */

@inject("authStore")
class GetAuthToken extends React.Component {

	/** @type {AuthStore}*/
	authStore = this.props.authStore;

	state = { shouldRedirect: false };

	componentDidMount() {
		const query = queryString.parse(window.location.search);

		if (!query.error) {
			// TODO:
			this.authStore.setAccessToken(query.code);

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
