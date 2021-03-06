﻿using System;
using System.Globalization;
using Alloy.Converters;
using Android.Graphics;
using Android.OS;
using Java.Interop;
using Newtonsoft.Json;
using Object = Java.Lang.Object;

namespace Alloy.Models
{
	public class Song : Object, IParcelable
	{
		[JsonProperty("id")]
		public string Id { get; set; }
		[JsonProperty("path")]
		public string Path { get; set; }
		[JsonProperty("title")]
		public string Title { get; set; }
		[JsonIgnore]
		public Bitmap Art { get; set; }
		[JsonProperty("artist")]
		public string Artist { get; set; }
		[JsonProperty("artist_id")]
		public string ArtistId { get; set; }
		[JsonProperty("album")]
		public string Album { get; set; }
		[JsonProperty("album_id")]
		public string AlbumId { get; set; }
		[JsonProperty("album_path")]
		public string AlbumPath { get; set; }
		[JsonProperty("genre")]
		public string Genre { get; set; }
		[JsonProperty("genre_id")]
		public string GenreId { get; set; }
		[JsonProperty("tags")]
		public string Tags { get; set; }
		[JsonProperty("cover_art")]
		public string CoverArt { get; set; }
		[JsonProperty("starred"), JsonConverter(typeof(StringToBooleanConverter))]
		public bool Starred { get; set; }
		[JsonProperty("starred_date"), JsonConverter(typeof(MinDateTimeConverter))]
		public DateTime StarredDate { get; set; }
		[JsonProperty("rating"), JsonConverter(typeof(NullIntConverter))]
		public int Rating { get; set; }
		[JsonProperty("bpm")]
		public string Bpm { get; set; }
		[JsonProperty("year"), JsonConverter(typeof(NullIntConverter))]
		public int Year { get; set; }
		[JsonProperty("play_count"), JsonConverter(typeof(NullIntConverter))]
		public int PlayCount { get; set; }
		[JsonProperty("size"), JsonConverter(typeof(NullIntConverter))]
		public int Size { get; set; }
		[JsonProperty("content_type")]
		public string ContentType { get; set; }
		[JsonProperty("created"), JsonConverter(typeof(MinDateTimeConverter))]
		public DateTime Created { get; set; }
		[JsonProperty("last_modified"), JsonConverter(typeof(MinDateTimeConverter))]
		public DateTime LastModified { get; set; }
		[JsonProperty("duration"), JsonConverter(typeof(NullIntConverter))]
		public int Duration { get; set; }
		[JsonProperty("bitrate")]
		public string Bitrate { get; set; }
		[JsonProperty("suffix")]
		public string Suffix { get; set; }
		[JsonProperty("no")]
		public string No { get; set; }
		[JsonProperty("of")]
		public string Of { get; set; }
		[JsonIgnore]
		public bool IsSelected { get; set; }
		[JsonIgnore]
		public bool IsPrepared { get; set; }

		public override string ToString()
		{
			return $"Song: Title:{Title} Artist{Artist} Path {Path}";
		}

		[ExportField("CREATOR")] // Need a reference to Mono.Android.Export
		public static SongCreator InitializeCreator()
		{
			return new SongCreator();
		}

		public void WriteToParcel(Parcel dest, ParcelableWriteFlags flags)
		{
			dest.WriteString(Id);
			dest.WriteString(Path);
			dest.WriteString(Title);
			dest.WriteString(Artist);
			dest.WriteString(ArtistId);
			dest.WriteString(Album);
			dest.WriteString(AlbumId);
			dest.WriteString(AlbumPath);
			dest.WriteString(Genre);
			dest.WriteString(GenreId);
			dest.WriteString(Tags);
			dest.WriteString(CoverArt);
			dest.WriteString(Starred.ToString());
			dest.WriteString(StarredDate.ToString(CultureInfo.InvariantCulture));
			dest.WriteInt(Rating);
			dest.WriteString(Bpm);
			dest.WriteInt(Year);
			dest.WriteInt(PlayCount);
			dest.WriteInt(Size);
			dest.WriteString(ContentType);
			dest.WriteString(Created.ToString(CultureInfo.InvariantCulture));
			dest.WriteString(LastModified.ToString(CultureInfo.InvariantCulture));
			dest.WriteInt(Duration);
			dest.WriteString(Bitrate);
			dest.WriteString(Suffix);
			dest.WriteString(No);
			dest.WriteString(Of);
			dest.WriteString(IsSelected.ToString());

		}

		public int DescribeContents()
		{
			return 0;
		}
	}

	public class SongCreator : Object, IParcelableCreator
	{
		public Object CreateFromParcel(Parcel source)
		{
			Song artist = new Song
			{
				Id = source.ReadString(),
				Path = source.ReadString(),
				Title = source.ReadString(),
				Artist = source.ReadString(),
				ArtistId = source.ReadString(),
				Album = source.ReadString(),
				AlbumId = source.ReadString(),
				AlbumPath = source.ReadString(),
				Genre = source.ReadString(),
				GenreId = source.ReadString(),
				Tags = source.ReadString(),
				CoverArt = source.ReadString(),
				Starred = bool.Parse(source.ReadString()),
				StarredDate = DateTime.Parse(source.ReadString()),
				Rating = source.ReadInt(),
				Bpm = source.ReadString(),
				Year = source.ReadInt(),
				PlayCount = source.ReadInt(),
				Size = source.ReadInt(),
				ContentType = source.ReadString(),
				Created = DateTime.Parse(source.ReadString()),
				LastModified = DateTime.Parse(source.ReadString()),
				Duration = source.ReadInt(),
				Bitrate = source.ReadString(),
				Suffix = source.ReadString(),
				No = source.ReadString(),
				Of = source.ReadString(),
				IsSelected = bool.Parse(source.ReadString()),
			};
			return artist;
		}

		public Object[] NewArray(int size)
		{
			return new Object[size];
		}
	}
}