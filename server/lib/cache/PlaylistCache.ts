import Cache from "./Cache";
import { Db } from "mongodb";

export default class PlaylistCache extends Cache {

	constructor(db: Db) {
		super(db.collection("playlist-cache"));
	}

}
