import AppUtilities from "./appUtilities.service";
import '../API/cast.framework';
import '../API/cast.v1';
var isCastAvailable = false;
window.__onGCastApiAvailable = function (isAvailable) {
  isCastAvailable = isAvailable;
};

export default class MediaPlayer {
  constructor(MediaElement, AppUtilities, Backend, SubsonicService) {
    "ngInject";
    this.MediaElement = MediaElement;
    this.AppUtilities = AppUtilities;
    this.Backend = Backend;
    this.SubsonicService = SubsonicService;
    this.Backend.debug('init media player');
    this.activeSong = "";
    this.playing = false;
    this.currentVolume = this.MediaElement.volume;
    this.selectedIndex = 0;
    this.repeatEnabled = false;
    this.tracks = [];
    var that = this;
    this.MediaElement.addEventListener('play', function () {
      that.playing = true;
      that.togglePlayPause();
    });

    this.MediaElement.addEventListener('pause', function () {
      that.playing = false;
      that.togglePlayPause();
    });

    this.MediaElement.addEventListener('ended', function () {
      if ((that.selectedIndex + 1) === that.tracks.length) {
        that.playing = false;
        that.selectedIndex = 0;
        that.togglePlayPause();
        $('#media-player').src = that.selectedTrack();
        $('#subProgress').attr('aria-valuenow', 0).css('width', "0%");
        $('#mainProgress').attr('aria-valuenow', 0).css('width', "0%");
        $('#mainTimeDisplay').html("");
        that.Backend.debug('Playlist ended');
        that.AppUtilities.broadcast('playlistEndEvent');

      } else {
        that.playing = true;
        that.next();
      }
    });

    this.MediaElement.addEventListener('canplaythrough', function () {
      $('#mainTimeDisplay').html("0:00 / " + that.AppUtilities.formatTime(MediaElement.duration));
      $('#subProgress').attr('aria-valuenow', 0).css('width', "0%");
      $('#mainProgress').attr('aria-valuenow', 0).css('width', "0%");
      that.togglePlayPause();
    });

    this.MediaElement.addEventListener('timeupdate', function () {
      var duration = MediaElement.duration;
      if (!isFinite(duration))
        duration = that.selectedTrack().duration;

      var playPercent = 100 * (MediaElement.currentTime / duration);
      if (!isNaN(playPercent)) {
        var buffered = MediaElement.buffered;
        var loaded;


        if (buffered.length) {
          loaded = 100 * buffered.end(0) / duration;
        }


        $('#subProgress').attr('aria-valuenow', loaded).css('width', loaded + "%");
        $('#mainProgress').attr('aria-valuenow', playPercent).css('width', playPercent + "%");
        $('#mainTimeDisplay').html(that.AppUtilities.formatTime(MediaElement.currentTime) + " / " + that.AppUtilities.formatTime(duration));
      }
    });
  }

  castStatus() {
    return isCastAvailable;
  }

  initializeCast() {
    if (isCastAvailable) {
      var options = {};
      options.receiverApplicationId = 'DAB06F7C';
      options.autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;
      cast.framework.CastContext.getInstance().setOptions(options);
      this.remotePlayer = new cast.framework.RemotePlayer();
      this.remotePlayerController = new cast.framework.RemotePlayerController(this.remotePlayer);
      var that = this;
      this.remotePlayerController.addEventListener(
        cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
        function () {
          that.Backend.debug('switchPlayer');
          if (cast && cast.framework) {
            if (that.remotePlayerConnected()) {

              that.setupRemotePlayer();
              return;
            }
          }
          that.setupLocalPlayer();
        }
      );

      this.castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    }
  }

  castSession() {
    return this.getCurrentSession();
    //return cast.framework.CastContext.getInstance().getCurrentSession();
  }

  trackCount() {
    return this.tracks.length;
  }

  showTrackCount() {
    return this.tracks.length > 0;
  }

  selectedTrack() {
    return this.tracks[this.selectedIndex];
  }

