import { inject, observer } from "mobx-react";
import Slider from "./Slider";
import React from "react";
import Utils from "../utils/Utils";

/** @typedef {import("../stores/PlayerStore").default} PlayerStore */

const SEEKBAR_UPDATE_RATE = 100;

// TODO: fix bugs when screen is small!

@observer
@inject("playerStore")
class Seekbar extends React.Component {

	/** @type {PlayerStore} */
	playerStore = this.props.playerStore;

	state = {
		position: this.playerStore.state.position,
		paused: true,
		playing: false
	};

	seekbarInterval;

	componentDidMount() {
		// TODO: TEMP, this shouldn't be necessary but it works for now...
		this.playerStore._state.observe(state => {
			const newState = {};

			if (state.newValue.position !== this.state.position)
				newState.position = state.newValue.position;

			if (state.newValue.paused !== this.state.paused)
				newState.paused = state.newValue.paused;

			this.setState({ ...newState });
		});

		this.playerStore._playing.observe(state => this.setState({ playing: state.newValue }));

		this.seekbarInterval = setInterval(async () => {
			if (!this.state.paused) {
				await this.setState({ position: this.state.position + SEEKBAR_UPDATE_RATE });

				if (this.state.position >= this.playerStore.state.duration) {
					this.playerStore.nextTrack();
					this.setState({ position: 0 });
				}
			}
		}, SEEKBAR_UPDATE_RATE);
	}

	componentWillUnmount() {
		clearInterval(this.seekbarInterval);
	}

	seekTrack(positionToSeekTo) {
		this.playerStore.seekTrack(positionToSeekTo);
		this.setState({ position: positionToSeekTo });
	}

	render() {
		const { duration } = this.playerStore.state;
		const { position, playing } = this.state;

		return (
			<div
				className="seekbar"
			>
				<Slider
					disabled={!playing}
					value={playing ? Math.max(position - 1, 0) : 0}
					valueDecorator={Utils.duration}
					min={0}
					max={duration}
					maxDecorator={Utils.duration}
					onDragComplete={newPos => this.seekTrack(newPos)}
				/>
			</div>
		);
	}

}
export default Seekbar;
