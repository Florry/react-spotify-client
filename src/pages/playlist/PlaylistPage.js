import React from "react";
import AlbumTrackRow from "../../common/AlbumTrackRow";
import { inject, observer } from "mobx-react";
import Slider from "../../common/Slider";
import Utils from "../../utils/Utils";

// // @ts-ignore
// const playlist = require("../../json/spotifyPlaylistSongs.json");
// @ts-ignore
// const playlist = require("../../json/mock-playlist.json");
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
const IGNORE_HEIGHT_CACHE = true;

/** @typedef {import("../../stores/PlaylistStore").default} PlaylistStore */
/** @typedef {import("../../stores/PlayerStore").default} PlayerStore */

@observer
@inject("playlistStore", "playerStore")
class PlaylistPage extends React.Component {

	/** @type {PlaylistStore} */
	playlistStore = this.props.playlistStore;

	/** @type {PlayerStore} */
	playerStore = this.props.playerStore;

	state = {
		sortBy: SORT_TYPES.CUSTOM,
		sortOrder: 1,
		metadata: [],
		originalSortOrderMetadata: [],
		scrollTop: window.scrollY,
		playlistId: this.props.match.params.playlistId,
		currentOffset: 0,
		originalTrackOrder: [],
		tracks: [],
		trackPlaylistItems: [], // only save uris
		songsToRender: [],
		firstTime: true,
		playlistHeight: 0,
		sliderPos: 0
		// tracks: playlist,
		// trackPlaylistItems: this.getTrackIPlaylisttems(playlist)
	};

	onDragComplete(newPos) {
		this.setState({ sliderPos: newPos });
	}

	_nextTenHeightCache = {};
	_heightCache = {};
	_heightBeforeCache = {};
	_allTracksCache = 0;

	async componentDidMount() {
		window.addEventListener("scroll", () => this.handleScroll());

		// // TODO:
		if (!this.props.queue)
			this.playlistStore.loadTracksInPlaylist(this.state.playlistId).then(async () => {
				const tracks = this.playlistStore.getTracksInPlaylist(this.state.playlistId);
				const originalTrackOrder = [...tracks];
				const trackPlaylistItems = this.getTrackPlaylistItems(tracks);

				await this.setState({
					originalTrackOrder,
					tracks,
					trackPlaylistItems,
					...this.getUpdatedState()
				});

				this.state.trackPlaylistItems.forEach((track, i) => this.getHeightBeforeTrackRow(this.state.trackPlaylistItems, i));

				this.handleScroll();
			});
		else {
			// TODO: TEMP
			const tracks = [...this.playerStore.playQueue];
			const originalTrackOrder = [...tracks];
			const trackPlaylistItems = this.getTrackPlaylistItems(tracks);

			await this.setState({
				originalTrackOrder,
				tracks,
				trackPlaylistItems,
				...this.getUpdatedState()
			});

			this.state.trackPlaylistItems.forEach((track, i) => this.getHeightBeforeTrackRow(this.state.trackPlaylistItems, i));

			this.handleScroll();
		}

		// const tracks = playlist;
		// const trackPlaylistItems = this.getTrackPlaylistItems(tracks);
		// const originalTrackOrder = [...tracks];

		// trackPlaylistItems.forEach((track, i) => this.getHeightBeforeTrackRow(trackPlaylistItems, i));

		// this.getHeightOfAllTracks(trackPlaylistItems, true);

		// await this.setState({
		// 	originalTrackOrder,
		// 	tracks,
		// 	trackPlaylistItems,
		// 	...this.getUpdatedState()
		// });
	}

	componentWillUnmount() {
		window.removeEventListener("scroll", () => this.handleScroll());
	}

	sort(inputSortBy) {
		let { tracks, originalTrackOrder, sortOrder, sortBy } = this.state;

		if (inputSortBy === this.state.sortBy) {
			sortOrder = -sortOrder;

			if (sortOrder === 1)
				sortBy = SORT_TYPES.CUSTOM;
		} else {
			sortBy = inputSortBy;
			sortOrder = 1;
		}

		let sortedTracks = [...tracks];

		switch (sortBy) {
			case SORT_TYPES.CUSTOM: {
				sortedTracks = [...originalTrackOrder];
				break;
			}
			case SORT_TYPES.TITLE: {
				sortedTracks.sort((a, b) => {
					if (a.track.name > b.track.name)
						return 1 * sortOrder;
					else if (a.track.name < b.track.name)
						return -1 * sortOrder;
					else
						return 0;
				});

				break;
			}
			// case SORT_TYPES.ALBUM: {
			// 	const sortedMetadata = metadata;

			// 	sortedMetadata.sort((a, b) => {
			// 		if (a.album.name > b.album.name)
			// 			return 1 * sortOrder;
			// 		else if (a.album.name < b.album.name)
			// 			return -1 * sortOrder;
			// 		else
			// 			return 0;
			// 	});

			// 	this.setState({ metadata: sortedMetadata });

			// 	break;
			// }
			// case SORT_TYPES.ARTIST: {
			// 	const sortedMetadata = metadata;

			// 	sortedMetadata.sort((a, b) => {
			// 		if (a.artistsString > b.artistsString)
			// 			return 1 * sortOrder;
			// 		else if (a.artistsString < b.artistsString)
			// 			return -1 * sortOrder;
			// 		else
			// 			return 0;
			// 	});

			// 	this.setState({ metadata: sortedMetadata });

			// 	break;
			// }
			// case SORT_TYPES.TIME: {
			// 	const sortedMetadata = metadata;

			// 	sortedMetadata.sort((a, b) => {
			// 		if (a.duration > b.duration)
			// 			return 1 * sortOrder;
			// 		else if (a.duration < b.duration)
			// 			return -1 * sortOrder;
			// 		else
			// 			return 0;
			// 	});

			// 	this.setState({ metadata: sortedMetadata });

			// 	break;
			// }
			case SORT_TYPES.ADDED: {
				// TODO:
				break;
			}
			default:
				break;
		}

		this._nextTenHeightCache = {};
		this._heightCache = {};
		this._heightBeforeCache = {};
		this._allTracksCache = 0;

		const sortedTrackPlaylistItems = this.getTrackPlaylistItems(sortedTracks);

		sortedTrackPlaylistItems.forEach((track, i) => this.getHeightBeforeTrackRow(sortedTrackPlaylistItems, i));

		this.getHeightOfAllTracks(sortedTrackPlaylistItems, false);

		this.setState({
			tracks: sortedTracks,
			trackPlaylistItems: sortedTrackPlaylistItems,
			sortBy,
			sortOrder,
			...this.getUpdatedState()
		});

		// this.handleScroll();
	}

