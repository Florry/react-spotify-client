import React from "react";
import AlbumTrackRow from "../../common/AlbumTrackRow";
import { inject, observer } from "mobx-react";
import VirtualList from "react-virtual-list";
// // @ts-ignore
// const playlist = require("../../json/spotifyPlaylistSongs.json");
// @ts-ignore
const playlist = require("../../json/mock-playlist.json");
// // @ts-ignore
// const metadata = require("../../json/spotifyMetadata.json");

// metadata.metadata = metadata.metadata.map(m => {
// 	m.artistsString = m.artists.map(artist => artist.name).join(",")
// 	return m;
// });

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

const TEMP_TRACK_ROW_HEIGHT = 22;

/** @typedef {import("../../stores/PlaylistStore").default} PlaylistStore */

@observer
@inject("playlistStore")
class PlaylistPage extends React.Component {

	/** @type {PlaylistStore} */
	playlistStore = this.props.playlistStore;

	state = {
		sortBy: SORT_TYPES.CUSTOM,
		sortOrder: 1,
		metadata: [],
		originalSortOrderMetadata: [],
		scrollTop: window.scrollY,
		playlistId: this.props.match.params.playlistId,
		currentOffset: 0,
		tracks: [],
		trackPlaylistItems: [],
		songsToRender: [],
		firstTime: true,
		playlistHeight: 0

		// tracks: playlist,
		// trackPlaylistItems: this.getTrackIPlaylisttems(playlist)
	};

	currentNumberOfRows = -1;

	async componentDidMount() {
		window.addEventListener("scroll", () => this.handleScroll());

		// // TODO:
		// this.playlistStore.loadTracksInPlaylist(this.state.playlistId).then(async () => {
		// 	const tracks = this.playlistStore.getTracksInPlaylist(this.state.playlistId);
		// 	const trackPlaylistItems = this.getTrackIPlaylisttems(tracks);

		// 	await this.setState({
		// 		tracks,
		// 		trackPlaylistItems,
		// 		...this.getUpdatedState()
		// 	});

		// 	this.state.trackPlaylistItems.forEach((track, i) => this.getHeightBeforeTrackRow(this.state.trackPlaylistItems, i));
		// });

		const tracks = playlist;
		const trackPlaylistItems = this.getTrackIPlaylisttems(tracks);

		await this.setState({
			tracks,
			trackPlaylistItems,
			...this.getUpdatedState()
		});

		this.state.trackPlaylistItems.forEach((track, i) => this.getHeightBeforeTrackRow(this.state.trackPlaylistItems, i));

		this.getHeightOfAllTracks(this.state.trackPlaylistItems, true);
	}

	componentWillUnmount() {
		window.removeEventListener("scroll", () => this.handleScroll());
	}

	async sort(sortBy) {

	}

	handleScroll(e) {
		this.setState(this.getUpdatedState());
	}

	getUpdatedState() {
		const { scrollY: scrollTop } = window;
		const { trackPlaylistItems } = this.state;

		let currentOffset = 0;

		for (let i = 0; i < trackPlaylistItems.length; i++) {
			const currentTrackHeight = this.getHeightOfTrack(trackPlaylistItems[i]);
			const heightBeforeTrack = this.getHeightBeforeTrackRow(trackPlaylistItems, i);

			if (scrollTop > heightBeforeTrack + currentTrackHeight + 44)
				currentOffset += currentTrackHeight;
		}

		let playlistHeight = this.getHeightOfAllTracks(trackPlaylistItems);
		playlistHeight -= currentOffset;
		playlistHeight += this.getHeightOfTrack(trackPlaylistItems[trackPlaylistItems.length - 1]);

		const songsToRender = [];

		for (let i = 0; i < trackPlaylistItems.length; i++) {
			const currentTrackStructure = trackPlaylistItems[i];
			const currentTrackHeight = this.getHeightOfTrack(currentTrackStructure);
			const nextCurrentTrackHeight = this.getHeightOfTrack(trackPlaylistItems[i + 1]);
			const heightBeforeTrack = this.getHeightBeforeTrackRow(trackPlaylistItems, i);

			if (scrollTop > currentTrackHeight + heightBeforeTrack + 44)
				continue;
			else if (scrollTop + window.innerHeight < currentTrackHeight + heightBeforeTrack - nextCurrentTrackHeight)
				break;
			else
				songsToRender.push(currentTrackStructure);
		}


		return {
			scrollTop,
			currentOffset,
			playlistHeight,
			songsToRender
		};
	}

	/**
	 * @param {Array<?>} songs
	*/
	getNumberOfRows(songs) {
		let length = songs.length;

		if (length <= 4)
			length += 4 - length;

		this.currentNumberOfRows = this.currentNumberOfRows + length

		return length + 1;
	}

