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
	"user-read-playback-state"
];

export const API_ROOT_ACCOUNTS = "https://accounts.spotify.com";

export const API_ROOT = "https://api.spotify.com/v1/";

export const API_ROOT_CONNECT = "";

export const PATH_AUTORIZE = "authorize";

export const PATH_LOGGED_IN_USER_PLAYLISTS = "me/playlists";
export const PATH_GET_PLAYLIST_BY_ID = "playlists/:playlistId";
export const PATH_MULTIPLE_TRACKS = "tracks";

export const API_LOGIN_URI = encodeURI(`${API_ROOT_ACCOUNTS}/${PATH_AUTORIZE}?client_id=${API_CLIENT_ID}&scope=${API_SCOPES.join(" ")}&response_type=token&redirect_uri=http://localhost:3000/spotify-api-calllback`);
