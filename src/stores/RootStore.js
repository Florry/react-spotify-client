import { createContext } from "react";
import AuthStore from "./AuthStore";
import PlaylistStore from "./PlaylistStore";
import PlayerStore from "./PlayerStore";

class RootStore {

	constructor() {
		this.stores = {
			authStore: new AuthStore(this),
			playlistStore: new PlaylistStore(this),
			playerStore: new PlayerStore(this)
		};
	}

}

const rootStore = new RootStore();

export const rootStoreContext = createContext(rootStore);
export default rootStore;
