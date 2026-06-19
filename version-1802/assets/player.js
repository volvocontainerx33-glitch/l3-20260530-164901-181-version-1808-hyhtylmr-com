document.addEventListener("DOMContentLoaded", function () {
  const panels = Array.from(document.querySelectorAll(".player-panel[data-stream]"));

  panels.forEach(function (panel) {
    const video = panel.querySelector("video");
    const button = panel.querySelector(".play-overlay");
    const stream = panel.getAttribute("data-stream");
    let ready = false;
    let hlsInstance = null;

    const attachStream = function () {
      if (!video || !stream || ready) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else {
        video.src = stream;
      }

      ready = true;
    };

    const start = function () {
      attachStream();
      panel.classList.add("playing");
      const playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          panel.classList.remove("playing");
        });
      }
    };

    if (button && video) {
      button.addEventListener("click", start);
      video.addEventListener("play", function () {
        panel.classList.add("playing");
      });
      video.addEventListener("pause", function () {
        panel.classList.remove("playing");
      });
      video.addEventListener("ended", function () {
        panel.classList.remove("playing");
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
});