	getTrackIPlaylisttems(tracks) {
		const toReturn = [];
		let songsInCurrentAlbumRow = [];

		!!tracks && tracks.map((track, i) => {
			if (
				(!!tracks[i - 1] && tracks[i - 1].track.album && tracks[i - 1].track.album.uri === tracks[i].track.album.uri)
				||
				(!songsInCurrentAlbumRow.length && (!!tracks[i + 1] && !!tracks[i + 1].track.album && tracks[i + 1].track.album.uri === tracks[i].track.album.uri))
			)
				songsInCurrentAlbumRow.push(track);
			else if (songsInCurrentAlbumRow.length) {
				const songsInAlbum = [...songsInCurrentAlbumRow];
				songsInCurrentAlbumRow.length = 0;

				toReturn.push({ songs: songsInAlbum, track, numberOfRows: this.getNumberOfRows(songsInAlbum), albumUri: track.track.uri });
			} else
				toReturn.push({ songs: [track], track, numberOfRows: this.getNumberOfRows([track]), albumUri: track.track.uri });
		});

		return toReturn;
	}

	_heightCache = {};
	_heightBeforeCache = {};
	_allTracksCache = 0;

	/**
	 * @param {Array<?>} trackPlaylistItems
	 * @param {Number} trackRowIndex
	 */
	getHeightBeforeTrackRow(trackPlaylistItems, trackRowIndex) {
		if (this._heightBeforeCache[trackRowIndex])
			return this._heightBeforeCache[trackRowIndex];

		const tracksBefore = trackPlaylistItems.slice(0, trackRowIndex);
		let height = 0;

		tracksBefore.forEach(track => height += this.getHeightOfTrack(track));

		this._heightBeforeCache[trackRowIndex] = height;

		return height;
	}

	/**
	 * @param {?} track
	 */
	getHeightOfTrack(track) {
		if (!track)
			return 0;

		if (!!this._heightCache[track.albumUri])
			return this._heightCache[track.albumUri];

		this._heightCache[track] = (TEMP_TRACK_ROW_HEIGHT * track.numberOfRows) + 1;

		return this._heightCache[track];
	}

	/**
	 * @param {Array<?>} trackPlaylistItems
	 * @param {?=} ignoreCahce
	 */
	getHeightOfAllTracks(trackPlaylistItems, ignoreCahce) {
		if (!!this._allTracksCache && !ignoreCahce)
			return this._allTracksCache;

		let totalHeight = 0;

		trackPlaylistItems.forEach(track => totalHeight += this.getHeightOfTrack(track));

		this._allTracksCache = totalHeight;

		return totalHeight;
	}

	saveData(data, filename) {
		if (!data) {
			console.error("Console.save: No data")
			return;
		}

		if (!filename) filename = "console.json"

		if (typeof data === "object") {
			data = JSON.stringify(data)
		}

		var blob = new Blob([data], {
			type: "text/json"
		}),
			e = document.createEvent("MouseEvents"),
			a = document.createElement("a")

		a.download = filename
		a.href = window.URL.createObjectURL(blob)
		a.dataset.downloadurl = ["text/json", a.download, a.href].join(":")
		e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
		a.dispatchEvent(e)
	}

	render() {
		const { sortBy, sortOrder, currentOffset, playlistHeight, songsToRender } = this.state;

		return (
			<div
				style={{
					left: 450,
					width: 1582,
					position: "relative"
				}}
			>
				<div>

					<div className="th">
						<div className="td album-td"> </div>
						<div className="td td-starred"> </div>
						<div className="td td-number"> </div>
						<div className="td td-name" onClick={() => this.sort(SORT_TYPES.TITLE)}>{TITLES.TITLE.toUpperCase()} <span className="sort-indicator" hidden={sortBy !== SORT_TYPES.TITLE}>{sortOrder === -1 ? "▼" : "▲"}</span></div>
						<div className="td td-artist" onClick={() => this.sort(SORT_TYPES.ARTIST)}>{TITLES.ARTIST.toUpperCase()} <span className="sort-indicator" hidden={sortBy !== SORT_TYPES.ARTIST}>{sortOrder === -1 ? "▼" : "▲"}</span></div>
						<div className="td td-duration" onClick={() => this.sort(SORT_TYPES.TIME)}>{TITLES.TIME.toUpperCase()} <span className="sort-indicator" hidden={sortBy !== SORT_TYPES.TIME}>{sortOrder === -1 ? "▼" : "▲"}</span></div>
						<div className="td td-album" onClick={() => this.sort(SORT_TYPES.ALBUM)}>{TITLES.ALBUM.toUpperCase()} <span className="sort-indicator" hidden={sortBy !== SORT_TYPES.ALBUM}>{sortOrder === -1 ? "▼" : "▲"}</span></div>
						<div className="td td-date" onClick={() => this.sort(SORT_TYPES.ADDED)}>{TITLES.ADDED.toUpperCase()} <span className="sort-indicator" hidden={sortBy !== SORT_TYPES.ADDED}>{sortOrder === -1 ? "▼" : "▲"}</span></div>
					</div>

				</div>

				<div style={{
					paddingTop: currentOffset,
					overflow: "hidden",
					display: "block",
					height: playlistHeight
				}}>
					{
						songsToRender.map((currentTrackStructure, i) =>
							<AlbumTrackRow
								key={currentTrackStructure.albumUri + i + "playlist"}
								songs={currentTrackStructure.songs}
							/>
						)
					}

				</div>


				<button onClick={() => this.saveData(this.state.tracks, "mock-playlist.json")}>Save track data</button>

			</div>
		);
	}
}

export default PlaylistPage;
