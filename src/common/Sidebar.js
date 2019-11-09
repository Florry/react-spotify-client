import React from "react";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";
import { PLAYLIST } from "../constants/routes";

/** @typedef {import("../stores/AuthStore").default} AuthStore */
/** @typedef {import("../stores/PlaylistStore").default} PlaylistStore */

@inject("playlistStore", "authStore")
@observer
class Sidebar extends React.Component {

	/** @type {PlaylistStore} */
	playlistStore = this.props.playlistStore;

	/** @type {AuthStore} */
	authStore = this.props.authStore;

	async componentDidMount() {
		// this.playlistStore.loadPlaylistsForLoggedInUser();
	}

	render() {
		const playlists = this.playlistStore.playlists;
		const tracks = this.playlistStore.tracks;

		return (
			<div
				style={{
					color: "#fff",
					top: 0,
					left: 0,
					position: "fixed",
					height: "100%",
					maxHeight: "100%",
					overflowY: "scroll",
					width: 400
				}}
			>
				<h2>Library</h2>
				<h2>Playlists</h2>
				<ul>

					{
						playlists.map((playlist, i) => <Link key={i.toString() + playlist.uri} to={PLAYLIST.replace(":playlistId", playlist.uri)}>
							<li>{playlist.name}</li>
						</Link>)
					}

				</ul>
			</div>
		);
	}

}

export default Sidebar;
