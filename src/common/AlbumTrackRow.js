import React from "react";
import Utils from "../utils/Utils";

// @ts-ignore
const starredSongs = require("../json/spotifyStarred.json");

export default class AlbumTrackRow extends React.Component {

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

	shouldComponentUpdate(nextProps, nextState, nextContext) {
		return false;
	}

	render() {
		const { songs: inputSongs } = this.props;
		const songs = [...inputSongs];

		songs.sort((a, b) => {
			// TODO: If we sort by CUSTOM this shouldn't be sorted!
			const aDisc = a ? Number.parseInt(a.track.disc_number) : 100;
			const bDisc = b ? Number.parseInt(b.track.disc_number) : 100;

			return aDisc - bDisc;
		});

		songs.sort((a, b) => {
			// TODO: If we sort by CUSTOM this shouldn't be sorted!
			const aNumber = a ? Number.parseInt(a.track.track_number) : 100;
			const bNumber = b ? Number.parseInt(b.track.track_number) : 100;

			return aNumber - bNumber;
		});

		const additionalRows = this.getNumberOfRows(songs) - (songs.length - 1);

		for (let i = 0; i < additionalRows; i++)
			songs.push(null);

		const rows = [];

		songs.map((song, i) => {
			if (song === null)
				rows.push(
					<div
						className="tr empty-row"
						key={(songs[0].track.album ? songs[0].track.album.uri : "") + "-empty-album-track-row-" + i.toString()}
					>
						<div className="td album-td" />
						<div className="td td-starred" />
						<div className="td td-number" />
						<div className="td td-name" />
						<div className="td td-artist" />
						<div className="td td-duration" />
						<div className="td td-album" />
						<div className="td td-date" />
					</div>
				);
			else {
				const { added_at: added } = song;
				const { name, artists = [], album = { images: [] }, playable = true, duration_ms: duration, track_number: number, is_local: isLocal } = song.track;

				let smallestDimensions = 10000;
				let albumCover;

				album.images.forEach(img => {
					if (img.width < smallestDimensions) {
						smallestDimensions = img.width;
						albumCover = img.url;
					}
				});

				const artistsString = artists.map(artist => artist.name).join(",")
				const isStarred = !!songs[i] && starredSongs.starred.includes(songs[i].track.uri); // TODO: songs[i] is not sorted? 🤔

				const songUnplayable = !playable || !!isLocal;

				rows.push(
					<div
						hidden={this.props.hidden}
						title={songs[i].track.name}
						className={`tr ${i === 0 ? "album-top-row" : ""} ${songUnplayable ? "unplayable" : ""}`}
						key={album.uri + "-album-track-row-" + i.toString()}
					>
						<div
							className="td album-td"
						>
							<div
								style={{
									backgroundImage: albumCover ? `url(${albumCover}?url=https://github.com/Florry)` : "url(../images/no-cover-art.png)"
								}}
								className={i === 0
									? (songs.length === 1
										? "album-art single-song"
										: "album-art")
									: ""} />
						</div>
						<div
							className="td td-starred"
						>
							{isStarred ? <span className="filled">★</span> : "☆"}
						</div>
						<div
							className="td td-number"
						>
							{number}
						</div>
						<div
							className="td td-name"
						>
							{name}
						</div>
						<div
							className="td td-artist"
						>
							{artistsString}
						</div>
						<div
							className="td td-duration"
						>
							{Utils.duration(duration)}
						</div>
						<div
							className="td td-album"
							id={album.uri}
						>
							{album.name}
						</div>
						<div
							className="td td-date"
						>
							{added && added !== "1970-01-01T00:00:00Z" ? added.substring(0, 10) : ""}
						</div>
					</div>
				);
			}
		});

		return <div key={songs[0].track.album + "playlist"}>{rows}</div>;
	}

}

const o = {
	"added_at": "2019-10-30T17:20:20Z",
	"added_by": {
		"external_urls": {
			"spotify": "https://open.spotify.com/user/counterwille"
		},
		"href": "https://api.spotify.com/v1/users/counterwille",
		"id": "counterwille",
		"type": "user",
		"uri": "spotify:user:counterwille"
	},
	"is_local": false,
	"primary_color": null,
	"track": {
		"album": {
			"album_type": "album",
			"artists": [
				{
					"external_urls": {
						"spotify": "https://open.spotify.com/artist/0L8ExT028jH3ddEcZwqJJ5"
					},
					"href": "https://api.spotify.com/v1/artists/0L8ExT028jH3ddEcZwqJJ5",
					"id": "0L8ExT028jH3ddEcZwqJJ5",
					"name": "Red Hot Chili Peppers",
					"type": "artist",
					"uri": "spotify:artist:0L8ExT028jH3ddEcZwqJJ5"
				}
			],
			"available_markets": [
			],
			"external_urls": {
				"spotify": "https://open.spotify.com/album/7xl50xr9NDkd3i2kBbzsNZ"
			},
			"href": "https://api.spotify.com/v1/albums/7xl50xr9NDkd3i2kBbzsNZ",
			"id": "7xl50xr9NDkd3i2kBbzsNZ",
			"images": [
				{
					"height": 640,
					"url": "https://i.scdn.co/image/ab67616d0000b27309fd83d32aee93dceba78517",
					"width": 640
				},
				{
					"height": 300,
					"url": "https://i.scdn.co/image/ab67616d00001e0209fd83d32aee93dceba78517",
					"width": 300
				},
				{
					"height": 64,
					"url": "https://i.scdn.co/image/ab67616d0000485109fd83d32aee93dceba78517",
					"width": 64
				}
			],
			"name": "Stadium Arcadium",
			"release_date": "2006-05-09",
			"release_date_precision": "day",
			"total_tracks": 29,
			"type": "album",
			"uri": "spotify:album:7xl50xr9NDkd3i2kBbzsNZ"
		},
		"artists": [
			{
				"external_urls": {
					"spotify": "https://open.spotify.com/artist/0L8ExT028jH3ddEcZwqJJ5"
				},
				"href": "https://api.spotify.com/v1/artists/0L8ExT028jH3ddEcZwqJJ5",
				"id": "0L8ExT028jH3ddEcZwqJJ5",
				"name": "Red Hot Chili Peppers",
				"type": "artist",
				"uri": "spotify:artist:0L8ExT028jH3ddEcZwqJJ5"
			}
		],
		"available_markets": [],
		"disc_number": 1,
		"duration_ms": 309800,
		"episode": false,
		"explicit": false,
		"external_ids": {
			"isrc": "USWB10601602"
		},
		"external_urls": {
			"spotify": "https://open.spotify.com/track/3L2Nyi3T7XabH8EEZFLDdX"
		},
		"href": "https://api.spotify.com/v1/tracks/3L2Nyi3T7XabH8EEZFLDdX",
		"id": "3L2Nyi3T7XabH8EEZFLDdX",
		"is_local": false,
		"name": "Wet Sand",
		"popularity": 64,
		"preview_url": "https://p.scdn.co/mp3-preview/fc943bd27a6525c0cd6afc53c86e3978a1a23ade?cid=e3ab4c22331045f0b7f6e57235b58b47",
		"track": true,
		"track_number": 13,
		"type": "track",
		"uri": "spotify:track:3L2Nyi3T7XabH8EEZFLDdX"
	},
	"video_thumbnail": {
		"url": null
	}
};
