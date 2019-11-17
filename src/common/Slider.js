import React from "react";
import PropTypes from "prop-types";

export default class Slider extends React.Component {

	static propTypes = {
		disabled: PropTypes.bool,
		max: PropTypes.number.isRequired,
		min: PropTypes.number.isRequired,
		value: PropTypes.number,
		valueDecorator: PropTypes.func,
		maxDecorator: PropTypes.func,
		onDragComplete: PropTypes.func
	};

	static defaultProps = {
		disabled: false,
		min: 0
	};

	state = {
		isDragging: false,
		handlePos: 0,
		currentValue: this.props.value
	};

	componentDidMount() {
		document.addEventListener("mousemove", (e) => this.handleOnDrag(e));
		document.addEventListener("mouseup", (e) => this.handleOnDragEnd(e));
	}

	componentWillUnmount() {
		document.removeEventListener("mousemove", (e) => this.handleOnDrag(e));
		document.removeEventListener("mouseup", (e) => this.handleOnDragEnd(e));
	}

	static getDerivedStateFromProps(props, state) {
		if (!state.isDragging && props.value !== state.currentValue)
			return { currentValue: props.value };

		return null;
	}

	handleOnDragStart(e) {
		e.preventDefault();

		const { disabled } = this.props;
		const { isDragging } = this.state;

		if (!disabled && !isDragging) {
			this.setState({ isDragging: true });
			this.handleOnDrag(e, true);
		}
	}

	handleOnDragEnd(e) {
		const { onDragComplete, disabled } = this.props;
		const { isDragging, currentValue } = this.state;

		if (!disabled && isDragging) {
			this.setState({ isDragging: false });

			if (onDragComplete)
				onDragComplete(Number.parseInt(currentValue));
		}
	}

	handleOnDrag(e, isDraggingIsForced) {
		const { max, min, disabled } = this.props;
		const { isDragging } = this.state;

		if (!disabled && (isDragging || isDraggingIsForced)) {
			const newPos = (e.pageX - (this.refs.progressBar.offsetLeft + this.refs.progressBar.offsetParent.offsetLeft));
			const currentValue = ((newPos / this.refs.progressBar.offsetWidth) * (max - min) + min).toFixed(0);

			if (newPos <= this.refs.progressBar.offsetWidth && newPos >= 0)
				this.setState({ handlePos: newPos, currentValue });
		}
	}

	getRenderedValue(value, max) {
		// TODO: if this has to go to <0 it needs to be adjusted to be able to display -
		let valueToDisplay = "";

		if ((value || "").toString().length < max.toString().length) {
			const numberOfZeroes = max.toString().length - (value || "").toString().length;

			for (let i = 0; i < numberOfZeroes; i++)
				valueToDisplay += "0";
		}

		valueToDisplay += (value || "").toString();

		return valueToDisplay;
	}

	getCurrentInnerProgressWidth() {
		const { max, min, disabled } = this.props;
		const { isDragging, handlePos, currentValue } = this.state;

		if (!!disabled)
			return "0%";
		else if (!!isDragging)
			return handlePos;
		else if (typeof min !== "undefined") {
			const val = (currentValue - min) / (max - min);

			return val * 100 + "%";
		} else
			return (currentValue / max) * 100 + "%";
	}

	render() {
		const { max, valueDecorator, maxDecorator, disabled } = this.props; // TODO: make value be between mix & max
		const { isDragging, handlePos, currentValue } = this.state;
		const valueToDisplay = valueDecorator ? valueDecorator(currentValue) : this.getRenderedValue(currentValue, max);

		return (
			<div
				onMouseDown={e => this.handleOnDragStart(e)}
				className={`
					slider
					${disabled ? "inactive" : ""}
					${isDragging ? "isDragging" : ""}
				`}
			>
				<span
					className="value"
				>
					{valueToDisplay}
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
								width: this.getCurrentInnerProgressWidth()
							}}
							className="progress-bar-inner"
						>
							<div
								draggable
								onDragStart={e => this.handleOnDragStart(e)}
								style={{
									left: isDragging ? handlePos : ""
								}}
								ref="handle"
								className="handle"
							/>
						</div>
					</div>
				</div>

				<span
					className="max"
				>
					{maxDecorator ? maxDecorator(max) : max}
				</span>
			</div>

		);
	}

}
