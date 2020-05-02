import Cache from "./Cache";
import { Db } from "mongodb";

export default class AuthCache extends Cache {

	constructor(db: Db) {
		super(db.collection("auth-cache"));
	}

}
