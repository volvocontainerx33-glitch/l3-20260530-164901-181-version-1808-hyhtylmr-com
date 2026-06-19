(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function getQuery(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function filterIn(root, term) {
    var text = term.trim().toLowerCase();
    var items = Array.prototype.slice.call(root.querySelectorAll("[data-search-item]"));
    var visible = 0;
    items.forEach(function (item) {
      var haystack = (item.getAttribute("data-search-text") || item.textContent || "").toLowerCase();
      var matched = !text || haystack.indexOf(text) !== -1;
      item.classList.toggle("is-hidden", !matched);
      if (matched) {
        visible += 1;
      }
    });
    var empty = root.querySelector("[data-empty-state]") || document.querySelector("[data-empty-state]");
    if (empty) {
      empty.classList.toggle("visible", visible === 0);
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;
    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initLocalFilters() {
    Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]")).forEach(function (form) {
      var input = form.querySelector("input[type='search']");
      var scope = form.closest("main") || document;
      if (!input) {
        return;
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        filterIn(scope, input.value);
      });
      input.addEventListener("input", function () {
        filterIn(scope, input.value);
      });
    });
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page) {
      return;
    }
    var form = page.querySelector("[data-search-filter]");
    var input = form ? form.querySelector("input[name='q']") : null;
    var q = getQuery("q");
    if (input) {
      input.value = q;
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        filterIn(page, input.value);
        var next = input.value.trim() ? "?q=" + encodeURIComponent(input.value.trim()) : window.location.pathname;
        window.history.replaceState(null, "", next);
      });
      input.addEventListener("input", function () {
        filterIn(page, input.value);
      });
    }
    filterIn(page, q);
  }

  function initHeaderSearch() {
    Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
      });
    });
  }

  function initPlayer(src) {
    ready(function () {
      var video = document.querySelector("[data-player-video]");
      var overlay = document.querySelector("[data-player-overlay]");
      var playButton = document.querySelector("[data-player-button]");
      if (!video || !src) {
        return;
      }
      var loaded = false;
      var hls = null;
      function load() {
        if (loaded) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal || !hls) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          });
        } else {
          video.src = src;
        }
        loaded = true;
      }
      function play() {
        load();
        if (overlay) {
          overlay.classList.add("player-overlay-hidden");
        }
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            if (overlay) {
              overlay.classList.remove("player-overlay-hidden");
            }
          });
        }
      }
      if (overlay) {
        overlay.addEventListener("click", play);
      }
      if (playButton) {
        playButton.addEventListener("click", play);
      }
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("player-overlay-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove("player-overlay-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  window.MovieSite = {
    initPlayer: initPlayer
  };

  ready(function () {
    initMenu();
    initHero();
    initLocalFilters();
    initSearchPage();
    initHeaderSearch();
  });
})();
