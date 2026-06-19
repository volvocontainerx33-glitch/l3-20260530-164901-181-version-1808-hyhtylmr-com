
(function () {
  function qs(root, sel) {
    return root.querySelector(sel);
  }

  function qsa(root, sel) {
    return Array.from(root.querySelectorAll(sel));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileNav() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const panel = document.querySelector("[data-nav-panel]");
    if (!toggle || !panel) return;
    toggle.addEventListener("click", () => {
      const open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    panel.addEventListener("click", (event) => {
      const target = event.target;
      if (target && target.matches("a")) {
        panel.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setupBackTop() {
    const btn = document.querySelector("[data-back-top]");
    if (!btn) return;
    const onScroll = () => {
      btn.classList.toggle("is-visible", window.scrollY > 420);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function itemText(el) {
    return normalize([
      el.dataset.title,
      el.dataset.year,
      el.dataset.region,
      el.dataset.type,
      el.dataset.genre,
      el.dataset.tags,
      el.dataset.search
    ].join(" "));
  }

  function filterItems(input) {
    const selector = input.dataset.filterTarget;
    const list = selector ? document.querySelector(selector) : input.closest("[data-filter-list]");
    if (!list) return;
    const items = qsa(list, "[data-filter-item]");
    const raw = normalize(input.value);
    const sortSelect = input.dataset.sortTarget ? document.querySelector(input.dataset.sortTarget) : null;

    let visible = 0;
    items.forEach((item) => {
      const ok = !raw || itemText(item).includes(raw);
      item.classList.toggle("hidden", !ok);
      item.setAttribute("aria-hidden", String(!ok));
      if (ok) visible += 1;
    });

    const countEl = document.querySelector(input.dataset.countTarget || "");
    if (countEl) {
      countEl.textContent = String(visible);
    }

    const empty = list.querySelector("[data-empty-state]");
    if (empty) {
      empty.classList.toggle("hidden", visible !== 0);
    }

    if (sortSelect) {
      applySort(sortSelect);
    }
  }

  function applySort(select) {
    const list = select.dataset.sortTarget ? document.querySelector(select.dataset.sortTarget) : null;
    if (!list) return;
    const items = qsa(list, "[data-filter-item]").filter((item) => !item.classList.contains("hidden"));
    const mode = select.value;
    const parent = items[0] ? items[0].parentElement : list;
    let ordered = items.slice();

    if (mode === "year-desc") {
      ordered.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
    } else if (mode === "year-asc") {
      ordered.sort((a, b) => Number(a.dataset.year || 0) - Number(b.dataset.year || 0));
    } else if (mode === "title-asc") {
      ordered.sort((a, b) => String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN"));
    } else if (mode === "heat-desc") {
      ordered.sort((a, b) => Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0));
    }

    ordered.forEach((item) => parent.appendChild(item));
  }

  function setupFilters() {
    qsa(document, "[data-filter-input]").forEach((input) => {
      input.addEventListener("input", () => filterItems(input));
      input.addEventListener("change", () => filterItems(input));
      filterItems(input);
    });
    qsa(document, "[data-sort-select]").forEach((select) => {
      select.addEventListener("change", () => applySort(select));
      applySort(select);
    });
  }

  function setupSlider(slider) {
    const slides = qsa(slider, "[data-slide]");
    if (!slides.length) return;
    const prev = qs(slider, "[data-slider-prev]");
    const next = qs(slider, "[data-slider-next]");
    const dotsWrap = qs(slider, "[data-slider-dots]");
    let index = 0;
    let timer = null;

    function render() {
      slides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === index);
      });
      if (dotsWrap) {
        qsa(dotsWrap, "button").forEach((dot, i) => dot.setAttribute("aria-pressed", String(i === index)));
      }
    }

    function goto(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      render();
      restart();
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(() => goto(index + 1), 6500);
    }

    if (prev) prev.addEventListener("click", () => goto(index - 1));
    if (next) next.addEventListener("click", () => goto(index + 1));

    if (dotsWrap) {
      dotsWrap.innerHTML = slides.map((_, i) => `<button type="button" aria-label="切换到第 ${i + 1} 张" ${i === 0 ? 'aria-pressed="true"' : 'aria-pressed="false"'}></button>`).join("");
      qsa(dotsWrap, "button").forEach((dot, i) => dot.addEventListener("click", () => goto(i)));
    }

    slider.addEventListener("mouseenter", () => timer && window.clearInterval(timer));
    slider.addEventListener("mouseleave", restart);
    render();
    restart();
  }

  function setupSliders() {
    qsa(document, "[data-slider]").forEach(setupSlider);
  }

  function setupStars() {
    qsa(document, "[data-rating]").forEach((el) => {
      const rating = Number(el.dataset.rating || 0);
      const stars = Math.max(0, Math.min(5, Math.round(rating / 2)));
      el.textContent = "★".repeat(stars) + "☆".repeat(5 - stars);
    });
  }

  function setupCardHover() {
    qsa(document, "[data-tilt-card]").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty("--tilt-x", String((x - 0.5) * 6));
        card.style.setProperty("--tilt-y", String((y - 0.5) * -6));
        card.style.transform = `translateY(-4px) rotateX(var(--tilt-y)deg) rotateY(var(--tilt-x)deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
        card.style.transform = "";
      });
    });
  }

  function setupDetailJump() {
    qsa(document, "[data-jump]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.jump;
        const target = id ? document.getElementById(id) : null;
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupMobileNav();
    setupBackTop();
    setupFilters();
    setupSliders();
    setupStars();
    setupCardHover();
    setupDetailJump();
  });
})();
