import React from "react";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";
import { PLAYLIST } from "../constants/routes";

/** @typedef {import("../stores/AuthStore").default} AuthStore */
/** @typedef {import("../stores/PlaylistStore").default} PlaylistStore */
/** @typedef {import("../stores/PlayerStore").default} PlayerStore */

@observer
@inject("playlistStore", "authStore", "playerStore")
class Sidebar extends React.Component {

	/** @type {PlaylistStore} */
	playlistStore = this.props.playlistStore;

	/** @type {AuthStore} */
	authStore = this.props.authStore;

	/** @type {PlayerStore} */
	playerStore = this.props.playerStore;

	async componentDidMount() {
		await this.playlistStore.loadPlaylistsForLoggedInUser();
		this.forceUpdate();
	}

	render() {
		const playlists = this.playlistStore.playlists;
		const ready = this.playerStore.ready;

		return (
			<div
				className="sidebar"
			>
				{
					!ready ? <h2>Playback OFFLINE</h2> : <span />
				}
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
