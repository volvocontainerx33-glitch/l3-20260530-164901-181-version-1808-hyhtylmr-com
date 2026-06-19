(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = $('[data-menu-button]');
    var panel = $('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var index = 0;
    if (slides.length < 2) {
      return;
    }
    function go(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        go(i);
      });
    });
    window.setInterval(function () {
      go(index + 1);
    }, 5000);
  }

  function setupScrollers() {
    $all('[data-scroll-left]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = document.getElementById(button.getAttribute('data-scroll-left'));
        if (target) {
          target.scrollBy({ left: -420, behavior: 'smooth' });
        }
      });
    });
    $all('[data-scroll-right]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = document.getElementById(button.getAttribute('data-scroll-right'));
        if (target) {
          target.scrollBy({ left: 420, behavior: 'smooth' });
        }
      });
    });
  }

  function setupFilters() {
    var panels = $all('[data-filter-panel]');
    panels.forEach(function (panel) {
      var input = $('[data-filter-input]', panel);
      var year = $('[data-filter-year]', panel);
      var region = $('[data-filter-region]', panel);
      var clear = $('[data-filter-clear]', panel);
      var targetSelector = panel.getAttribute('data-filter-target') || '[data-movie-card]';
      var cards = $all(targetSelector);
      var empty = $('[data-empty-state]');

      function applyFilter() {
        var q = normalize(input && input.value);
        var y = normalize(year && year.value);
        var r = normalize(region && region.value);
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (y && cardYear !== y) {
            ok = false;
          }
          if (r && cardRegion.indexOf(r) === -1) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', shown === 0);
        }
      }

      [input, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });
      if (clear) {
        clear.addEventListener('click', function () {
          if (input) input.value = '';
          if (year) year.value = '';
          if (region) region.value = '';
          applyFilter();
        });
      }

      var params = new URLSearchParams(window.location.search);
      var qParam = params.get('q');
      if (qParam && input) {
        input.value = qParam;
      }
      applyFilter();
    });
  }

  function setupHeaderSearch() {
    $all('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = $('input', form);
        var query = input ? input.value.trim() : '';
        if (query) {
          var prefix = form.getAttribute('data-root-prefix') || '';
          window.location.href = prefix + 'search.html?q=' + encodeURIComponent(query);
        }
      });
    });
  }

  function setupImages() {
    $all('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-missing');
      }, { once: true });
    });
  }

  function setupPlayer() {
    var player = $('[data-player]');
    if (!player) {
      return;
    }
    var video = $('video', player);
    var button = $('[data-play-button]', player);
    var overlay = $('[data-player-overlay]', player);
    var status = $('[data-player-status]', player);
    var src = player.getAttribute('data-video-src');
    var loaded = false;
    var hls = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function loadAndPlay() {
      if (!video || !src) {
        setStatus('暂无可用播放源');
        return;
      }
      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放源连接失败，请稍后重试');
            }
          });
        } else {
          video.src = src;
        }
        loaded = true;
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('请再次点击播放按钮开始播放');
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', loadAndPlay);
    }
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      setStatus('正在播放');
    });
    video.addEventListener('pause', function () {
      setStatus('已暂停');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupScrollers();
    setupFilters();
    setupHeaderSearch();
    setupImages();
    setupPlayer();
  });
})();
