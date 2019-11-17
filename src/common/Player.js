import { inject, observer } from "mobx-react";
import VolumeControl from "./VolumeControl";
import Seekbar from "./Seekbar";
import React from "react";
import { NO_REPEAT, REPEAT, REPEAT_ONCE } from "../constants/player-constants";

/** @typedef {import("../stores/PlayerStore").default} PlayerStore */

@observer
@inject("playerStore")
class Player extends React.Component {

	/** @type {PlayerStore} */
	playerStore = this.props.playerStore;

	state = {
		playerState: {},
		ready: false
	};

	componentDidMount() {
		// TODO: TEMP, this shouldn't be necessary but it works for now...
		this.playerStore._state.observe(state => this.setState({ playerState: state.newValue }));
		this.playerStore._ready.observe(state => this.setState({ ready: state.newValue }));
		this.playerStore._currentPlaylist.observe(state => this.setState({ currentPlaylist: state.newValue }));
	}

	async playOrPause() {
		const paused = typeof this.state.playerState.paused === "undefined" || this.state.playerState.paused;

		if (paused)
			await this.playerStore.play();
		else
			await this.playerStore.pause();
	}

	render() {
		const { name, artists = [], album = { images: [] }, shuffle = false, repeatMode = 0, paused: statePaused } = this.state.playerState;
		const paused = typeof statePaused === "undefined" || statePaused;
		const ready = this.state.ready;
		const artistsString = artists.map(artist => artist.name).join(",")

		let biggestDimensions = 0;
		let albumCover;

		album.images.forEach(img => {
			if (img.width > biggestDimensions) {
				biggestDimensions = img.width;
				albumCover = img.url;
			}
		});

		return (
			<>
				<div
					className="player"
				>
					<h2
						hidden={ready}
						style={{ position: "absolute" }}
					>
						&nbsp;OFFLINE
						</h2>
					<div
						className="album-cover"
						style={{
							backgroundImage: albumCover && `url(${albumCover})`
						}}
					/>

					<div
						className="now-playing"
					>
						<p
							style={{
								opacity: name ? 1 : 0
							}}
						>
							{name || "name"}
						</p>
						<p
							style={{
								opacity: artistsString ? 1 : 0,
								fontSize: 10
							}}
						>
							{artistsString || "artists"}
						</p>
					</div>
					<div
						className="controls"
					>
						<VolumeControl />
						<div
							className="controls--button-group"
						>
							<button
								onClick={() => this.forceUpdate()}
								id="player-button-shuffle"
								className={!shuffle ? "inactive" : ""}
							>
								<i className="fas fa-random" />
							</button>

							<button
								onClick={() => this.playerStore.previousTrack()}
								id="player-button-previous"
							>
								<i className="fas fa-step-backward" />
							</button>

							<button
								onClick={() => this.playOrPause()}
								id="player-button-play-pause"
							>
								{paused ? <i className="fas fa-play" /> : <i className="fas fa-pause" />}
							</button>

							<button
								onClick={() => this.playerStore.nextTrack()}
								id="player-button-next"
							>
								<i className="fas fa-step-forward" />
							</button>

							<button
								onClick={() => this.forceUpdate()}
								id="player-button-repeat"
								className={repeatMode === NO_REPEAT ? "inactive" : ""}
							>
								{(repeatMode === REPEAT || repeatMode === NO_REPEAT) && <i className="fas fa-redo" />}
								{repeatMode === REPEAT_ONCE && (<><i className="fas fa-redo" />1</>)}
							</button>
						</div>
					</div>
				</div>
				<Seekbar />
			</>
		);
	}

}

export default Player;

