import { createContext } from "react";
import AuthStore from "./AuthStore";
import PlaylistStore from "./PlaylistStore";

class RootStore {

	constructor() {
		this.stores = {
			authStore: new AuthStore(this),
			playlistStore: new PlaylistStore(this)
		};
	}

}

const rootStore = new RootStore();

export const rootStoreContext = createContext(rootStore);
export default rootStore;
