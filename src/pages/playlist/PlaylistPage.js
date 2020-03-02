import { inject, observer } from "mobx-react";
import AlbumTrackRow from "../../common/AlbumTrackRow";
import React from "react";
import uuid from "uuid";
import DraggableTrack from "../../common/DraggableTrack";
import Utils from "../../utils/Utils";

// TODO: move a lot of this code into components!

// TODO: get rid of local state!

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
		currentOffset: 0,
		originalTrackOrder: [],
		tracks: [],
		trackPlaylistItems: [], // only save uris
		songsToRender: [],
		firstTime: true,
		playlistHeight: 0,
		// tracks: playlist,
		// trackPlaylistItems: this.getTrackIPlaylisttems(playlist)
		isDraggingTrack: false
	};

	// TODO: TEMP
	_totalPlaytime = 0;

	_nextTenHeightCache = {};
	_heightCache = {};
	_heightBeforeCache = {};
	_allTracksCache = 0;

	async componentDidMount() {
		window.addEventListener("scroll", () => this.handleScroll());

		// // TODO:
		if (!this.props.queue) {
			const prepare = async () => {
				const tracks = this.playlistStore.getTracksInPlaylist(this.props.match.params.playlistId);
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

			prepare().then(() => this.forceUpdate())
				.catch(err => console.log(err));

			this.playlistStore.loadTracksInPlaylist(this.props.match.params.playlistId)
				.then(async () => {
					prepare();
					await this.forceUpdate();
				})
				.catch(err => console.log(err));
		} else {
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

		this.playlistStore._isDraggingTrack.observe(() => this.forceUpdate());
		this.playlistStore._tracks.observe(() => this.forceUpdate());
		this.playlistStore._playlists.observe(() => this.forceUpdate());

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
					const aTrackName = a.track.name.toLowerCase().split("'").join("").replace(/[^a-zA-Z0-9]/g, '').split("(").join("").split(")").join("");
					const bTrackName = b.track.name.toLowerCase().split("'").join("").replace(/[^a-zA-Z0-9]/g, '').split("(").join("").split(")").join("");

					if (aTrackName > bTrackName)
						return 1 * sortOrder;
					else if (aTrackName < bTrackName)
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

		this._totalPlaytime = 0;

		!!tracks && tracks.map((track, i) => {
			const id = uuid.v4();

			if (!!track)
				this._totalPlaytime += track.track.duration_ms;

			if (
				(!!tracks[i - 1] && !!track && tracks[i - 1].track.album && tracks[i - 1].track.album.uri === track.track.album.uri)
				||
				(!songsInCurrentAlbumRow.length && (!!tracks[i + 1] && !!track && !!tracks[i + 1].track.album && tracks[i + 1].track.album.uri === track.track.album.uri))
			) {
				songsInCurrentAlbumRow.push(track);
			} else if (songsInCurrentAlbumRow.length > 0) {
				const songsInAlbum = [...songsInCurrentAlbumRow];
				songsInCurrentAlbumRow.length = 0;

				toReturn.push({ id, songs: songsInAlbum, track: track || songsInAlbum[0], numberOfRows: this.getNumberOfRows(songsInAlbum), albumUri: track ? track.track.uri : songsInAlbum[0].track.uri });
			} else if (!!track)
				toReturn.push({ id, songs: [track], track, numberOfRows: this.getNumberOfRows([track]), albumUri: track.track.uri });
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

	render() {
		const isDraggingTrack = this.playlistStore.isDraggingTrack;
		const { sortBy, sortOrder, currentOffset, playlistHeight, songsToRender, tracks } = this.state;

		return (
			<div
				className={`playlist ${isDraggingTrack ? "isDraggingTrack" : ""}`}
				style={{
					width: 1582,
					position: "relative",
					paddingLeft: "450px",
					marginRight: "auto",
					marginLeft: "auto",
					marginTop: "22px"
				}}
			>
				<span style={{
					color: "#fff",
					position: "fixed",
					zIndex: 2000,
					backgroundColor: "#000"
				}}>{tracks.length} songs | {Utils.durationHours(this._totalPlaytime)}</span>
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
								playlistUri={this.props.match.params.playlistId}
								key={currentTrackStructure.id + "playlist"}
								songs={currentTrackStructure.songs}
							/>
						)
					}

				</div>
			</div>
		);
	}
}

export default PlaylistPage;
