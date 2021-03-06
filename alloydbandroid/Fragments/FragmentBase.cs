﻿using System;
using System.Collections.Generic;
using Alloy.Adapters;
using Android.App;
using Android.Content;
using Android.Hardware;
using Android.Support.V4.View;
using Android.Support.V4.Widget;
using Android.Support.V7.App;
using Android.Views;
using Android.Widget;
using Alloy.Compat;
using Alloy.Helpers;
using Alloy.Models;
using Alloy.Providers;

using Alloy.Services;
using Alloy.Widgets;
using Android.Database;
using Android.OS;
using Android.Provider;
using Android.Views.InputMethods;
using Java.Interop;
using Toolbar = Android.Support.V7.Widget.Toolbar;
using Newtonsoft.Json;
using SearchView = Android.Support.V7.Widget.SearchView;

namespace Alloy.Fragments
{
	public abstract class FragmentBase : Android.Support.V4.App.Fragment, ISensorEventListener, SwipeRefreshLayout.IOnRefreshListener
	{
		public virtual BackgroundAudioServiceConnection ServiceConnection { get; set; }
		public bool HasBack { get; set; }
		private SearchView searchView;
		public static event EventHandler<string> FragmentLoaded;
		public abstract string Name { get; }
		public bool IsServiceConnected { get; private set; }

		public override void OnResume()
		{
			base.OnResume();
			BindService();
			Extensions.StartShake(Activity, this);
		}

		public override void OnPause()
		{
			base.OnPause();
			Removehanders();
			Extensions.ResetShake();
		}

		public override void OnDestroy()
		{
			base.OnDestroy();
			Removehanders();
			Extensions.ResetShake();
		}

		public override void OnDestroyView()
		{
			base.OnDestroyView();
			Removehanders();
			Extensions.ResetShake();
		}

		public override void OnStop()
		{
			base.OnStop();
			Removehanders();
			Extensions.ResetShake();
		}

		public override void OnSaveInstanceState(Bundle outState)
		{
			base.OnSaveInstanceState(outState);
			outState.PutBoolean("serviceStatus", IsServiceConnected);
		}

		public override void OnViewStateRestored(Bundle savedInstanceState)
		{
			base.OnViewStateRestored(savedInstanceState);
			if (savedInstanceState != null)
			{
				IsServiceConnected = savedInstanceState.GetBoolean("serviceStatus", false);
			}
		}

		private void Removehanders()
		{
			BackgroundAudioServiceConnection.PlaybackStatusChanged -= BackgroundAudioServiceConnection_PlaybackStatusChanged;
			MusicProvider.SearchResultsRecieved -= MusicProvider_SearchResultsRecieved;
			MusicProvider.ApiError -= MusicProvider_ApiError;
		}

		private void AddHandlers()
		{
			BackgroundAudioServiceConnection.PlaybackStatusChanged += BackgroundAudioServiceConnection_PlaybackStatusChanged;
			MusicProvider.SearchResultsRecieved += MusicProvider_SearchResultsRecieved;
			MusicProvider.ApiError += MusicProvider_ApiError;
		}

		public override bool OnContextItemSelected(IMenuItem item)
		{
			AdapterView.AdapterContextMenuInfo info = (AdapterView.AdapterContextMenuInfo)item.MenuInfo;
			ContextMenuItemSelected(item, info);
			return base.OnContextItemSelected(item);
		}

		public override void OnCreateContextMenu(IContextMenu menu, View v, IContextMenuContextMenuInfo menuInfo)
		{
			base.OnCreateContextMenu(menu, v, menuInfo);
			ContextMenuCreated(menu, v, menuInfo);

		}

		public void Cleanup()
		{
			Removehanders();
		}

		public void CreateToolbar(View root_view, int title, bool hasBack)
		{
			HasBack = hasBack;
			CreateToolbar(root_view, title);
		}

		public void CreateToolbar(View root_view, int title)
		{
			HasOptionsMenu = true;
			((AppCompatActivity)Activity).SetSupportActionBar(root_view.FindViewById<Toolbar>(Resource.Id.main_toolbar));
			((AppCompatActivity)Activity).SupportActionBar.SetHomeButtonEnabled(true);
			((AppCompatActivity)Activity).SupportActionBar.SetTitle(title);
			SlideDrawable mSlideDrawable = new SlideDrawable(Application.Context.GetDrawable(Resource.Drawable.ic_drawer));
			mSlideDrawable.setIsRtl(false);
			ActionBarHelper mActionBarHelper = new ActionBarHelper((AppCompatActivity)Activity);
			if (HasBack)
				mActionBarHelper.setDisplayShowHomeAsUpEnabled(true);
			else
			{
				mActionBarHelper.setActionBarUpIndicator(mSlideDrawable, title);
				mActionBarHelper.setDisplayShowHomeAsUpEnabled(true);
			}
		}

