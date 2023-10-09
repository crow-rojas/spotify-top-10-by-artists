const CLIENT_ID = "3a1f40eeff64406d8644cbab50ac0205";
const REDIRECT_URI = 'https://crow-rojas.github.io/spotify-top-10-by-artists/';
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user-library-read%20playlist-modify-private&response_type=token`;

let accessToken = null;

document.getElementById('login').addEventListener('click', function() {
    window.location.href = AUTH_URL;
});

document.getElementById('logout').addEventListener('click', function() {
    accessToken = null;
    showLogin();
});

document.getElementById('generate').addEventListener('click', async function() {
    const artists = document.getElementById('artist-list').value.split('\n');
    const playlistName = document.getElementById('playlist-name').value || 'Top 10 Tracks by Artists';

    addFeedback('Generating playlist...');

    // Create playlist
    const playlist = await createPlaylist(playlistName);
    if (!playlist) {
        addFeedback('Failed to create playlist.');
        return;
    }
    addFeedback(`Playlist "${playlistName}" created.`);

    for (let artist of artists) {
        const artistData = await searchForArtist(artist);
        if (!artistData) {
            addFeedback(`Artist "${artist}" not found.`);
            continue;
        }

        const topTracks = await getArtistTopTracks(artistData.id);
        if (topTracks.length === 0) {
            addFeedback(`No tracks found for artist "${artist}".`);
            continue;
        }

        await addTracksToPlaylist(playlist.id, topTracks);
        addFeedback(`Added top tracks of "${artist}" to the playlist.`);
    }

    addFeedback('Playlist generation completed.');

    const openPlaylistButton = document.getElementById('open-playlist');
    openPlaylistButton.href = playlist.external_urls.spotify;
    openPlaylistButton.classList.remove('d-none');
    openPlaylistButton.target = '_blank';
});

function addFeedback(message) {
    const feedbackDiv = document.getElementById('feedback');
    
    // Create a new message div
    const messageDiv = document.createElement('div');
    messageDiv.innerText = message;

    // If there are already 2 messages, remove the oldest one
    while (feedbackDiv.childNodes.length >= 2) {
        feedbackDiv.removeChild(feedbackDiv.lastChild);
    }

    // Insert the new message at the beginning (top) of the feedbackDiv
    feedbackDiv.insertBefore(messageDiv, feedbackDiv.firstChild);
}

function getHeaders() {
    return {
        Authorization: `Bearer ${accessToken}`
    };
}

async function searchForArtist(artistName) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${artistName}&type=artist`, {
        headers: getHeaders()
    });

    const data = await response.json();
    return data.artists.items[0];
}

async function getArtistTopTracks(artistId) {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
        headers: getHeaders()
    });

    const data = await response.json();
    return data.tracks.map(track => track.id);
}

async function createPlaylist(name) {
    const userId = (await getUserProfile()).id;
    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            public: false
        })
    });
    return response.json();
}

async function addTracksToPlaylist(playlistId, trackIds) {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            uris: trackIds.map(id => `spotify:track:${id}`)
        })
    });
    return response.json();
}

async function getUserProfile() {
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: getHeaders()
    });
    return response.json();
}

function showLogin() {
    document.getElementById('login-section').classList.remove('d-none');
    document.getElementById('user-section').classList.add('d-none');
}

function showUser(name) {
    document.getElementById('login-section').classList.add('d-none');
    document.getElementById('user-section').classList.remove('d-none');
    document.getElementById('userinfo').textContent = `Logged in as ${name}`;
}

// On page load, check URL for access token
window.addEventListener('load', async function() {
    const hash = window.location.hash.substr(1);
    const token = new URLSearchParams(hash).get('access_token');

    if (token) {
        accessToken = token;
        const userProfile = await getUserProfile();
        showUser(userProfile.display_name);
    }
});
