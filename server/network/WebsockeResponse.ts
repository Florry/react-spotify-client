import * as WebSocket from "ws";

export default class WebsocketResponse {

	constructor(private ws: WebSocket, private replyTo: string) {
		console.log("replyTo", replyTo);
	}

	json(obj) {
		this.ws.send(JSON.stringify({
			data: obj,
			replyTo: this.replyTo
		}));
	}

}
