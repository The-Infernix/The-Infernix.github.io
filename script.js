(() => {
  "use strict";

  const header = document.querySelector("#site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#site-nav");
  const year = document.querySelector("#year");
  const terminalText = document.querySelector("#terminal-text");
  const linkedinLink = document.querySelector("#linkedin-link");
  const progressBar = document.querySelector("#scroll-progress");

  // Keep in sync with the LinkedIn URL in index.html (contact link + JSON-LD sameAs).
  const LINKEDIN_URL = "https://www.linkedin.com/in/pavan-indupudi-a38759334";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------------ year */
  if (year) year.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------- sticky header */
  if (header) {
    const updateHeader = () => {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* ------------------------------------------------ scroll progress bar */
  if (progressBar) {
    let ticking = false;
    const updateProgress = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progressBar.style.transform = `scaleX(${progress})`;
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateProgress);
        }
      },
      { passive: true }
    );
    updateProgress();
  }

  /* --------------------------------------------------------- mobile menu */
  if (menuButton && nav) {
    const setMenu = (open) => {
      nav.classList.toggle("open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    };

    menuButton.addEventListener("click", () => {
      setMenu(!nav.classList.contains("open"));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        setMenu(false);
        menuButton.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        nav.classList.contains("open") &&
        !nav.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        setMenu(false);
      }
    });
  }

  /* ------------------------------------------------- scroll reveals */
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

  if (revealItems.length && "IntersectionObserver" in window) {
    // Stagger siblings within the same section for a composed entrance.
    const sections = new Map();
    revealItems.forEach((el) => {
      const section = el.closest("section, footer") || document.body;
      const order = sections.get(section) || 0;
      sections.set(section, order + 1);
      el.style.setProperty("--reveal-delay", `${Math.min(order, 5) * 80}ms`);
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    revealItems.forEach((el) => {
      if (reduceMotion.matches) {
        el.classList.add("is-visible");
      } else {
        revealObserver.observe(el);
      }
    });
  } else {
    revealItems.forEach((el) => el.classList.add("is-visible"));
  }

  /* ------------------------------------------- active nav highlighting */
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  const trackedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (trackedSections.length && "IntersectionObserver" in window) {
    const setCurrent = (id) => {
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${id}`;
        if (active) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );

    trackedSections.forEach((section) => sectionObserver.observe(section));
  }

  /* ------------------------------------------------- terminal typewriter */
  if (terminalText) {
    const commands = ["whoami", "git status", "npm run build", "keep shipping"];

    if (reduceMotion.matches) {
      let index = 0;
      window.setInterval(() => {
        index = (index + 1) % commands.length;
        terminalText.textContent = commands[index];
      }, 2800);
    } else {
      let commandIndex = 0;
      let charIndex = commands[0].length;
      let deleting = true;

      const step = () => {
        const current = commands[commandIndex];
        if (deleting) {
          charIndex -= 1;
          terminalText.textContent = current.slice(0, charIndex);
          if (charIndex <= 0) {
            deleting = false;
            commandIndex = (commandIndex + 1) % commands.length;
            window.setTimeout(step, 500);
            return;
          }
          window.setTimeout(step, 45);
        } else {
          const next = commands[commandIndex];
          charIndex += 1;
          terminalText.textContent = next.slice(0, charIndex);
          if (charIndex >= next.length) {
            deleting = true;
            window.setTimeout(step, 2400);
            return;
          }
          window.setTimeout(step, 85);
        }
      };
      window.setTimeout(step, 2400);
    }
  }

  /* ---------------------------------------------- LinkedIn safety net */
  if (linkedinLink && LINKEDIN_URL && linkedinLink.getAttribute("href") !== LINKEDIN_URL) {
    linkedinLink.href = LINKEDIN_URL;
    linkedinLink.target = "_blank";
    linkedinLink.rel = "noopener noreferrer";
  }
})();