		private void BindService()
		{
			if (ServiceConnection == null)
			{
				ServiceConnection = new BackgroundAudioServiceConnection();
				BackgroundAudioServiceConnection.ServiceConnected += ServiceConnection_ServiceConnected;
				BackgroundAudioServiceConnection.ServiceDisconnected += ServiceConnectionOnServiceDisconnected;
				Intent serviceToStart = new Intent(Application.Context, typeof(BackgroundAudioService));
				Activity.BindService(serviceToStart, ServiceConnection, Bind.AutoCreate);
			}

			if (ServiceConnection != null && ServiceConnection.IsConnected)
			{
				ServiceConnection_ServiceConnected(null, true);
			}
		}


		public void getCursorFromList(List<Tuple<string, string, string, string, string>> items, MatrixCursor cursor)
		{
			foreach (Tuple<string, string, string, string, string> item in items)
			{
				cursor.NewRow()

					.Add(BaseColumns.Id, item.Item1)
					.Add("type", item.Item2)
					.Add(SearchManager.SuggestColumnText1, item.Item3)
					.Add(SearchManager.SuggestColumnDuration, item.Item4)
					.Add(SearchManager.SuggestColumnIntentData, JsonConvert.SerializeObject(item.Item5));
			}
		}

		private void MusicProvider_SearchResultsRecieved(object sender, SearchResult e)
		{
			if (e == null) return;
			int id = 0;
			string[] columns = { BaseColumns.Id,
				"type",
				SearchManager.SuggestColumnText1,
				SearchManager.SuggestColumnDuration,
				SearchManager.SuggestColumnIntentData,
			};

			MatrixCursor matrix = new MatrixCursor(columns);

			List<Tuple<string, string, string, string, string>> items = new List<Tuple<string, string, string, string, string>>();

			//TODO fix search

			items.Add(new Tuple<string, string, string, string, string>(id++.ToString(), "seperator", "Albums", null, null));
			for (int i = 0; i < e.Artists.Count; i++)
			{
				items.Add(new Tuple<string, string, string, string, string>(id++.ToString(), "artist", e.Artists[i].Name, null, JsonConvert.SerializeObject(e.Artists[i])));
			}

			for (int i = 0; i < e.Albums.Count; i++)
			{
				items.Add(new Tuple<string, string, string, string, string>(id++.ToString(), "album", e.Albums[i].Name, null, JsonConvert.SerializeObject(e.Albums[i])));
			}

			for (int i = 0; i < e.Genres.Count; i++)
			{
				items.Add(new Tuple<string, string, string, string, string>(id++.ToString(), "genre", e.Genres[i].Name, null, JsonConvert.SerializeObject(e.Genres[i])));
			}

			for (int i = 0; i < e.Tracks.Count; i++)
			{
				items.Add(new Tuple<string, string, string, string, string>(id++.ToString(), "track", e.Tracks[i].Title, null, JsonConvert.SerializeObject(e.Tracks[i])));
			}

			getCursorFromList(items, matrix);

			SearchAdapter suggestionAdapter = new SearchAdapter(Context, matrix);
			searchView.SuggestionsAdapter = suggestionAdapter;
		}

		private void MusicProvider_ApiError(object sender, EventArgs e)
		{
			ApiError();
		}

		public override bool OnOptionsItemSelected(IMenuItem item)
		{
			int id = item.ItemId;

			if (id != Android.Resource.Id.Home) return base.OnOptionsItemSelected(item);
			if (HasBack)
			{
				if (FragmentManager.BackStackEntryCount <= 0) return base.OnOptionsItemSelected(item);
				Cleanup();
				FragmentManager.PopBackStack();
			}
			else
			{
				DrawerLayout drawer = Activity.FindViewById<DrawerLayout>(Resource.Id.drawer_layout);
				drawer.OpenDrawer(GravityCompat.Start);
			}

			return base.OnOptionsItemSelected(item);
		}

		public override void OnCreateOptionsMenu(IMenu menu, MenuInflater inflater)
		{

			base.OnCreateOptionsMenu(menu, inflater);
			inflater.Inflate(Resource.Menu.general_toolbar, menu);
			IMenuItem search = menu.FindItem(Resource.Id.action_search);
			searchView = (SearchView)search.ActionView;
			searchView.QueryTextChange += SearchView_QueryTextChange;
			searchView.SuggestionClick += SearchView_SuggestionClick;
		}

