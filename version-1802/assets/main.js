document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      const opened = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    let current = 0;

    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("active", idx === current);
      });
    };

    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  const form = document.querySelector("[data-filter-form]");
  const target = document.querySelector(".filter-target");

  if (form && target) {
    const cards = Array.from(target.children);
    const keywordInput = form.querySelector("[data-filter='keyword']");
    const regionSelect = form.querySelector("[data-filter='region']");
    const typeSelect = form.querySelector("[data-filter='type']");
    const empty = document.querySelector(".empty-result");

    const applyFilter = function () {
      const keyword = (keywordInput && keywordInput.value || "").trim().toLowerCase();
      const region = regionSelect && regionSelect.value || "";
      const type = typeSelect && typeSelect.value || "";
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title || "",
          card.dataset.region || "",
          card.dataset.genre || "",
          card.dataset.year || "",
          card.dataset.type || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesRegion = !region || (card.dataset.region || "").includes(region);
        const matchesType = !type || (card.dataset.type || "").includes(type);
        const ok = matchesKeyword && matchesRegion && matchesType;
        card.classList.toggle("hidden-by-filter", !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    form.addEventListener("input", applyFilter);
    form.addEventListener("change", applyFilter);
  }
});
