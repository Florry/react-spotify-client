import { inject } from "mobx-react";
import React from "react";

/** @typedef {import("../stores/PlaylistStore").default} PlaylistStore */

@inject("playlistStore")
class DraggableTrack extends React.Component {

	/** @type {PlaylistStore} */
	playlistStore = this.props.playlistStore;

	constructor(props) {
		super(props);
		this.handleOnDragEnd = this.handleOnDragEnd.bind(this);
		this.handleOnDragStart = this.handleOnDragStart.bind(this);
	}

	handleOnDragStart(e) {
		e.preventDefault();
		this.playlistStore.setIsDraggingTrack(true);
		document.addEventListener("mouseup", this.handleOnDragEnd);
	}

	handleOnDragEnd(e) {
		this.playlistStore.setIsDraggingTrack(false);
		document.removeEventListener("mouseup", this.handleOnDragEnd);

		// TODO: quick hack
		let element;

		if (e.target && e.target.hasAttribute("track-droppable"))
			element = e.target;
		else if (e.target.parentElement && e.target.parentElement.hasAttribute("track-droppable"))
			element = e.target.parentElement;
		else if (e.target.parentElement.parentElement && e.target.parentElement.parentElement.hasAttribute("track-droppable"))
			element = e.target.parentElement.parentElement;

		if (!!element) {
			if (element.hasAttribute("track-droppable-playlist")) {
				const playlistUri = element.getAttribute("playlist-uri");

				this.playlistStore.addTracksToPlaylist(playlistUri, [this.props.uri]);
			}
		}
	}

	render() {
		const { children, disabled } = this.props;

		return (
			<div
				draggable={disabled ? false : true}
				onDragStart={this.handleOnDragStart}
				track-droppable="true"
			>
				{children}
			</div>
		);
	}

}

export default DraggableTrack;
