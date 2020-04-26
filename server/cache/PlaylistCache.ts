import { Db } from "mongodb";
import Cache from "./Cache";

export default class PlaylistCache extends Cache {

	constructor(db: Db) {
		super(db.collection("playlist-cache"));
	}

}
