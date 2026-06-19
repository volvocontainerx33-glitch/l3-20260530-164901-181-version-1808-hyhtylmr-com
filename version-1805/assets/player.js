
import { H as Hls } from "./hls-vendor.js";

function splitSources(value) {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function setupPlayer(shell) {
  const video = shell.querySelector("video");
  const status = shell.querySelector("[data-player-status]");
  const playBtn = shell.querySelector("[data-play-btn]");
  const primary = shell.dataset.videoUrl;
  const backups = splitSources(shell.dataset.backupVideos);
  const sources = [primary, ...backups].filter(Boolean);
  let currentIndex = 0;
  let hls = null;
  let started = false;

  if (!video || !sources.length) return;

  function setStatus(text) {
    if (status) status.textContent = text;
  }

  function destroyHls() {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  }

  function attachSource(url) {
    destroyHls();
    setStatus("正在加载播放源…");
    shell.classList.remove("is-playing");
    video.removeAttribute("src");
    video.load();

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      setStatus("已准备就绪，点击播放按钮即可观看");
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        capLevelOnFPSDrop: true
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus("已准备就绪，点击播放按钮即可观看");
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          if (currentIndex < sources.length - 1) {
            currentIndex += 1;
            attachSource(sources[currentIndex]);
          } else {
            setStatus("当前播放源暂时不可用，已停止切换");
          }
        }
      });
      return;
    }

    video.src = url;
    setStatus("当前浏览器使用原生视频播放");
  }

  function playOrPause() {
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  video.addEventListener("play", () => {
    started = true;
    shell.classList.add("is-playing");
    setStatus("播放中");
  });

  video.addEventListener("pause", () => {
    if (started) {
      shell.classList.remove("is-playing");
      setStatus("已暂停");
    }
  });

  video.addEventListener("ended", () => {
    shell.classList.remove("is-playing");
    setStatus("播放结束");
  });

  if (playBtn) {
    playBtn.addEventListener("click", playOrPause);
  }

  shell.addEventListener("click", (event) => {
    if (event.target.closest("[data-play-btn]")) return;
    if (event.target === video) return;
    playOrPause();
  });

  attachSource(sources[currentIndex]);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-player-shell]").forEach(setupPlayer);
});
