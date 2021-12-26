const clientID = '**HIDDEN FOR SECURITY**';
const redirectURI = 'http://localhost:3000/';
let accessToken;

const Spotify = {
	getAccessToken() {
		let tokenRe = /access_token=([^&]*)/;
		let expireRe = /expires_in=([^&]*)/;
		if (accessToken) {
			return accessToken;
		}

		// check for access token match
		const accessTokenMatch = window.location.href.match(tokenRe);
		const expiresInMatch = window.location.href.match(expireRe);

		if (accessTokenMatch && expiresInMatch) {
			accessToken = accessTokenMatch[1];
			let expiresIn = Number(expiresInMatch[1]);
			// This clears the parameters, allowing us to grab a new access token when it expires
			window.setTimeout(() => (accessToken = ''), expiresIn * 1000);
			window.history.pushState('Access Token', null, '/');
			return accessToken;
		} else {
			const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;

			window.location = accessUrl;
		}
	},

	async search(term) {
		const accessToken = Spotify.getAccessToken();

		const response = await fetch(
			`https://api.spotify.com/v1/search?type=track&q=${term}`,
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			}
		);

		const jsonResponse = await response.json();

		if (!jsonResponse.tracks) {
			return [];
		}

		return jsonResponse.tracks.items.map(track => ({
			id: track.id,
			name: track.name,
			artist: track.artists[0].name,
			album: track.album.name,
			uri: track.uri,
		}));
	},

	async savePlaylist(name, trackURIs) {
		if (!name || !trackURIs.length) return;

		const accessToken = Spotify.getAccessToken();
		const headers = { Authorization: `Bearer ${accessToken}` };
		let userID;

		const idResponse = await fetch('https://api.spotify.com/v1/me', {
			headers: headers,
		});

		const jsonResponse = await idResponse.json();

		userID = jsonResponse.id;

		const playlistResponse = await fetch(
			`https://api.spotify.com/v1/users/${userID}/playlists`,
			{
				headers: headers,
				method: 'POST',
				body: JSON.stringify({ name: name }),
			}
		);

		const jsonPlaylistResponse = await playlistResponse.json();

		const playlistID = jsonPlaylistResponse.id;

		return fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
			headers: headers,
			method: 'POST',
			body: JSON.stringify({ uris: trackURIs }),
		});
	},
};

export default Spotify;
