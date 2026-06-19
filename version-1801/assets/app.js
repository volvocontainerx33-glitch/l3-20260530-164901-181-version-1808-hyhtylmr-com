(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(nextIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    var filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
      var input = filterRoot.querySelector('[data-search-input]');
      var region = filterRoot.querySelector('[data-region-select]');
      var year = filterRoot.querySelector('[data-year-select]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
      var empty = document.querySelector('[data-empty-state]');

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var selectedRegion = region ? region.value : '';
        var selectedYear = year ? year.value : '';
        var visibleCount = 0;

        cards.forEach(function (card) {
          var title = (card.getAttribute('data-title') || '').toLowerCase();
          var cardRegion = card.getAttribute('data-region') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var genre = (card.getAttribute('data-genre') || '').toLowerCase();
          var category = (card.getAttribute('data-category') || '').toLowerCase();
          var matchesKeyword = !keyword || title.indexOf(keyword) > -1 || genre.indexOf(keyword) > -1 || category.indexOf(keyword) > -1;
          var matchesRegion = !selectedRegion || cardRegion.indexOf(selectedRegion) > -1;
          var matchesYear = !selectedYear || cardYear === selectedYear;
          var show = matchesKeyword && matchesRegion && matchesYear;

          card.style.display = show ? '' : 'none';
          if (show) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.style.display = visibleCount ? 'none' : 'block';
        }
      }

      [input, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      applyFilter();
    }
  });

  window.initMoviePlayer = function (videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var started = false;

    function start() {
      if (!video || started) {
        return;
      }

      started = true;

      if (overlay) {
        overlay.classList.add('hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = sourceUrl;
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', start);
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
    }
  };
})();
