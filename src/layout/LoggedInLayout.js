import React from "react";
import Routes from "../Routes";
import Sidebar from "../common/Sidebar";
import { BrowserRouter } from "react-router-dom";
import Player from "../common/Player";

export default class LoggedInLayout extends React.Component {

	render() {
		return (
			<div>
				<BrowserRouter>
					<Sidebar />
					<>
						<Routes />
					</>
					<Player />
				</BrowserRouter>
			</div>
		)
	}

}
