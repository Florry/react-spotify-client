import React from "react";
import { observer, inject } from "mobx-react";
import { PLAYLIST_REDIRECT } from "../../constants/routes";
import { Link, withRouter } from "react-router-dom";

/** @typedef {import("../../stores/PlaylistStore").default} PlaylistStore */
/** @typedef {import("../../stores/PlayerStore").default} PlayerStore */
/** @typedef {import("../../stores/AuthStore").default} AuthStore */

@inject("playlistStore", "playerStore", "authStore")
class PlaylistGroup extends React.Component {

	/** @type {PlaylistStore} */
	playlistStore = this.props.playlistStore;

	/** @type {PlayerStore} */
	playerStore = this.props.playerStore;

	/** @type {AuthStore} */
	authStore = this.props.authStore;

	state = {
		isOpen: false
	};

	render() {
		const { groupItem } = this.props;
		const { isOpen } = this.state;
		const displayName = this.authStore.displayName;

		return (
			<ul className="playlist-group"> {/* TODO: */}
				<div
					className={`sidebar-playlist-item group ${isOpen ? "open" : ""}`}
					onClick={() => this.setState({ isOpen: !isOpen })}
				>
					{groupItem.name}
				</div>
				{
					isOpen
					&& groupItem.items
					&& groupItem.items.map((item, i) => {
						if (item.type === "PLAYLIST") { // TODO:
							const playlist = this.playlistStore.getOfflinePlaylist(item.uri);

							if (!playlist)
								return;

							return <li
								key={playlist.uri}
								className="sidebar-playlist-item"
								onDoubleClick={() => this.playFromPlaylist(playlist.uri)}
								style={{
									backgroundColor: this.props.location.pathname.includes(playlist.uri) ? "#1b1b1b" : "",
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
							</li>;
						} else {
							return <PlaylistGroup
								{...this.props}
								key={item.uri + "group"}
								groupItem={item}
							/>;
						}
					})
				}

			</ul>
		);
	}

	async playFromPlaylist(playlistUri) {
		//TODO:
		await this.playlistStore.loadTracksInPlaylist(playlistUri);
		this.playerStore.setCurrentPlaylist(playlistUri);
	}

}

export default withRouter(PlaylistGroup);