		private void SearchView_SuggestionClick(object sender, SearchView.SuggestionClickEventArgs e)
		{
			ICursor item = searchView.SuggestionsAdapter.GetItem(e.Position).JavaCast<ICursor>();
			string type = item.GetString(0);
			string data = item.GetString(4);
			Bundle b = new Bundle();
			if (!string.IsNullOrEmpty(data))
			{
				switch (type)
				{
					case "artist":
						Artist artist = JsonConvert.DeserializeObject<Artist>(data);
						searchView.SetQuery(artist.Name, true);
						b.PutParcelable("artist", artist);
						FragmentManager.ChangeTo(new ArtistDetailFragment(), true, "Artist Details", b);
						break;
					case "album":
						Album album = JsonConvert.DeserializeObject<Album>(data);
						searchView.SetQuery(album.Name, true);
						b.PutParcelable("album", album);
						FragmentManager.ChangeTo(new AlbumDetailFragment(), true, "Album Details", b);
						break;
					case "genre":
						Genre genre = JsonConvert.DeserializeObject<Genre>(data);
						searchView.SetQuery(genre.Name, true);
						b.PutParcelable("genre", genre);
						FragmentManager.ChangeTo(new GenreDetailFragment(), true, "Genre Details", b);
						break;
					case "track":
						Song track = JsonConvert.DeserializeObject<Song>(data);
						searchView.SetQuery(track.Title, true);
						b.PutParcelable("album", track);
						FragmentManager.ChangeTo(new AlbumDetailFragment(), true, "Album Details", b);
						break;
				}
			}
			InputMethodManager imm = (InputMethodManager)Context.GetSystemService(Context.InputMethodService);
			View currentFocus = Activity.CurrentFocus;
			if (currentFocus != null)
			{
				imm.HideSoftInputFromWindow(currentFocus.WindowToken, HideSoftInputFlags.None);
			}
			e.Handled = true;
		}

		private void SearchView_QueryTextChange(object sender, SearchView.QueryTextChangeEventArgs e)
		{
			if (string.IsNullOrEmpty(e.NewText)) return;
			e.Handled = true;
			MusicProvider.Search(e.NewText);
		}

		private void BackgroundAudioServiceConnection_PlaybackStatusChanged(object sender, StatusEventArg e)
		{
			PlaybackStatusChanged(e);
			ScrollToNowPlaying();
		}

		private void ServiceConnection_ServiceConnected(object sender, bool e)
		{
			if (!e) return;
			AddHandlers();
			IsServiceConnected = true;
			ServiceConnected();
			if (ServiceConnection.CurrentSong == null) return;
			ScrollToNowPlaying();
		}


		private void ServiceConnectionOnServiceDisconnected(object sender, bool e)
		{
			Removehanders();
			IsServiceConnected = false;
		}

		public void OnAccuracyChanged(Sensor sensor, SensorStatus accuracy)
		{
			// not being used
		}

		public void OnSensorChanged(SensorEvent e)
		{
			if (e.WasShaken()) Activity.RunOnUiThread(ScrollToNowPlaying);
		}

		public void OnRefresh()
		{
			OnRefreshed();
		}

		public virtual void ScrollToNowPlaying() { }
		public virtual void PlaybackStatusChanged(StatusEventArg args) { }
		public virtual void ServiceConnected() { }
		public virtual void OnRefreshed() { }
		public virtual void ContextMenuCreated(IContextMenu menu, View v, IContextMenuContextMenuInfo menuInfo) { }
		public virtual void ContextMenuItemSelected(IMenuItem item, AdapterView.AdapterContextMenuInfo info) { }
		public virtual void ApiError() { }

		public virtual void Play(List<Song> queue, int position)
		{
			if (!IsServiceConnected)
			{
				BindService();
			}
			else
			{
				Intent broadcastIntent = new Intent(BackgroundAudioService.ActionPlayNew);
				broadcastIntent.PutExtra("playlist", JsonConvert.SerializeObject(queue));
				broadcastIntent.PutExtra("position", position);
				Activity.SendBroadcast(broadcastIntent);
			}
		}

		public virtual void ShowArtist(Artist artist)
		{
			Bundle b = new Bundle();
			b.PutParcelable("artist", artist);
			FragmentManager.ChangeTo(new ArtistDetailFragment(), true, "Artist Details", b);
		}

		public virtual void ShowAlbum(Album album)
		{
			Bundle b = new Bundle();
			b.PutParcelable("album", album);
			FragmentManager.ChangeTo(new AlbumDetailFragment(), true, "Album Details", b);
		}

		public virtual void Loaded()
		{
			FragmentLoaded?.Invoke(null, Name);
		}
	}
}