import React from "react";
import Routes from "../Routes";
import Sidebar from "../common/Sidebar";
import { BrowserRouter } from "react-router-dom";

export default class LoggedInLayout extends React.Component {

	render() {
		return (
			<div>
				<BrowserRouter>
					<Sidebar />
					<>
						<Routes />
					</>
				</BrowserRouter>
			</div>
		)
	}

}
