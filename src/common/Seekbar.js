import React from "react";
import Utils from "../utils/Utils";
import { inject, observer } from "mobx-react";

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
		handleIsDragging: false,
		handlePos: 0,
		playing: false
	};

	seekbarInterval;

	componentDidMount() {
		this.handleOffsetLeft = this.refs.handle.offsetLeft;

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

		this.seekbarInterval = setInterval(() => {
			if (!this.state.paused)
				this.setState({ position: this.state.position + SEEKBAR_UPDATE_RATE });
		}, SEEKBAR_UPDATE_RATE);

		document.addEventListener("mousemove", (e) => this.handleOnDrag(e));
		document.addEventListener("mouseup", (e) => this.handleOnDragEnd(e));
	}

	componentWillUnmount() {
		clearInterval(this.seekbarInterval);

		document.removeEventListener("mousemove", (e) => this.handleOnDrag(e));
		document.removeEventListener("mouseup", (e) => this.handleOnDragEnd(e));
	}

	seekTrack(e) {
		if (!!e) {
			e.stopPropagation();
			e.preventDefault();
		}

		const positionToSeekTo = this.getPositionInTrackFromPositionOnSeekbar((e ? e.nativeEvent.pageX - this.refs.progressBar.offsetLeft : this.state.handlePos));

		this.playerStore.seekTrack(positionToSeekTo);

		this.setState({ position: positionToSeekTo });
	}

	getPositionInTrackFromPositionOnSeekbar(pos) {
		const duration = this.playerStore.state.duration;
		const widthOfElement = this.refs.progressBar.offsetWidth;
		const positionOnSeekbar = pos;
		const percentage = 100 - ((widthOfElement - positionOnSeekbar) / widthOfElement) * 100;
		const positionToSeekTo = duration * (percentage / 100);

		return positionToSeekTo;
	}

	async handleOnDragStart(e) {
		e.preventDefault();

		const { handleIsDragging, playing } = this.state;

		if (!handleIsDragging && playing) {
			this.setState({ handleIsDragging: true });
			this.handleOnDrag(e, true);
		}
	}

	handleOnDragEnd(e) {
		const { handleIsDragging, playing } = this.state;

		if (handleIsDragging && playing) {
			this.setState({ handleIsDragging: false });
			this.seekTrack();
		}
	}

	handleOnDrag(e, handleIsDraggingIsForced) {
		const { handleIsDragging, playing } = this.state;

		if ((handleIsDragging || handleIsDraggingIsForced) && playing) {
			const newPos = e.pageX - this.handleOffsetLeft;

			if (newPos <= this.refs.progressBar.offsetWidth && newPos >= 0)
				this.setState({ handlePos: newPos });
		}
	}

	render() {
		const { duration } = this.playerStore.state;
		const { position, handleIsDragging, playing, handlePos } = this.state;

		let durationToDisplay

		if (handleIsDragging && playing)
			durationToDisplay = Utils.duration(this.getPositionInTrackFromPositionOnSeekbar(handlePos));
		else
			durationToDisplay = Utils.duration(Math.max(position - 1, 0));

		return (
			<div
				ref="seekbar"
				className={`
					${!playing ? "inactive" : ""}
					${handleIsDragging ? "isDragging" : ""}
					seekbar
				`}
				onClick={(e) => this.seekTrack(e)}
				onMouseDown={e => this.handleOnDragStart(e)}
			>
				<img ref="dragImg" hidden />
				<span
					className="position"
				>
					{durationToDisplay}
				</span>

				<div
					className="progress-bar-wrapper"
				>
					<div
						className="progress-bar"
						ref="progressBar"
					>
						<div
							style={{
								width:
									playing ?
										handleIsDragging
											? handlePos
											: ((position) / (duration)) * 100 + "%"
										: 0
							}}
							className="progress-bar-inner"
						>
							<div
								draggable
								onDragStart={e => this.handleOnDragStart(e)}
								style={{
									left: handleIsDragging ? handlePos : ""
								}}
								ref="handle"
								className="handle"
							/>
						</div>
					</div>
				</div>

				<span
					className="duration"
				>
					{Utils.duration(duration)}
				</span>
			</div>
		);
	}

}
export default Seekbar;
