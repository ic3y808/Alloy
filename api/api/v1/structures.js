

/**
 * @typedef MediaPath
 * @property {string} path
 * @property {string} displayName
 */
module.exports.MediaPath = class MediaPath {

  constructor(path, displayName) {
    this.path = path;
    this.displayName = displayName;
  }
}

/**
 * @typedef Ping
 * @property {string} status
 */
module.exports.Ping = class Ping {

  constructor(status) {
    this.status = status;
  }
}

/**
 * @typedef License
 * @property {string} licenseType
 */
module.exports.License = class License {

  constructor(license) {
    this.license = license;
  }

  licenseType() {
    if (this.license == "test")
      return "Test License";
    else return "Unknown License";
  }

}

/**
 * @typedef MusicFolder
 * @property {integer} id
 * @property {string} name
 */
module.exports.MusicFolder = class MusicFolder {

  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

/**
 * @typedef StatusResult
 * @property {string} result
 */
module.exports.StatusResult = class StatusResult {

  constructor(result) {
    this.result = result;
  }
}

/**
 * @typedef Directory 
 * @property {integer} id
 * @property {string} parent
 * @property {string} name
 * @property {string} path
 * @property {string} starred
 * @property {string} artist
 * @property {string} title
 * @property {string} coverArt
 */
module.exports.Directory = class Directory {
  constructor(id, parent, name, path, starred, artist, title, coverArt) {
    this.id = id;
    this.parent = parent;
    this.name = name;
    this.path = path;
    this.starred = starred;
    this.artist = artist;
    this.title = title;
    this.coverArt = coverArt;
  }
}

/**
 * @typedef Genre 
 * @property {integer} id
 * @property {string} songCount
 * @property {string} albumCount
 * @property {string} name
 */
module.exports.Genre = class Genre {
  constructor(id, songCount, albumCount, name) {
    this.id = id;
    this.songCount = songCount;
    this.albumCount = albumCount;
    this.name = name;
  }
}

/**
 * @typedef Album 
 * @property {integer} id
 * @property {string} name
 * @property {string} artist
 * @property {string} artistId
 * @property {string} coverArt
 * @property {integer} songCount
 * @property {integer} duration
 * @property {string} created
 */
module.exports.Album = class Album {
  constructor(id, name, artist, artistId, coverArt, songCount, duration, created) {
    this.id = id;
    this.name = name;
    this.artist = artist;
    this.artistId = artistId;
    this.coverArt = coverArt;
    this.songCount = songCount;
    this.duration = duration;
    this.created = created;
  }
}

/**
 * @typedef Artist 
 * @property {integer} id
 * @property {string} name
 * @property {string} coverArt
 * @property {integer} albumCount
 * @property {integer} songCount
 */
module.exports.Artist = class Artist {
  constructor(id, name, coverArt, albumCount, songCount) {
    this.id = id;
    this.name = name;
    this.coverArt = coverArt;
    this.albumCount = albumCount;
    this.songCount = songCount;
  }
}

/**
 * @typedef Song 
 * @property {string} id
 * @property {string} path
 * @property {string} base_path
 * @property {string} base_id
 * @property {string} title
 * @property {string} artist
 * @property {string} artist_id
 * @property {string} album
 * @property {string} album_id
 * @property {string} album_path
 * @property {string} genre
 * @property {string} genre_id
 * @property {string} cover_art
 * @property {string} starred
 * @property {string} rating
 * @property {string} bpm
 * @property {integer} year
 * @property {integer} play_count 
 * @property {string} size
 * @property {string} content_type
 * @property {string} created
 * @property {string} last_modified
 * @property {string} duration
 * @property {string} bitRate
 * @property {string} suffix
 * @property {integer} no
 * @property {integer} of
 * @property {string} musicbrainz_trackid
 * @property {string} musicbrainz_albumid
 * @property {string} musicbrainz_artistid
 * @property {string} musicbrainz_albumartistid
 * @property {string} musicbrainz_releasegroupid
 * @property {string} musicbrainz_workid
 * @property {string} musicbrainz_trmid
 * @property {string} musicbrainz_discid
 * @property {string} acoustid_id
 * @property {string} acoustid_fingerprint
 * @property {string} musicip_puid
 * @property {string} musicip_fingerprint
 */
module.exports.Song = class Song {
  constructor() {
    this.id = '';
    this.path = '';
    this.base_path = '';
    this.base_id = '';
    this.title = '';
    this.artist = '';
    this.artist_id = '';
    this.album = '';
    this.album_id = '';
    this.album_path = '';
    this.genre = '';
    this.genre_id = '';
    this.cover_art = '';
    this.starred = 'false';
    this.rating = '';
    this.bpm = '';
    this.year = 0;
    this.play_count = 0;
    this.size = 0;
    this.content_type = '';
    this.created = 0;
    this.last_modified = 0;
    this.duration = 0;
    this.bitRate = '';
    this.suffix = '';
    this.no = 0;
    this.of = 0;
    this.musicbrainz_trackid = null;
    this.musicbrainz_albumid = null;
    this.musicbrainz_artistid = null;
    this.musicbrainz_albumartistid = null;
    this.musicbrainz_releasegroupid = null;
    this.musicbrainz_workid = null;
    this.musicbrainz_trmid = null;
    this.musicbrainz_discid = null;
    this.acoustid_id = null;
    this.acoustid_fingerprint = null;
    this.musicip_puid = null;
    this.musicip_fingerprint = null;
  }
};

/**
 * @typedef Playlist  
 * @property {integer} id
 * @property {string} name
 * @property {string} comment
 * @property {integer} songCount
 * @property {integer} duration
 * @property {string} coverArt
 */
module.exports.Playlist = class Playlist {
  constructor(id, name, comment, songCount, duration, coverArt) {
    this.id = id;
    this.name = name;
    this.comment = comment;
    this.songCount = songCount;
    this.duration = duration;
    this.coverArt = coverArt;
  }
}


/**
 * @typedef SimilarArtist 
 * @property {integer} id
 * @property {string} name
 */
module.exports.SimilarArtist = class SimilarArtist {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}


/**
 * @typedef ArtistInfo 
 * @property {integer} biography
 * @property {string} musicBrainzId
 * @property {integer} lastFmUrl
 * @property {string} smallImageUrl
 * @property {string} mediumImageUrl
 * @property {integer} largeImageUrl
 * @property {Array.<SimilarArtist>} similarArtists
 */
module.exports.ArtistInfo = class ArtistInfo {
  constructor(biography, musicBrainzId, lastFmUrl, smallImageUrl, mediumImageUrl, largeImageUrl, similarArtists) {
    this.biography = biography;
    this.musicBrainzId = musicBrainzId;
    this.lastFmUrl = lastFmUrl;
    this.smallImageUrl = smallImageUrl;
    this.mediumImageUrl = mediumImageUrl;
    this.largeImageUrl = largeImageUrl;
    this.similarArtists = similarArtists;
  }
}

/**
 * @typedef StarredMedia 
 * @property {Array.<Artist>} artists
 * @property {Array.<Album>} albums
 * @property {Array.<Song>} songs
 */
module.exports.StarredMedia = class StarredMedia {
  constructor(artists, albums, songs) {
    this.artists = artists;
    this.albums = albums;
    this.songs = songs;
  }
}

/**
 * @typedef SearchResults 
 * @property {Array.<Artist>} artists
 * @property {Array.<Album>} albums
 * @property {Array.<Song>} songs
 */
module.exports.SearchResults = class SearchResults {
  constructor(artists, albums, songs) {
    this.artists = artists;
    this.albums = albums;
    this.songs = songs;
  }
}

/**
 * @typedef Share 
 * @property {integer} id
 * @property {string} url
 * @property {string} description
 * @property {integer} created
 * @property {integer} lastVisited
 * @property {string} expires
 * @property {string} visitCount
 */
module.exports.Share = class Share {
  constructor(id, url, description, created, lastVisited, expires, visitCount) {
    this.id = id;
    this.url = url;
    this.description = description;
    this.created = created;
    this.lastVisited = lastVisited;
    this.expires = expires;
    this.visitCount = visitCount;
  }
}

/**
 * @typedef LibraryStats 
 * @property {integer} track_count
 * @property {integer} artist_count
 * @property {integer} album_count
 * @property {integer} genre_count
 * @property {integer} folder_count
 * @property {integer} memory_used

 */
module.exports.LibraryStats = class LibraryStats {
  constructor() {
    this.track_count = 0;
    this.artist_count = 0;
    this.album_count = 0;
    this.album_count = 0;
    this.folder_count = 0;
    this.memory_used = 0;
  }
}