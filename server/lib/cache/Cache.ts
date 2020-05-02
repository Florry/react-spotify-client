import { Collection } from "mongodb";

export default class Cache {

	protected inMemoryCache: any = {};

	constructor(protected collection: Collection) { }

	async put(uri: string, item: any) {
		this.inMemoryCache[uri] = item;
		return this.collection.updateOne({ uri }, { ...item, uri }, { upsert: true });
	}

	async putMany(items: any[]) {
		if (!!items && items.length > 0)
			return await this.collection.insertMany(items);
	}

	async get(uri: string) {
		if (this.inMemoryCache[uri])
			return this.inMemoryCache[uri];
		else {
			const item = await this.collection.findOne({ uri });

			this.inMemoryCache[uri] = item;

			return item;
		}
	}

}