  remotePlayerConnected() {
    if (!this.remotePlayer) return false;
    return this.remotePlayer.isConnected;
  }

  checkNowPlayingImage(source) {
    if (source.artistId) {
      this.SubsonicService.subsonic.getArtistInfo2(source.artistId, 50).then(function (result) {
        $('#nowPlayingImageHolder').attr('src', result.smallImageUrl);
      });
    }
  }

  generateRemoteMetadata(source) {
    var that = this;
    return new Promise(function (resolve, reject) {
      if (!source) {
        throw new Error('source required');
      }
      if (!source.artistId) {
        throw new Error('no artist id');
      }
      that.SubsonicService.subsonic.getArtistInfo2(source.artistId, 50).then(function (result) {
        var mediaInfo = new chrome.cast.media.MediaInfo(source.url, 'audio/mp3' /*source.transcodedContentType*/);
        mediaInfo.metadata = new chrome.cast.media.MusicTrackMediaMetadata();
        //mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
        //mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.MOVIE;
        //mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.TV_SHOW;
        //mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.PHOTO;
        mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.MUSIC_TRACK;
        mediaInfo.metadata.customData = JSON.stringify(source);
        mediaInfo.metadata.albumArtist = source.albumArtist;
        mediaInfo.metadata.albumName = source.album;
        mediaInfo.metadata.artist = source.artist;
        mediaInfo.metadata.artistName = source.artist;
        mediaInfo.metadata.composer = source.artist;
        mediaInfo.metadata.discNumber = source.track;
        mediaInfo.metadata.songName = source.title;
        mediaInfo.metadata.title = source.title;
        mediaInfo.metadata.images = [{
          'url': result.largeImageUrl.replace('300x300', '1280x400')
        }];
        resolve(mediaInfo);
      });
    });
  }

  togglePlayPause() {
    var playing = false;
    if (this.remotePlayerConnected()) {
      playing = this.remotePlayer.playerState === 'PLAYING';
    } else {
      playing = this.playing;
    }

    if (playing) {
      $("#playPauseIcon").addClass("fa-pause");
      $("#playPauseIcon").removeClass("fa-play");
    } else {
      $("#playPauseIcon").addClass("fa-play");
      $("#playPauseIcon").removeClass("fa-pause");
    }
  }

  loadTrack(index, that) {
    var t = this;
    if (that) {
      t = that;
    }
    t.selectedIndex = index;
    t.Backend.debug('load track');
    $('#mainTimeDisplay').html("Loading...");

    var source = t.selectedTrack();
    t.Backend.debug(source.artist + " - " + source.title);
    source.artistUrl = "/artist/" + source.artistId;
    source.albumUrl = "/album/" + source.albumId;
    if (source && source.id) {
      source.url = t.SubsonicService.subsonic.streamUrl(source.id, 320);

      t.checkVolume();

      //if (source.artistId) {
      t.checkStarred(source);
      t.checkArtistInfo(source);
      t.checkNowPlayingImage(source);

      if (t.remotePlayerConnected()) {
        t.setupRemotePlayer();
        t.generateRemoteMetadata(source).then(function (mediaInfo) {
          var request = new chrome.cast.media.LoadRequest(mediaInfo);
          cast.framework.CastContext.getInstance().getCurrentSession().loadMedia(request);
          t.SubsonicService.subsonic.scrobble(source.id).then(function (scrobbleResult) {
            if (scrobbleResult) t.Backend.info('scrobble success: ' + scrobbleResult.status + " : " + source.artist + " - " + source.title);
          });
          t.togglePlayPause();
          t.startProgressTimer();
        });
      } else {

        t.MediaElement.src = source.url;
        t.MediaElement.load();
        if (t.shouldSeek) {
          t.shouldSeek = false;
          t.MediaElement.currentTime = t.prePlannedSeek;
        }
        var playPromise = t.MediaElement.play();
        var that2 = t;
        if (playPromise !== undefined) {
          playPromise.then(_ => {
            that2.SubsonicService.subsonic.scrobble(source.id).then(function (scrobbleResult) {
              if (scrobbleResult) that2.Backend.info('scrobble success: ' + scrobbleResult.status + " : " + source.artist + " - " + source.title);
            });
            that2.togglePlayPause();
            that2.AppUtilities.broadcast('trackChangedEvent', source);
          }).catch(error => {
            that2.Backend.error('playing failed ' + error);
            that2.next();
          });
        } else {
          t.next();
        }
      }
      //} else {
      //  t.next();
      //}
    } else {
      t.next();
    }
  }

