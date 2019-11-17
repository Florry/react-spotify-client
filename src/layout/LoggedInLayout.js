import { BrowserRouter } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import Routes from "../Routes";
import Player from "../common/Player";
import React from "react";

export default class LoggedInLayout extends React.Component {

	render() {
		return (
			<div>
				<BrowserRouter>
					<Player />
					<Sidebar />
					<>
						<Routes />
					</>
				</BrowserRouter>
			</div>
		)
	}

}
