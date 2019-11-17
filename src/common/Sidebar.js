import { PLAYLIST, QUEUE } from "../constants/routes";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";
import React from "react";

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
		const displayName = this.authStore.displayName;

		return (
			<div
				className="sidebar"
			>
				<h2 id="home">Home</h2>
				<h2 id="explore">Explore</h2>
				<h2 id="radio">Radio</h2>
				<h2 id="queue"><Link to={QUEUE}>Queue</Link></h2>
				<h2>Library</h2>
				<ul>
					<li id="for-you" className="sidebar-playlist-item">For you</li>
					<li id="recently-played" className="sidebar-playlist-item">Recently played</li>
					<li id="albums" className="sidebar-playlist-item">Albums</li>
					<li id="artists" className="sidebar-playlist-item">Artists</li>
					<li id="local-files" className="sidebar-playlist-item">Local files</li>
					<li id="podcasts" className="sidebar-playlist-item">Podcasts</li>
					<li id="starred" className="sidebar-playlist-item">Starred</li>
				</ul>
				<h2>Playlists</h2>
				<ul>

					{
						playlists.map((playlist, i) =>
							<li
								key={playlist.uri}
								className="sidebar-playlist-item"
								onDoubleClick={() => this.playFromPlaylist(playlist.uri)}
							>
								<Link
									to={PLAYLIST.replace(":playlistId", playlist.uri)}
								>
									{playlist.name} {displayName !== playlist.owner.display_name && <span className="playlist-owner">by {playlist.owner.display_name}</span>}
								</Link>
							</li>
						)
					}

				</ul>
			</div>
		);
	}

}

export default Sidebar;
