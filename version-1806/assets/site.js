(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".filter-box"));
    boxes.forEach(function (box) {
      var input = box.querySelector("[data-filter-search]");
      var buttons = Array.prototype.slice.call(box.querySelectorAll("[data-filter]"));
      var cards = Array.prototype.slice.call(box.querySelectorAll(".movie-card"));
      var empty = box.querySelector("[data-empty-state]");
      var active = "all";
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-region")).toLowerCase();
          var category = card.getAttribute("data-category") || "";
          var matchedText = !query || text.indexOf(query) !== -1;
          var matchedCategory = active === "all" || category === active;
          var show = matchedText && matchedCategory;
          card.classList.toggle("is-hidden", !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }
      if (input) {
        var params = new URLSearchParams(window.location.search);
        if (params.get("q")) {
          input.value = params.get("q");
        }
        input.addEventListener("input", apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          active = button.getAttribute("data-filter") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".play-layer");
      var source = box.getAttribute("data-stream");
      var loaded = false;
      var hls = null;
      function playVideo() {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
      function start() {
        if (!video || !source) {
          return;
        }
        if (!loaded) {
          loaded = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            playVideo();
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
            hls.loadSource(source);
            hls.attachMedia(video);
            if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
              hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            } else {
              playVideo();
            }
          } else {
            video.src = source;
            playVideo();
          }
        } else {
          playVideo();
        }
      }
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          start();
        });
      }
      box.addEventListener("click", function (event) {
        if (event.target === video && !loaded) {
          start();
        }
      });
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.currentTime) {
          box.classList.remove("is-playing");
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
