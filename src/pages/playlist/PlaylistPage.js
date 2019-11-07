import React from "react";
import AlbumTrackRow from "../../common/AlbumTrackRow";
import { inject, observer } from "mobx-react";

// @ts-ignore
const playlist = require("../../json/spotifyPlaylistSongs.json");
// @ts-ignore
const metadata = require("../../json/spotifyMetadata.json");

metadata.metadata = metadata.metadata.map(m => {
	m.artistsString = m.artists.map(artist => artist.name).join(",")
	return m;
});

// TODO: temp
const TITLES = {
	TITLE: "Title",
	ARTIST: "Artist",
	TIME: "Time",
	ALBUM: "Album",
	ADDED: "Added",
};

const SORT_TYPES = {
	TITLE: "TITLE",
	ARTIST: "ARTIST",
	TIME: "TIME",
	ALBUM: "ALBUM",
	ADDED: "ADDED",
	CUSTOM: "CUSTOM"
};

/** @typedef {import("../../stores/PlaylistStore").default} PlaylistStore */

@observer
@inject("playlistStore")
class PlaylistPage extends React.Component {

	/** @type {PlaylistStore} */
	playlistStore = this.props.playlistStore;

	state = {
		sortBy: SORT_TYPES.CUSTOM,
		sortOrder: 1,
		metadata: metadata.metadata,
		originalSortOrderMetadata: [...metadata.metadata],
		scrollTop: window.scrollY,
		playlistId: this.props.match.params.playlistId
	};

	currentNumberOfRows = -1;

	componentDidMount() {
		this.playlistStore.loadTracksInPlaylist(this.state.playlistId).then(() => this.forceUpdate());

		window.addEventListener("scroll", () => this.handleScroll());
	}

	componentWillUnmount() {
		window.removeEventListener("scroll", () => this.handleScroll());
	}

	async sort(sortBy) {
		const { metadata } = this.state;

		if (sortBy === this.state.sortBy) {
			await this.setState({ sortOrder: -this.state.sortOrder });

			if (this.state.sortOrder === 1) {
				await this.setState({ metadata: [...this.state.originalSortOrderMetadata], sortBy: SORT_TYPES.CUSTOM });
				return;
			}
		} else
			await this.setState({ sortBy, sortOrder: 1 });

		switch (sortBy) {
			case SORT_TYPES.TITLE: {
				const sortedMetadata = metadata;

				sortedMetadata.sort((a, b) => {
					if (a.track.name > b.track.name)
						return 1 * this.state.sortOrder;
					else if (a.track.name < b.track.name)
						return -1 * this.state.sortOrder;
					else
						return 0;
				});

				this.setState({ metadata: sortedMetadata });

				break;
			}
			case SORT_TYPES.ALBUM: {
				const sortedMetadata = metadata;

				sortedMetadata.sort((a, b) => {
					if (a.album.name > b.album.name)
						return 1 * this.state.sortOrder;
					else if (a.album.name < b.album.name)
						return -1 * this.state.sortOrder;
					else
						return 0;
				});

				this.setState({ metadata: sortedMetadata });

				break;
			}
			case SORT_TYPES.ARTIST: {
				const sortedMetadata = metadata;

				sortedMetadata.sort((a, b) => {
					if (a.artistsString > b.artistsString)
						return 1 * this.state.sortOrder;
					else if (a.artistsString < b.artistsString)
						return -1 * this.state.sortOrder;
					else
						return 0;
				});

				this.setState({ metadata: sortedMetadata });

				break;
			}
			case SORT_TYPES.TIME: {
				const sortedMetadata = metadata;

				sortedMetadata.sort((a, b) => {
					if (a.duration > b.duration)
						return 1 * this.state.sortOrder;
					else if (a.duration < b.duration)
						return -1 * this.state.sortOrder;
					else
						return 0;
				});

				this.setState({ metadata: sortedMetadata });

				break;
			}
			case SORT_TYPES.ADDED: {
				// TODO:
				break;
			}
			default:
				break;
		}
	}

	handleScroll(e) {
		this.setState({ scrollTop: window.scrollY });
	}

	/**
	 * @param {Array<?>} metadata
	*/
	getNumberOfRows(metadata) {
		let length = metadata.length;

		if (length <= 4)
			length += 4 - length;

		this.currentNumberOfRows = this.currentNumberOfRows + length

		return length;
	}

	render() {
		const { metadata, scrollTop } = this.state;

		let songsInCurrentAlbumRow = [];
		let offset = 0;

		const tracks = this.playlistStore.getTracksInPlaylist(this.state.playlistId);

		return (
			<div
				style={{
					left: 450,
					width: 1582,
					position: "relative"
				}}
			>
				<table>
					<thead>
						<tr>
							<th> </th>
							<th> </th>
							<th> </th>
							<th onClick={() => this.sort(SORT_TYPES.TITLE)}>{TITLES.TITLE.toUpperCase()} <span className="sort-indicator" hidden={this.state.sortBy !== SORT_TYPES.TITLE}>{this.state.sortOrder === -1 ? "▼" : "▲"}</span></th>
							<th onClick={() => this.sort(SORT_TYPES.ARTIST)}>{TITLES.ARTIST.toUpperCase()} <span className="sort-indicator" hidden={this.state.sortBy !== SORT_TYPES.ARTIST}>{this.state.sortOrder === -1 ? "▼" : "▲"}</span></th>
							<th onClick={() => this.sort(SORT_TYPES.TIME)}>{TITLES.TIME.toUpperCase()} <span className="sort-indicator" hidden={this.state.sortBy !== SORT_TYPES.TIME}>{this.state.sortOrder === -1 ? "▼" : "▲"}</span></th>
							<th onClick={() => this.sort(SORT_TYPES.ALBUM)}>{TITLES.ALBUM.toUpperCase()} <span className="sort-indicator" hidden={this.state.sortBy !== SORT_TYPES.ALBUM}>{this.state.sortOrder === -1 ? "▼" : "▲"}</span></th>
							<th onClick={() => this.sort(SORT_TYPES.ADDED)}>{TITLES.ADDED.toUpperCase()} <span className="sort-indicator" hidden={this.state.sortBy !== SORT_TYPES.ADDED}>{this.state.sortOrder === -1 ? "▼" : "▲"}</span></th>
						</tr>
					</thead>
					<tbody>
						{
							!!tracks && tracks.map((track, i) => {
								if (
									(!!tracks[i - 1] && tracks[i - 1].track.album.uri === tracks[i].track.album.uri)
									||
									(!songsInCurrentAlbumRow.length && (!!tracks[i + 1] && tracks[i + 1].track.album.uri === tracks[i].track.album.uri))

								) {
									songsInCurrentAlbumRow.push(track);
								} else if (songsInCurrentAlbumRow.length) {
									const songsInAlbum = [...songsInCurrentAlbumRow];
									const offsetToUse = offset;

									songsInCurrentAlbumRow.length = 0;

									return (
										<AlbumTrackRow
											offset={offsetToUse}
											key={track + i + "playlist"}
											songs={songsInAlbum}
										/>
									);
								}
								else {
									const offsetToUse = offset;

									return (
										<AlbumTrackRow
											offset={offsetToUse}
											key={track + i}
											songs={[track]}
										/>
									);
								}
							})
						}
					</tbody>
				</table>
			</div>
		);
	}
}

export default PlaylistPage;
