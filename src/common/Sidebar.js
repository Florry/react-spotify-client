import React from "react";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";
import { PLAYLIST, QUEUE } from "../constants/routes";
import Slider from "./Slider";

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

	async playFromPlaylist(playlistUri) {
		//TODO:
		await this.playlistStore.loadTracksInPlaylist(playlistUri);
		this.playerStore.setCurrentPlaylist(playlistUri);
	}

	render() {
		const playlists = this.playlistStore.playlists;

		return (
			<div
				className="sidebar"
			>
				<h2>Library</h2>
				<h2>Playlists</h2>
				<Link to={QUEUE}><h2>Queue</h2></Link>
				<ul>

					{
						playlists.map((playlist, i) => <Link key={i.toString() + playlist.uri} to={PLAYLIST.replace(":playlistId", playlist.uri)}>
							<li onDoubleClick={() => this.playFromPlaylist(playlist.uri)}>{playlist.name}</li>
						</Link>)
					}

				</ul>
			</div>
		);
	}

}

export default Sidebar;
