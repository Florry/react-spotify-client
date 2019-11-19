import { PLAYLIST, QUEUE, SPOTIFY_API_CALLBACK, PLAYLIST_REDIRECT } from "./constants/routes";
import { Route, Switch, Redirect } from "react-router-dom";
import GetAuthToken from "./common/auth/GetAuthToken";
import PlaylistPage from "./pages/playlist/PlaylistPage";
import React from "react";

export default () => {

	const defaultPlaylist = encodeURI(PLAYLIST.replace(":playlistId", "spotify:playlist:1zFxtCRf3uaTe3P2fIKGTy"));
	console.log(defaultPlaylist);

	return (
		<Switch>

			<Route path={SPOTIFY_API_CALLBACK} component={GetAuthToken} exact />

			<Route path={PLAYLIST} component={props => <PlaylistPage {...props} />} exact />
			<Route path={QUEUE} component={props => <PlaylistPage {...props} queue={true} />} exact />

			{/* TODO: THIS IS A QUICK HACK!!*/}
			<Route path={PLAYLIST_REDIRECT} render={props => (<Redirect to={`/playlist/${props.match.params.playlistId}`} />)} exact />

			<Route exact path="/" render={() => (<Redirect to={defaultPlaylist} />)} />

		</Switch>
	);
};
