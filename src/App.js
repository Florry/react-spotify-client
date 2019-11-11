import { Provider } from "mobx-react";
import rootStore from "./stores/RootStore";
import React from "react";
import "./App.css";
import LoggedInLayout from "./layout/LoggedInLayout";
import { observer } from "mobx-react";

@observer
class App extends React.Component {

	componentDidMount() {
		rootStore.stores.authStore.login();
	}

	render() {
		return (
			<div
				className="App"
			>
				<Provider
					rootStore={rootStore} {...rootStore.stores}
				>
					<LoggedInLayout />
				</Provider>

			</div>
		);
	}
}

export default App;
