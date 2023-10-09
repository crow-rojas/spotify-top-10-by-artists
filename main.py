# Python version of the app
import spotipy
from spotipy.oauth2 import SpotifyOAuth

CLIENT_ID = "3a1f40eeff64406d8644cbab50ac0205"
CLIENT_SECRET = "PUT-IN-HERE"
REDIRECT_URI = "http://localhost:8080/callback"

artists_by_stage = {
    "MAIN STAGE": ["Tiësto", "Afrojack", "Porter Robinson", "Steve Aoki", "Morten", 
                   "Sam Feldt", "Francisco Allendes", "B Jones", "Sistek", "Plastik"],
    
    "CREAM": ["Joris Voorn", "Kölsch", "Andrea Oliva", "Eats Everything", "Agents of Time", 
              "Shimza", "Felipe Venegas", "Sepha"],
    
    "FERAL": ["Nicole Moudaber", "Âme", "Ida Engberg", "Onyvaa", "Deniz Bul", 
              "Wask", "5universos B2B Ricardo Molinari", "Lore Manz"],
    
    "ALTERNATIVE": ["Radical Redemption", "D-Block & S-te-Fan", "Da Tweekaz", 
                    "Frontliner", "BTSM", "Ghastly", "Cesqeaux", "Cytrax", "Magnuz", "B-Low"],
    
    "NEO": ["DJ Ram", "Lady Shaka", "Deekapz", "Lizz", "Ironik Girl", 
            "Truffy", "Jagerboy", "Zevlad"],
    
    "BudX": ["Nico Ferrada", "Red Fingers", "Soulfia", "DJ Fisa", "Dapi Habira", 
             "Drunvaloop", "Guz Guz", "Galgo"],
    
    "GRIETA": ["Fiat 600", "Kamila Govorčin", "Rene Roco", "Linx 04 x Puullosz", "Enemigo"],
    
    "CHILL OUT": ["Bele Cox", "Orbeats", "Manu da Banda", "Bruno Borlone", 
                  "La Maria Rockola", "Boogie Mike", "VLNTNA B", "Nooydi"]
}

# If you want a single list of all artists without stages, you can use:
artists = [artist for stage in artists_by_stage.values() for artist in stage]

# Authenticate with Spotify
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                               client_secret=CLIENT_SECRET,
                                               redirect_uri=REDIRECT_URI,
                                               scope="user-library-read playlist-modify-private"))

# Create a new playlist
playlist = sp.user_playlist_create(sp.me()['id'], "Top 10 Tracks", public=False)
playlist_id = playlist['id']

for artist in artists:
    # Search for the artist
    results = sp.search(q=f'artist:{artist}', type='artist')
    
    if not results['artists']['items']:
        print(f"Artist {artist} not found on Spotify.")
        continue

    artist_id = results['artists']['items'][0]['id']

    # Get the top 10 tracks for this artist
    tracks = sp.artist_top_tracks(artist_id)['tracks'][:10]

    track_ids = [track['id'] for track in tracks]

    # Add tracks to the playlist
    sp.playlist_add_items(playlist_id, track_ids)

print(f"Playlist created: {playlist['external_urls']['spotify']}")

