(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var textInput = panel.querySelector('[data-filter-text]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var categorySelect = panel.querySelector('[data-filter-category]');
    var resetButton = panel.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.js-filter-card'));
    var count = document.querySelector('[data-result-count]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (q && textInput) {
      textInput.value = q;
    }

    function apply() {
      var text = normalize(textInput && textInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var category = normalize(categorySelect && categorySelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var matchText = !text || haystack.indexOf(text) !== -1;
        var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchRegion = !region || normalize(card.getAttribute('data-region')) === region;
        var matchType = !type || normalize(card.getAttribute('data-type')) === type;
        var matchCategory = !category || normalize(card.getAttribute('data-category')) === category;
        var matched = matchText && matchYear && matchRegion && matchType && matchCategory;
        card.classList.toggle('is-hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '共 ' + visible + ' 部';
      }
    }

    [textInput, yearSelect, regionSelect, typeSelect, categorySelect].forEach(function (field) {
      if (!field) {
        return;
      }
      field.addEventListener(field.tagName === 'INPUT' ? 'input' : 'change', apply);
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (textInput) {
          textInput.value = '';
        }
        [yearSelect, regionSelect, typeSelect, categorySelect].forEach(function (select) {
          if (select) {
            select.value = '';
          }
        });
        apply();
      });
    }

    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();

function initMoviePlayer(source) {
  var video = document.getElementById('moviePlayer');
  var start = document.getElementById('playerStart');
  var hls = null;
  var attached = false;

  if (!video || !source) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        maxBufferLength: 30,
        backBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hls) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
            video.src = source;
          }
        }
      });
      return;
    }

    video.src = source;
  }

  function play() {
    attach();
    if (start) {
      start.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (start) {
    start.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (start) {
      start.classList.add('is-hidden');
    }
  });
}
