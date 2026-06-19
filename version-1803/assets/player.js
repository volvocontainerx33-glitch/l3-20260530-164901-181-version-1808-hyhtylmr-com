(function () {
  window.MoviePlayer = function (settings) {
    var video = document.getElementById('movie-video');
    var overlay = document.getElementById('play-overlay');
    var button = document.getElementById('play-button');
    var loaded = false;
    var player = null;

    function start() {
      if (!video || loaded) {
        return;
      }
      loaded = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = settings.source;
        var nativePlay = video.play();
        if (nativePlay && nativePlay.catch) {
          nativePlay.catch(function () {});
        }
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        player.loadSource(settings.source);
        player.attachMedia(video);
        player.on(window.Hls.Events.MANIFEST_PARSED, function () {
          var playPromise = video.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(function () {});
          }
        });
        return;
      }
      video.src = settings.source;
      var directPlay = video.play();
      if (directPlay && directPlay.catch) {
        directPlay.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!loaded) {
          start();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (player) {
        player.destroy();
      }
    });
  };
})();
