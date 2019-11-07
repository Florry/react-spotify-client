import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import PlaylistPage from "./pages/playlist/PlaylistPage";
import { PLAYLIST, SPOTIFY_API_CALLBACK } from "./constants/routes";
import React from "react";
import GetAuthToken from "./common/auth/GetAuthToken";

export default () => {

	const defaultPlaylist = encodeURI(PLAYLIST.replace(":playlistId", "spotify:playlist:4HFv8kVXrc7JLEg21RJhxt"));
	console.log(defaultPlaylist);

	return (
		<Switch>

			<Route path={SPOTIFY_API_CALLBACK} component={GetAuthToken} exact />

			<Route path={PLAYLIST} component={props => <PlaylistPage {...props} />} exact />

			<Redirect from="/" to={"/playlist/spotify:playlist:4HFv8kVXrc7JLEg21RJhxt"} />

		</Switch>
	);
};
