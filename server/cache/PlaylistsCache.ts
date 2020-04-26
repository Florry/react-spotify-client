import { Db } from "mongodb";
import Cache from "./Cache";

export default class PlaylistsCache extends Cache {

	constructor(db: Db) {
		super(db.collection("playlists-cache"));
	}

	async getAll() {
		return await this.collection.find({}).toArray();
	}

}
