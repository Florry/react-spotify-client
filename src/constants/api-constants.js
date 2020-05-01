export const API_CLIENT_ID = "e3ab4c22331045f0b7f6e57235b58b47";

export const API_SCOPES = [
	"playlist-read-private",
	"playlist-read-collaborative",
	"playlist-modify-public",
	"user-read-recently-played",
	"playlist-modify-private",
	"ugc-image-upload",
	"user-follow-modify",
	"user-follow-read",
	"user-library-read",
	"user-library-modify",
	"user-read-private",
	"user-read-email",
	"user-top-read",
	"user-read-playback-state",
	"streaming",
	"user-read-currently-playing",
	"app-remote-control",
	"user-modify-playback-state"
];

export const API_ROOT_ACCOUNTS = "https://accounts.spotify.com";

export const API_ROOT = "https://api.spotify.com/v1/";

export const API_ROOT_CONNECT = "";

export const PATH_AUTORIZE = "authorize";

export const PATH_PLAY_TRACK = "me/player/play";
export const PATH_PLAY = "me/player/play";
export const PATH_PAUSE = "me/player/pause";

export const PATH_LOGGED_IN_USER_PLAYLISTS = "me/playlists";
export const PATH_GET_PLAYLIST_BY_ID = "playlists/:playlistId";
export const PATH_MULTIPLE_TRACKS = "tracks";
export const PATH_ADD_TRACKS_TO_PLAYLIST = "playlists/:playlistId/tracks";

// TODO:
var generateRandomString = function (length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

var state = generateRandomString(16);

export const API_LOGIN_URI = encodeURI(`${API_ROOT_ACCOUNTS}/${PATH_AUTORIZE}?client_id=${API_CLIENT_ID}&scope=${API_SCOPES.join(" ")}&response_type=code&state=${state}&redirect_uri=http://localhost:3000/spotify-api-calllback`);

export const SERVER_API_ROOT = "http://localhost:8080";
