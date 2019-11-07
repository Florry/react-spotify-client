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

	render() {
		const { songs, offset } = this.props;

		songs.sort((a, b) => {
			const aDisc = a ? a.disc_number : 100;
			const bDisc = b ? b.disc_number : 100;
			const aNumber = a ? a.track_number : 100;
			const bNumber = b ? b.track_number : 100;

			if (aDisc > bDisc)
				return 1;
			else if (aDisc < bDisc)
				return -1;
			else if (aNumber > bNumber)
				return 1;
			else if (aNumber < bNumber)
				return -1;
			else
				return 0;
		});

		const additionalRows = this.getNumberOfRows(songs) - (songs.length - 1);

		for (let i = 0; i < additionalRows; i++)
			songs.push(null);

		return (
			songs.map((song, i) => {
				// TODO: offset all tr with position absolute

				if (song === null)
					return <tr
						className="empty-row"
						key={songs[i] ? songs[i].toString() : i.toString() + i.toString()}
					>
						<td />
						<td />
						<td />
						<td />
						<td />
						<td />
						<td />
						<td />
					</tr>;

				const { added_at: added } = song;
				const { name, artists, album, playable = true, duration_ms: duration, track_number: number } = song.track;

				let biggestDimensions = 0;
				let albumCover;

				album.images.forEach(img => {
					if (img.width > biggestDimensions) {
						biggestDimensions = img.width;
						albumCover = img.url;
					}
				});

				const artistsString = artists.map(artist => artist.name).join(",")
				const isStarred = !!songs[i] && starredSongs.starred.includes(songs[i]); // TODO: songs[i] is not sorted? 🤔

				return (
					<tr
						title={songs[i]}
						className={`${i === 0 ? "album-top-row" : ""} ${!playable ? "unplayable" : ""}`}
						key={"album-track-row" + i.toString()}
					>
						<td
							className="album-td"
						>
							<div
								style={{
									backgroundImage: `url(${albumCover}?url=https://github.com/Florry)`
								}}
								className={i === 0
									? (songs.length === 1
										? "album-art single-song"
										: "album-art")
									: ""} />
						</td>
						<td
							className="td-starred"
						>
							{isStarred ? <span className="filled">★</span> : "☆"}
						</td>
						<td
							className="td-number"
						>
							{number}
						</td>
						<td
							className="td-name"
						>
							{name}
						</td>
						<td
							className="td-artist"
						>
							{artistsString}
						</td>
						<td
							className="td-duration"
						>
							{Utils.duration(duration)}
						</td>
						<td
							className="td-album"
							id={album.uri}
						>
							{album.name}
						</td>
						<td
							className="td-date"
						>
							{added.substring(0, 10)}
						</td>
					</tr>
				);

			})
		);
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