const o = {
	"context": {
		"uri": "spotify:user:counterwille:playlist:4HFv8kVXrc7JLEg21RJhxt",
		"metadata": {
			"context_description": "Starred"
		}
	},
	"bitrate": 0,
	"position": 87465,
	"duration": 192220,
	"paused": false,
	"shuffle": true,
	"repeat_mode": 0,
	"track_window": {
		"current_track": {
			"id": "1lDFvDVZxEeeMrOqIHAuql",
			"uri": "spotify:track:1lDFvDVZxEeeMrOqIHAuql",
			"type": "track",
			"linked_from_uri": null,
			"linked_from": {
				"uri": null,
				"id": null
			},
			"media_type": "audio",
			"name": "Corps of Corpses",
			"duration_ms": 192220,
			"artists": [
				{
					"name": "Hawthorne Heights",
					"uri": "spotify:artist:126FigDBtqwS2YsOYMTPQe"
				}
			],
			"album": {
				"uri": "spotify:album:0iPDvB9rAkq3UBfUu0I6JM",
				"name": "Fragile Future (Bonus Track Version)",
				"images": [
					{
						"url": "https://i.scdn.co/image/ab67616d00001e027822ee330ff2450bd898b00a",
						"height": 300,
						"width": 300
					},
					{
						"url": "https://i.scdn.co/image/ab67616d000048517822ee330ff2450bd898b00a",
						"height": 64,
						"width": 64
					},
					{
						"url": "https://i.scdn.co/image/ab67616d0000b2737822ee330ff2450bd898b00a",
						"height": 640,
						"width": 640
					}
				]
			},
			"is_playable": true
		},
		"next_tracks": [
			{
				"id": "2mNSbkHbE90ISfFQISJ0L8",
				"uri": "spotify:track:2mNSbkHbE90ISfFQISJ0L8",
				"type": "track",
				"linked_from_uri": null,
				"linked_from": {
					"uri": null,
					"id": null
				},
				"media_type": "audio",
				"name": "Storm Corrosion",
				"duration_ms": 609080,
				"artists": [
					{
						"name": "Storm Corrosion",
						"uri": "spotify:artist:73p7913nnreqv6jbWpeNb1"
					},
					{
						"name": "Mikael Åkerfeldt",
						"uri": "spotify:artist:2B9AfTKnBclUFAnxS96Yan"
					}
				],
				"album": {
					"uri": "spotify:album:0HoIDUvBfh16mbFuJfT7Fu",
					"name": "Storm Corrosion (Special Edition)",
					"images": [
						{
							"url": "https://i.scdn.co/image/ab67616d00001e02401cbf78f6f6e1cf653a005d",
							"height": 300,
							"width": 300
						},
						{
							"url": "https://i.scdn.co/image/ab67616d00004851401cbf78f6f6e1cf653a005d",
							"height": 64,
							"width": 64
						},
						{
							"url": "https://i.scdn.co/image/ab67616d0000b273401cbf78f6f6e1cf653a005d",
							"height": 640,
							"width": 640
						}
					]
				},
				"is_playable": true
			},
			{
				"id": "2UmXstEJ8nkpUUfQRYieC6",
				"uri": "spotify:track:2UmXstEJ8nkpUUfQRYieC6",
				"type": "track",
				"linked_from_uri": "spotify:track:5agMA5n4YJZAsH9vV9AnWz",
				"linked_from": {
					"uri": "spotify:track:5agMA5n4YJZAsH9vV9AnWz",
					"id": "5agMA5n4YJZAsH9vV9AnWz"
				},
				"media_type": "audio",
				"name": "The House That Jack Built",
				"duration_ms": 398866,
				"artists": [
					{
						"name": "Metallica",
						"uri": "spotify:artist:2ye2Wgw4gimLv2eAKyk1NB"
					}
				],
				"album": {
					"uri": "spotify:album:6ndH0UlQbyCOVqByMXXhdV",
					"name": "Load",
					"images": [
						{
							"url": "https://i.scdn.co/image/1fd11f01aa243da7861c5dad58b0d2232231cbc1",
							"height": 297,
							"width": 300
						},
						{
							"url": "https://i.scdn.co/image/a4eee2ac4d7734c89104fc17597064d2b1fd655e",
							"height": 63,
							"width": 64
						},
						{
							"url": "https://i.scdn.co/image/5ead111df07bc6f6cce6887dc9feb0463fdfdc90",
							"height": 635,
							"width": 640
						}
					]
				},
				"is_playable": true
			}
		],
		"previous_tracks": []
	},
	"timestamp": 1573421698144,
	"restrictions": {
		"disallow_resuming_reasons": [
			"not_paused"
		],
		"disallow_skipping_prev_reasons": [
			"no_prev_track"
		]
	},
	"disallows": {
		"resuming": true,
		"skipping_prev": true
	}
}
