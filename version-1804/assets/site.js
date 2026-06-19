import { H as Hls } from './hls-vendor-dru42stk.js';

function setupMenu() {
  const button = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');
  const search = document.querySelector('.nav-search');
  if (!button || !menu || !search) {
    return;
  }
  button.addEventListener('click', () => {
    menu.classList.toggle('open');
    search.classList.toggle('open');
  });
}

function setupHero() {
  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  if (!slides.length) {
    return;
  }
  let index = 0;
  let timer = null;
  const show = (next) => {
    index = next;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };
  const start = () => {
    timer = window.setInterval(() => show((index + 1) % slides.length), 5200);
  };
  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      stop();
      show(i);
      start();
    });
  });
  show(0);
  start();
}

function startPlayback(video) {
  const attempt = video.play();
  if (attempt && typeof attempt.catch === 'function') {
    attempt.catch(() => {});
  }
}

function setupPlayer() {
  const video = document.querySelector('video[data-src]');
  const button = document.querySelector('[data-play-button]');
  const overlay = document.querySelector('[data-play-overlay]');
  if (!video || !button) {
    return;
  }
  let initialized = false;
  const init = () => {
    const source = video.dataset.src;
    if (!source) {
      return;
    }
    if (!initialized) {
      initialized = true;
      video.controls = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        startPlayback(video);
      } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => startPlayback(video));
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data && data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          }
        });
      } else {
        video.src = source;
        startPlayback(video);
      }
    } else if (video.paused) {
      startPlayback(video);
    } else {
      video.pause();
    }
    if (overlay) {
      overlay.style.display = 'none';
    }
  };
  button.addEventListener('click', init);
  video.addEventListener('click', init);
}

function setupSearchPage() {
  const form = document.querySelector('[data-search-form]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  if (!form || !input || !results || !window.MOVIE_SEARCH_INDEX) {
    return;
  }
  const render = (query) => {
    const q = query.trim().toLowerCase();
    const items = window.MOVIE_SEARCH_INDEX.filter((item) => {
      if (!q) {
        return true;
      }
      return [item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ').toLowerCase().includes(q);
    }).slice(0, 96);
    if (!items.length) {
      results.innerHTML = '<div class="empty-message">没有找到匹配影片。</div>';
      return;
    }
    results.innerHTML = '<div class="movie-grid">' + items.map((item) => `
      <article class="movie-card">
        <a class="poster-link" href="./${item.url}" aria-label="${escapeHtml(item.title)}">
          <img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy">
          <span class="poster-play">播放</span>
        </a>
        <div class="movie-card-body">
          <div class="movie-meta-row">
            <span>${escapeHtml(item.year)}</span>
            <span>${escapeHtml(item.region)}</span>
          </div>
          <h3><a href="./${item.url}">${escapeHtml(item.title)}</a></h3>
          <p>${escapeHtml(item.oneLine)}</p>
          <div class="card-foot">
            <span class="score">★ ${escapeHtml(item.rating)}</span>
            <a href="./${item.categoryFile}">${escapeHtml(item.categoryName)}</a>
          </div>
        </div>
      </article>
    `).join('') + '</div>';
  };
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('q') || '';
  input.value = initial;
  render(initial);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    const nextUrl = query ? `./search.html?q=${encodeURIComponent(query)}` : './search.html';
    window.history.replaceState(null, '', nextUrl);
    render(query);
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

setupMenu();
setupHero();
setupPlayer();
setupSearchPage();
