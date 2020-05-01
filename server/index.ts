
import * as express from "express";
import * as bodyParser from "body-parser";
import * as mongodb from "mongodb";
import * as WebSocket from "ws";
import PlaylistCache from "./cache/PlaylistCache";
import PlaylistsCache from "./cache/PlaylistsCache";
import AuthCache from "./cache/AuthCache";
import SpotifyApiClient from "./network/SpotifyApiClient";
import GetPlaylistHandler from "./handlers/GetPlaylistHandler";
import GetPlaylistForLoggedInUserHandler from "./handlers/GetPlaylistForLoggedInUserHandler";
import getToken from "./middleware/getToken";
import { ServerRequest } from "./interfaces/ServerRequest";
import WebsocketResponse from "./network/WebsockeResponse";
import SaveAccessToken from "./handlers/SaveAccessToken";

const cors = require("cors");
const compression = require("compression");

const startDate = new Date();
const app = express();


app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(getToken);

app.get("/", (request, response) => response.json(`OK since ${startDate.toJSON()}`));

const server = app.listen(8080);

server.on("error", (err) => console.error(err));

server.on("listening", () => {
	console.info("HTTP server listening for on port", 8080);
	registerEndpoints();
});

async function registerEndpoints() {
	const db = await mongodb.connect("mongodb://localhost:27017/spotify-client");
	const playlistCache = new PlaylistCache(db);
	const playlistsCache = new PlaylistsCache(db);
	const authCache = new AuthCache(db);

	const spotifyApiClient = new SpotifyApiClient(playlistCache, playlistsCache, authCache);
	const getPlaylist = new GetPlaylistHandler(playlistCache, spotifyApiClient);
	const getPlaylistForLoggedInUserHandler = new GetPlaylistForLoggedInUserHandler(playlistsCache, spotifyApiClient);
	const saveAccessToken = new SaveAccessToken(authCache, spotifyApiClient);

	app.get("/playlist", (request, response) => getPlaylistForLoggedInUserHandler.handle(request as ServerRequest, response));
	app.get("/playlist/:playlistId", (request, response) => getPlaylist.handle(request as ServerRequest, response));
	app.post("/access-token", (request, response) => saveAccessToken.handle(request as ServerRequest, response));

	ws.get("/playlist", (request, response) => getPlaylistForLoggedInUserHandler.handle(request as ServerRequest, response));
	ws.get("/playlist/:playlistId", (request, response) => getPlaylist.handle(request as ServerRequest, response));
	ws.post("/access-token", (request, response) => saveAccessToken.handle(request as ServerRequest, response));
}

// TODO: Move to its own file
const wsS = new WebSocket.Server({ server });

wsS.on("connection", (ws: WebSocket) => {
	ws.on("message", (message: string) => {
		const messageObject = JSON.parse(message);

		// TODO: fix better!
		const path = messageObject.path.replace("http://localhost:8080", "");

		const url = matchUrl(path, Object.keys(wsEndpoints[messageObject.method.toLowerCase()]));

		const urlSplits = url[0].split("/");
		const pathSplits = path.split("/");

		const params = {};

		urlSplits.forEach((split, i) => {
			if (split.includes(":"))
				params[split.replace(":", "")] = pathSplits[i];
		});

		wsEndpoints[messageObject.method.toLowerCase()][url[0]]({ ...messageObject, params, accessToken: messageObject.headers.accessToken }, new WebsocketResponse(ws, messageObject.replyTo));
	});
});


const wsEndpoints = {
	get: {},
	post: {}
};

const ws = {
	get: (uri, handler) => {
		wsEndpoints.get[uri] = handler;
	},
	post: (uri, handler) => {
		wsEndpoints.post[uri] = handler;
	}
};

function matchUrl(url: string, endpoints: any[] = []) {
	if (endpoints.filter(endpoint => endpoint === url).length === 1)
		return [url];

	const matchedUrl = endpoints
		.filter(endpoint => {
			const urlSpits = url.split("/");
			const endpointSplits = endpoint.split("/");

			return urlSpits.length === endpointSplits.length;
		})
		.filter(endpoint => {
			const urlSplit = url.substring(1).split("/");
			const urlPatternSplit = endpoint.substring(1).split("/");
			const mostDetailedSplit = urlSplit.length >= urlPatternSplit.length ? urlSplit : urlPatternSplit;

			let foundMatch = false;

			for (let i = 0; i < mostDetailedSplit.length; i++) {
				foundMatch = urlSplit[i] === urlPatternSplit[i] || (urlPatternSplit[i].includes(":"));

				if (!!foundMatch)
					return foundMatch;
			}

			return false;
		});

	return matchedUrl;
}
