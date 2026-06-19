(function () {
  var form = document.querySelector('[data-search-page-form]');
  var input = form ? form.querySelector('input[name="q"]') : null;
  var results = document.querySelector('[data-search-results]');
  var title = document.querySelector('[data-search-title]');
  var desc = document.querySelector('[data-search-desc]');
  var movies = Array.isArray(window.MOVIES) ? window.MOVIES : [];

  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

  var escapeHtml = function (value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  var buildCard = function (movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
      '<span class="poster-frame">' +
      '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-gradient"></span>' +
      '<span class="movie-badge">' + escapeHtml(movie.type) + '</span>' +
      '<span class="movie-score">' + escapeHtml(movie.rating) + '</span>' +
      '</span>' +
      '<span class="movie-card-body">' +
      '<strong>' + escapeHtml(movie.title) + '</strong>' +
      '<span class="movie-line">' + escapeHtml(movie.oneLine) + '</span>' +
      '<span class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.category) + '</span></span>' +
      '<span class="tag-row">' + tags + '</span>' +
      '</span>' +
      '</a>';
  };

  var render = function (term) {
    var query = term.trim().toLowerCase();
    if (input) {
      input.value = term;
    }
    if (!query) {
      if (title) {
        title.textContent = '热门推荐';
      }
      if (desc) {
        desc.textContent = '可通过上方搜索框查找剧集详情页。';
      }
      return;
    }
    var matched = movies.filter(function (movie) {
      return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, movie.oneLine, (movie.tags || []).join(' ')]
        .join(' ')
        .toLowerCase()
        .indexOf(query) >= 0;
    });
    if (title) {
      title.textContent = '搜索：' + term;
    }
    if (desc) {
      desc.textContent = matched.length ? '已匹配到相关剧集，点击卡片进入详情页。' : '未找到完全匹配的剧集，可以尝试更短的关键词。';
    }
    if (results) {
      results.innerHTML = matched.slice(0, 120).map(buildCard).join('') || '<p class="empty-result">未找到相关剧集</p>';
    }
  };

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input ? input.value.trim() : '';
      var url = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
      window.history.replaceState(null, '', url);
      render(value);
    });
  }

  if (initial) {
    render(initial);
  }
})();
