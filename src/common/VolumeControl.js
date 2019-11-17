import { inject, observer } from "mobx-react";
import Slider from "./Slider";
import React from "react";

/** @typedef {import("../stores/PlayerStore").default} PlayerStore */

@observer
@inject("playerStore")
class VolumeControl extends React.Component {

	/** @type {PlayerStore} */
	playerStore = this.props.playerStore;

	state = {
		volume: 100,
		lastVolume: 100
	};

	getVolumeInterval;

	componentDidMount() {
		// TODO: this is not super necessary!
		// this.getVolumeInterval = setInterval(async () => {
		// 	const volume = await this.playerStore.getVolume();
		// 	this.setState({ volume: volume * 100 });
		// }, 1000);
	}

	setVolume(volume) {
		this.setState({ volume });
		this.playerStore.setVolume(volume / 100);
	}

	toggleMute() {
		// TODO: this is a bit buggy!
		const { volume, lastVolume } = this.state;

		let newVolume = 0;

		if (volume === 0)
			newVolume = lastVolume;

		if (volume !== 0)
			this.setState({ lastVolume: volume });

		this.setVolume(newVolume);
	}

	getIcon(val) {
		const style = { width: 15 };

		let icon;

		if (val > 50)
			icon = <i style={style} className="fas fa-volume-up" />;
		else if (val > 0)
			icon = <i style={style} className="fas fa-volume-down" />;
		else
			icon = <i style={style} className="fas fa-volume-mute" />;

		return (
			<span
				className="volume-control-mute"
				onClick={() => this.toggleMute()}>
				{icon}
			</span>
		);
	}

	render() {
		const { volume } = this.state;

		return (
			<div
				style={{
					marginTop: -12,
					zIndex: 4000
				}}
			>
				<Slider
					value={volume}
					min={0}
					max={100}
					maxDecorator={() => { }}
					valueDecorator={val => this.getIcon(val)}
					onDragComplete={volume => this.setVolume(volume)}
					setValueOnDrag={true}
				/>
			</div>
		);
	}

}

export default VolumeControl;