  play() {
    if (this.remotePlayerConnected()) {
      if (this.remotePlayer.isPaused) {
        this.remotePlayerController.playOrPause();
      }

    } else {
      var playPromise = this.MediaElement.play();

      if (playPromise !== undefined) {
        playPromise.then(_ => {
          this.Backend.debug('success playing');
        }).catch(error => {
          this.Backend.error('playing failed ' + error);
        });
      }
    }
  }

  pause() {
    if (this.remotePlayerConnected()) {
      if (!this.remotePlayer.isPaused) {
        this.remotePlayerController.playOrPause();
      }
    } else {
      this.MediaElement.pause();
    }
  }

  stop() {
    this.MediaElement.stop();
  }

  previous() {
    this.selectedIndex--;
    this.selectedIndex = (this.selectedIndex < 0 ? this.tracks.length - 1 : this.selectedIndex);
    this.loadTrack(this.selectedIndex);
  }
  next() {
    if (!this.repeatEnabled) this.selectedIndex++;
    this.selectedIndex = (this.selectedIndex >= this.tracks.length ? 0 : this.selectedIndex);
    this.loadTrack(this.selectedIndex);
  }



  checkVolume() {
    $('#volumeSlider').val(this.currentVolume * 100);
  }

  checkStarred(source) {
    if (source.starred) {
      $("#likeButtonIcon").removeClass('fa-heart-o');
      $("#likeButtonIcon").addClass('fa-heart');
    } else {
      $("#likeButtonIcon").removeClass('fa-heart');
      $("#likeButtonIcon").addClass('fa-heart-o');
    }
  }

  checkArtistInfo(source) {
    $('#artistInfo').html(source.artist);
    $('#artistInfo').attr("href", source.artistUrl);
    $('#trackTitle').html(source.title);
    $('#trackTitle').attr("href", "/playing");
    $('#trackAlbum').html(source.album);
    $('#trackAlbum').attr("href", source.albumUrl);
  }

  startProgressTimer() {
    this.stopProgressTimer();
    var that = this;
    this.timer = setInterval(function () {
      if (that.remotePlayerConnected()) {
        var currentMediaTime = that.remotePlayer.currentTime;
        var currentMediaDuration = that.remotePlayer.duration;
        var playPercent = 100 * (currentMediaTime / currentMediaDuration);
        if (!isNaN(playPercent)) {
          $('#subProgress').attr('aria-valuenow', "100").css('width', "100%");
          $('#mainProgress').attr('aria-valuenow', playPercent).css('width', playPercent + "%");
          $('#mainTimeDisplay').html(that.AppUtilities.formatTime(currentMediaTime) + " / " + that.AppUtilities.formatTime(currentMediaDuration));
        }
      }
    }, 250);
  }

  stopProgressTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }



  setupRemotePlayer() {

    if (!this.remoteConfigured) {
      var that = this;
      this.remotePlayerController.addEventListener(
        cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED,
        function () {
          that.togglePlayPause(that.remotePlayer.isPaused);
        }
      );

      that.remotePlayerController.addEventListener(
        cast.framework.RemotePlayerEventType.IS_MUTED_CHANGED,
        function () {
          that.isMuted = that.remotePlayer.isMuted;
          if (that.isMuted) {
            vol = 0;
            $('#volumeSlider').val(vol);
          } else {
            vol = that.remotePlayer.volumeLevel;
            $('#volumeSlider').val(vol * 100);
          }
        }
      );

      this.remotePlayerController.addEventListener(
        cast.framework.RemotePlayerEventType.VOLUME_LEVEL_CHANGED,
        function () {
          $('#volumeSlider').val(that.remotePlayer.volumeLevel * 100);
        }
      );

      this.remotePlayerController.addEventListener(
        cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED,
        function () {
          that.Backend.debug('media info change');
          that.Backend.debug(that.remotePlayer.mediaInfo);
          if (that.remotePlayer && that.remotePlayer.mediaInfo && that.remotePlayer.mediaInfo.metadata) {
            var customData = that.remotePlayer.mediaInfo.metadata.customData;
            if (customData) {
              if (that.tracks.length > 0) {

              } else {
                that.tracks[0] = JSON.parse(customData);
                that.selectedIndex = 0;
              }
            }
          }
        }
      );

      this.remotePlayerController.addEventListener(
        cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED,
        function () {
          that.Backend.debug('state change ');
          that.Backend.debug(that.remotePlayer.playerState);

          if (that.remotePlayer.playerState === null) {
            if (that.remotePlayer.savedPlayerState) {
              that.shouldSeek = true;
              that.prePlannedSeek = that.remotePlayer.savedPlayerState.currentTime;
              that.loadTrack(that.selectedIndex, that);
              that.Backend.debug('saved state');
            } else {
              that.next();
            }
          }
          if (that.remotePlayer.playerState === 'BUFFERING') {
            $('#mainTimeDisplay').html("Buffering...");
          }
          if (that.remotePlayer.playerState === 'PLAYING' && that.shouldSeek) {
            that.shouldSeek = false;
            that.remotePlayer.currentTime = that.prePlannedSeek;
            that.remotePlayerController.seek();
            that.AppUtilities.broadcast('trackChangedEvent', that.selectedTrack());
          }


          if (that.MediaElement.playing) {
            that.shouldSeek = true;
            that.prePlannedSeek = that.MediaElement.currentTime;
            that.MediaElement.pause();
            that.loadTrack(that.selectedIndex);
          }
          that.isMuted = that.remotePlayer.isMuted;
          if (that.isMuted) {
            $('#volumeSlider').val(0);
          } else {
            $('#volumeSlider').val(that.remotePlayer.volumeLevel * 100);
          }

          that.togglePlayPause();
          // TODO fix resume support
          if (that.remotePlayer.mediaInfo && that.remotePlayer.mediaInfo.metadata) {
            //id = this.remotePlayer.mediaInfo.contentId;

            //id = id.split("&")[6];
            //id = id.substring(3,id.length - 1);

            //this.SubsonicService.subsonic.getSong2(id).then(function (result) {
            //    this.Backend.debug("getArtistDetails result")
            //    this.Backend.debug(result)

            //    if (result) {

            //       

            //        $('#artistInfo').html(source.artist);
            //        $('#artistInfo').attr("href", source.artistUrl);
            //        $('#trackInfo').html(source.title);
            //        $('#trackInfo').attr("href", source.albumUrl);

            //        if (source.starred) {
            //            $("#likeButtonIcon").removeClass('heart-o');
            //            $("#likeButtonIcon").addClass('heart');
            //        } else {
            //            $("#likeButtonIcon").removeClass('heart');
            //            $("#likeButtonIcon").addClass('heart-o');
            //        }

            //        this.togglePlayPause();




            //        $('#nowPlayingImageHolder').attr('src', result.smallImageUrl);
            //    }
            //});
          }
        }
      );
      this.startProgressTimer();
      this.remoteConfigured = true;
    }
    if (this.remotePlayerConnected()) {
      if (this.MediaElement.playing) {
        this.shouldSeek = true;
        this.prePlannedSeek = this.MediaElement.currentTime;
        this.MediaElement.pause();
        this.loadTrack(this.selectedIndex);
      }
    }

  }

  setupLocalPlayer() {
    this.stopProgressTimer();
    this.remoteConfigured = false;
  }

  checkIfNowPlaying(track) {
    var selected = this.selectedTrack();
    if (selected && track) {
      return track.id === selected.id;
    }
    return false;
  }
}