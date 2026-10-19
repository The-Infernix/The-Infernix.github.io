(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------ category filter */
  const chips = Array.from(document.querySelectorAll(".filter-chip"));
  const cards = Array.from(document.querySelectorAll("[data-cats]"));
  const searchInput = document.querySelector("#journal-search");
  const countEl = document.querySelector("#filter-count");
  const featured = document.querySelector(".featured-article");

  let activeCategory = "all";
  let query = "";

  const applyFilter = () => {
    let visible = 0;
    cards.forEach((card) => {
      const cats = card.getAttribute("data-cats").split(/\s+/);
      const title = (card.getAttribute("data-title") || card.textContent).toLowerCase();
      const catOk = activeCategory === "all" || cats.includes(activeCategory);
      const searchOk = !query || title.includes(query);
      const show = catOk && searchOk;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (featured) {
      const fCats = (featured.getAttribute("data-cats") || "").split(/\s+/);
      const fTitle = (featured.getAttribute("data-title") || "").toLowerCase();
      const fOk =
        (activeCategory === "all" || fCats.includes(activeCategory)) &&
        (!query || fTitle.includes(query));
      featured.hidden = !fOk;
    }

    if (countEl) {
      const total = visible + (featured && !featured.hidden ? 1 : 0);
      if (!activeCategory && !query) {
        countEl.textContent = "";
      } else {
        countEl.textContent = `${total} article${total === 1 ? "" : "s"} shown`;
      }
    }
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.getAttribute("data-filter") || "all";
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      applyFilter();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      query = searchInput.value.trim().toLowerCase();
      applyFilter();
    });
  }

  /* -------------------------------------------------- copy buttons */
  document.querySelectorAll(".code-block").forEach((block) => {
    const code = block.querySelector("code");
    if (!code) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.setAttribute("aria-label", "Copy code to clipboard");
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        btn.textContent = "Copied";
        btn.classList.add("copied");
        window.setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("copied");
        }, 1600);
      } catch (_) {
        btn.textContent = "Failed";
        window.setTimeout(() => { btn.textContent = "Copy"; }, 1600);
      }
    });
    block.appendChild(btn);
  });

  /* ------------------------------------------ tiny code highlighter */
  const KEYWORDS = {
    js: /\b(const|let|var|function|return|if|else|for|while|await|async|new|class|extends|import|from|export|typeof|of|in|null|undefined|true|false)\b/g,
    python: /\b(def|class|return|if|elif|else|for|while|import|from|as|with|try|except|raise|None|True|False|and|or|not|in|is|lambda|yield)\b/g,
    bash: /\b(python|pip|uvicorn|pytest|node|npm|docker|cd|cp|git|curl|export|mkdir)\b/g,
    json: /\b(true|false|null)\b/g,
  };

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const highlight = (raw, lang) => {
    let out = esc(raw);
    out = out.replace(/(&quot;|&#39;|"|')(?:(?!\1).)*?\1/g, (m) => `<span class="tok-str">${m}</span>`);
    out = out.replace(/(#[^\n<]*|\/\/[^\n<]*)/g, (m) =>
      m.includes("tok-str") ? m : `<span class="tok-com">${m}</span>`
    );
    const kw = KEYWORDS[lang];
    if (kw) {
      kw.lastIndex = 0;
      out = out.replace(kw, (m) => `<span class="tok-kw">${m}</span>`);
    }
    out = out.replace(/\b(\d+\.?\d*)\b/g, (m) => `<span class="tok-num">${m}</span>`);
    return out;
  };

  document.querySelectorAll("pre code[class*='language-']").forEach((code) => {
    const lang = (code.className.match(/language-(\w+)/) || [])[1] || "";
    if (!KEYWORDS[lang]) return;
    code.innerHTML = highlight(code.textContent, lang);
  });

  /* -------------------------------------------------------- TOC */
  const article = document.querySelector(".prose");
  const tocNav = document.querySelector("#toc ol");

  if (article && tocNav) {
    const headings = Array.from(article.querySelectorAll("h2[id], h3[id]"));
    if (headings.length >= 3) {
      headings.forEach((h) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${h.id}`;
        a.textContent = h.textContent;
        if (h.tagName === "H3") a.style.paddingLeft = "28px";
        li.appendChild(a);
        tocNav.appendChild(li);
      });

      if ("IntersectionObserver" in window) {
        const links = Array.from(tocNav.querySelectorAll("a"));
        const setCurrent = (id) => {
          links.forEach((a) => {
            if (a.getAttribute("href") === `#${id}`) {
              a.setAttribute("aria-current", "true");
            } else {
              a.removeAttribute("aria-current");
            }
          });
        };
        const spy = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) setCurrent(entry.target.id);
            });
          },
          { rootMargin: "-15% 0px -70% 0px" }
        );
        headings.forEach((h) => spy.observe(h));
      }
    } else {
      const toc = document.querySelector("#toc");
      if (toc) toc.hidden = true;
    }
  }

  /* smooth in-page scrolling (skipped under reduced motion) */
  if (!reduceMotion.matches) {
    document.documentElement.style.scrollBehavior = "smooth";
  }
})();
