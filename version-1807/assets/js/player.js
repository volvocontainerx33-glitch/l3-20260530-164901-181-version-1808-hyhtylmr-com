(function () {
  var player = document.querySelector('[data-player]');
  if (!player) {
    return;
  }

  var video = player.querySelector('video');
  var trigger = player.querySelector('[data-play-trigger]');
  var hls = null;
  var started = false;

  var playVideo = function () {
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }
    player.classList.add('is-playing');
    if (started) {
      video.play().catch(function () {});
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
      video.load();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        }
      });
      return;
    }
    video.src = stream;
    video.play().catch(function () {});
  };

  if (trigger) {
    trigger.addEventListener('click', playVideo);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (!started) {
        playVideo();
      }
    });
  }
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
