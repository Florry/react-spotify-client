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
		const { metadata, songs, offset } = this.props;

		metadata.sort((a, b) => {
			const aDisc = a ? a.disc : 100;
			const bDisc = b ? b.disc : 100;
			const aNumber = a ? a.number : 100;
			const bNumber = b ? b.number : 100;

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

		const additionalRows = this.getNumberOfRows(metadata) - (metadata.length - 1);

		for (let i = 0; i < additionalRows; i++)
			metadata.push(null);

		return (
			metadata.map((data, i) => {
				// TODO: offset all tr with position absolute

				if (data === null)
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

				const { name, artists, album, playable, duration, number, artistsString } = data;
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
								className={i === 0
									? (metadata.length === 1
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
							2019-11-05
						</td>
					</tr>
				);

			})
		);
	}

}


// {
	// 	"artists": [
	// 		{
	// 			"image": "spotify:image:8b5d3e6841fb39a4520b4bbe4b92eb8e05cfb273",
	// 			"images": [
	// 				[
	// 					64,
	// 					"spotify:image:c1a6abacb97b62f6126e19b8e444a4bb9ed47719"
	// 				],
	// 				[
	// 					300,
	// 					"spotify:image:8b5d3e6841fb39a4520b4bbe4b92eb8e05cfb273"
	// 				],
	// 				[
	// 					600,
	// 					"spotify:image:35b508aa8b95e23b531303051a57da20b8480fc1"
	// 				]
	// 			],
	// 			"name": "Black Bonzo",
	// 			"uri": "spotify:artist:62XNOSp5whyD7SbFtXvYnb"
	// 		}
	// 	],
	// 	"image": "spotify:image:ab67616d00001e02aa4819e836d1e19c453492de",
	// 	"images": [
	// 		[
	// 			64,
	// 			"spotify:image:ab67616d00004851aa4819e836d1e19c453492de"
	// 		],
	// 		[
	// 			300,
	// 			"spotify:image:ab67616d00001e02aa4819e836d1e19c453492de"
	// 		],
	// 		[
	// 			600,
	// 			"spotify:image:ab67616d0000b273aa4819e836d1e19c453492de"
	// 		]
	// 	],
	// 	"linkedTrack": "spotify:track:0iymXXnXVqoLJEp2hUeRE5",
	// 	"disc": 1,
	// 	"duration": 424000,
	// 	"name": "Lady Of The Light",
	// 	"number": 1,
	// 	"playable": true,
	// 	"explicit": false,
	// 	"availability": "available",
	// 	"album": {
	// 		"uri": "spotify:album:0GI3PrOuJy1Q6MNuoHVGx7",
	// 		"name": "Lady of the Light"
	// 	},
	// 	"local": false,
	// 	"advertisement": false,
	// 	"placeholder": false
	// }
