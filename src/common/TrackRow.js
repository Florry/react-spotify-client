import React from "react";
import Utils from "../utils/Utils";

export default class TrackRow extends React.Component {

	render() {
		const { metadata } = this.props;
		const { name, artists, album, playable, duration, number } = metadata;

		// TODO: temp
		const style = {
			opacity: playable ? 1 : 0.5
		};

		const artistsString = artists.map(artist => artist.name).join(",");

		return (
			<tr
				style={style}
			>
				<td></td>
				<td>{number}</td>
				<td>{name}</td>
				<td>{artistsString}</td>
				<td>{Utils.duration(duration)}</td>
				<td>{album.name}</td>
				<td>2019-11-05</td>
			</tr>
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