	handleScroll(e) {
		this.setState(this.getUpdatedState());
	}

	getUpdatedState() {
		const getHeightForNextTenTracks = (inputI) => {
			if (!!this._nextTenHeightCache[inputI])
				return this._nextTenHeightCache[inputI];

			let height = 0;

			for (let i = 0; i < 10; i++)
				height += this.getHeightOfTrack(trackPlaylistItems[inputI + i]);

			this._nextTenHeightCache[inputI] = height;

			return height;
		};

		const { scrollY: scrollTop } = window;
		const { trackPlaylistItems } = this.state;

		let currentOffset = 0;

		for (let i = 0; i < trackPlaylistItems.length; i++) {
			const currentTrackHeight = this.getHeightOfTrack(trackPlaylistItems[i]);
			const heightBeforeTrack = this.getHeightBeforeTrackRow(trackPlaylistItems, i);
			const nextTenTracksHeight = getHeightForNextTenTracks(i);

			if (scrollTop > heightBeforeTrack + currentTrackHeight + nextTenTracksHeight + 44)
				currentOffset += currentTrackHeight;
		}

		let playlistHeight = this.getHeightOfAllTracks(trackPlaylistItems);
		playlistHeight -= currentOffset;
		playlistHeight += this.getHeightOfTrack(trackPlaylistItems[trackPlaylistItems.length - 1]);

		const songsToRender = [];

		for (let i = 0; i < trackPlaylistItems.length; i++) {
			const currentTrackStructure = trackPlaylistItems[i];
			const heightBeforeTrack = this.getHeightBeforeTrackRow(trackPlaylistItems, i);
			const currentTrackHeight = this.getHeightOfTrack(currentTrackStructure);
			const nextTenTracksHeight = getHeightForNextTenTracks(i);

			if (scrollTop > currentTrackHeight + heightBeforeTrack + nextTenTracksHeight + 44)
				continue;
			else if (scrollTop + window.innerHeight < currentTrackHeight + heightBeforeTrack - nextTenTracksHeight)
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

		return length + 1;
	}

	getTrackPlaylistItems(inputTracks) {
		const toReturn = [];
		let songsInCurrentAlbumRow = [];

		const tracks = [...inputTracks, null]; // TODO: this is a quick hack!

		// TODO: group local songs by album

		!!tracks && tracks.map((track, i) => {
			if (
				(!!tracks[i - 1] && !!track && tracks[i - 1].track.album && tracks[i - 1].track.album.uri === track.track.album.uri)
				||
				(!songsInCurrentAlbumRow.length && (!!tracks[i + 1] && !!track && !!tracks[i + 1].track.album && tracks[i + 1].track.album.uri === track.track.album.uri))
			) {
				songsInCurrentAlbumRow.push(track);
			} else if (songsInCurrentAlbumRow.length > 0) {
				const songsInAlbum = [...songsInCurrentAlbumRow];
				songsInCurrentAlbumRow.length = 0;

				toReturn.push({ songs: songsInAlbum, track: track || songsInAlbum[0], numberOfRows: this.getNumberOfRows(songsInAlbum), albumUri: track ? track.track.uri : songsInAlbum[0].track.uri });
			} else if (!!track)
				toReturn.push({ songs: [track], track, numberOfRows: this.getNumberOfRows([track]), albumUri: track.track.uri });
		});

		return toReturn;
	}

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

		this._heightCache[track] = (TEMP_TRACK_ROW_HEIGHT * track.numberOfRows);

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
		const { sortBy, sortOrder, currentOffset, playlistHeight, songsToRender, tracks } = this.state;

		return (
			<div
				style={{
					width: 1582,
					position: "relative",
					paddingLeft: "450px",
					marginRight: "auto",
					marginLeft: "auto",
					marginTop: "22px"
				}}
			>
				<div>

					<div className="th playlist-header">
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
					height: playlistHeight,
					marginTop: "22px"
				}}>
					{
						songsToRender.map((currentTrackStructure, i) =>
							<AlbumTrackRow
								playlistUri={this.state.playlistId}
								key={currentTrackStructure.albumUri + i + "playlist"}
								songs={currentTrackStructure.songs}
							/>
						)
					}
				</div>

				<Slider
					valueDecorator={Utils.duration}
					maxDecorator={Utils.duration}
					max={600000}
					value={this.state.sliderPos}
					onDragComplete={newPos => this.onDragComplete(newPos)}
				/>
				<button onClick={() => this.saveData(tracks, "mock-playlist.json")}>Save track data</button>
				<button onClick={() => this.forceUpdate()}>force update</button>

			</div>
		);
	}
}

export default PlaylistPage;
