﻿using System.Collections.Generic;
using Alloy.Interfaces;
using Newtonsoft.Json;

namespace Alloy.Models
{
	public class StarredContainer
	{
		[JsonProperty("starred")]
		public Starred Starred { get; set; }
	}

	public class Starred
	{
		[JsonProperty("tracks")]
		public List<Song> Tracks { get; set; }
		[JsonProperty("albums")]
		public List<Album> Albums { get; set; }
		[JsonProperty("artists")]
		public List<Artist> Artists { get; set; }
		[JsonProperty("top_artists")]
		public List<Artist> TopArtists { get; set; }
		[JsonProperty("top_tracks")]
		public List<Song> TopTracks { get; set; }
		[JsonProperty("top_albums")]
		public List<Album> TopAlbums { get; set; }
	}
}