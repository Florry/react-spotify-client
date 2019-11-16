import React from "react";

export default class Slider extends React.Component {

	render() {
		return (
			<div
				ref="seekbar"
				className={`
					seekbar
				`}
			>
				<img ref="dragImg" hidden />
				<span
					className="position"
				>
					Min
				</span>

				<div
					className="progress-bar-wrapper"
				>
					<div
						className="progress-bar"
						ref="progressBar"
					>
						<div
							style={{}}
							className="progress-bar-inner"
						>
							<div
								draggable
								style={{}}
								ref="handle"
								className="handle"
							/>
						</div>
					</div>
				</div>

				<span
					className="duration"
				>
					MAX
				</span>
			</div>

		);
	}

}
