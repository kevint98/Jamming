import React from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			searchResults: [],
			playlistName: 'My Playlist',
			playlistTracks: [],
			isLoading: false,
		};
		this.search = this.search.bind(this);
		this.addTrack = this.addTrack.bind(this);
		this.removeTrack = this.removeTrack.bind(this);
		this.updatePlaylistName = this.updatePlaylistName.bind(this);
		this.savePlaylist = this.savePlaylist.bind(this);
	}

	search(term) {
		Spotify.search(term).then(searchResults => {
			this.setState({ searchResults: searchResults });
		});
	}

	addTrack(track) {
		let tracks = this.state.playlistTracks;

		if (tracks.find(savedTrack => savedTrack.id === track.id)) {
			return;
		} else {
			tracks.push(track);
		}

		this.setState({ playlistTracks: tracks });
	}

	removeTrack(track) {
		let tracks = this.state.playlistTracks;

		// tracks.filter((currentTrack, idx) => {
		// 	if (currentTrack.id === track.id) {
		// 		tracks.splice(idx, 1);
		// 	}
		// 	return tracks;
		// });

		// OR

		tracks = tracks.filter(currentTrack => currentTrack.id !== track.id);

		this.setState({ playlistTracks: tracks });
	}

	updatePlaylistName(name) {
		this.setState({ playlistName: name });
	}

	savePlaylist() {
		this.setState({ isLoading: true });

		const trackURIs = this.state.playlistTracks.map(track => track.uri);

		Spotify.savePlaylist(this.state.playlistName, trackURIs).then(() => {
			this.setState({
				playlistName: 'New Playlist',
				playlistTracks: [],
				isLoading: false,
			});
		});
	}

	render() {
		return (
			<div>
				<h1>
					Ja<span className="highlight">mmm</span>ing
				</h1>
				<div className="App">
					<SearchBar onSearch={this.search} />
					<div className="App-playlist">
						<SearchResults
							searchResults={this.state.searchResults}
							onAdd={this.addTrack}
						/>
						{this.state.isLoading ? (
							<Playlist isLoading={true} />
						) : (
							<Playlist
								playlistName={this.state.playlistName}
								playlistTracks={this.state.playlistTracks}
								onRemove={this.removeTrack}
								onNameChange={this.updatePlaylistName}
								onSave={this.savePlaylist}
								isLoading={this.state.isLoading}
							/>
						)}
					</div>
				</div>
			</div>
		);
	}
}

export default App;
