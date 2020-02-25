import { PLAYLIST, QUEUE, PLAYLIST_REDIRECT } from "../constants/routes";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";
import React from "react";
import PlaylistGroup from "./sidebar/PlaylistGroup";
import LocalStorageCache from "../cache/LocalStorageCache";

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

	state = {
		searchQuery: "" // Move this to the store and only return based off the query? Maybe a special "getFilteredPlaylists"
	};

	async componentDidMount() {
		await Promise.all([
			this.playlistStore.loadPlaylistsForLoggedInUser(),
			this.playlistStore.loadPlaylistGroups()
		]);

		this.forceUpdate();

		this.playlistStore._isDraggingTrack.observe(() => {
			if (this)
				this.forceUpdate();
		});

		console.log(LocalStorageCache.getTracksByUris(["spotify:track:3L2Nyi3T7XabH8EEZFLDdX", "spotify:track:37kTASujIfZZ27NV7PfIrf"]));
	}

	async playFromPlaylist(playlistUri) {
		//TODO:
		await this.playlistStore.loadTracksInPlaylist(playlistUri);
		this.playerStore.setCurrentPlaylist(playlistUri);
	}

	updateSearch(e) {
		this.setState({ searchQuery: e.target.value });
	}

	removeSearchQuery() {
		this.setState({ searchQuery: "" })
	}

	render() {
		const isDraggingTrack = this.playlistStore.isDraggingTrack;
		const playlistGroups = this.playlistStore.playlistGroups;
		const playlists = this.playlistStore.playlists;
		const displayName = this.authStore.displayName;
		const { searchQuery } = this.state;

		return (
			<div
				className={`sidebar ${isDraggingTrack ? "isDraggingTrack" : ""}`}
			>
				<ul>
					<li className="sidebar-playlist-item" id="home">Home</li>
					<li className="sidebar-playlist-item" id="explore">Explore</li>
					<li className="sidebar-playlist-item" id="radio">Radio</li>
					<li className="sidebar-playlist-item" id="queue"><Link to={QUEUE}>Queue</Link></li>
				</ul>

				<h2>Library</h2>

				<ul id="library">
					<li id="for-you" className="sidebar-playlist-item">Made for you</li>
					<li id="recently-played" className="sidebar-playlist-item">Recently played</li>
					<li id="albums" className="sidebar-playlist-item">Albums</li>
					<li id="artists" className="sidebar-playlist-item">Artists</li>
					<li id="local-files" className="sidebar-playlist-item">Local files</li>
					<li id="podcasts" className="sidebar-playlist-item">Podcasts</li>
					<li id="starred" className="sidebar-playlist-item">Starred</li>
				</ul>

				<h2>Playlists</h2>

				<input
					className="filter-input"
					onChange={e => this.updateSearch(e)}
					value={searchQuery}
					placeholder="filter"
				/>
				<i
					className="far fa-times-circle"
					style={{  // TODO: TEMP
						marginLeft: 5,
						opacity: searchQuery ? 1 : 0
					}}
					onClick={() => this.removeSearchQuery()}
				>

				</i>

				{
					playlistGroups.length > 0 &&
					<div className="playlists">
						{playlistGroups.map(group => <PlaylistGroup key={group.uri} groupItem={group} />)}
					</div>
				}
				{
					playlistGroups.length === 0 &&
					<ul>
						{
							playlists.filter(playlist => playlist.name.toLowerCase().includes(searchQuery.toLowerCase())).map((playlist, i) =>
								<li
									key={playlist.uri}
									className="sidebar-playlist-item"
									onDoubleClick={() => this.playFromPlaylist(playlist.uri)}
									style={{
										// @ts-ignore
										"--bg-image": `url(${playlist.images[0] ? playlist.images[0].url : ""})`,
										"--no-image": `${!playlist.images[0] ? "''" : "' '"}`
									}}
									track-droppable="true"
									track-droppable-playlist="true"
									playlist-uri={playlist.uri}
								>
									<Link
										to={PLAYLIST_REDIRECT.replace(":playlistId", playlist.uri)}
									>
										{playlist.name} {displayName !== playlist.owner.display_name && <span className="playlist-owner">by {playlist.owner.display_name}</span>}
									</Link>
								</li>
							)
						}

					</ul>
				}
			</div>
		);
	}

}

export default Sidebar;
