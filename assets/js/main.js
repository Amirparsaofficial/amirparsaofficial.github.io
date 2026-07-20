(function () {
  "use strict";

  const root = document.documentElement;
  const STORAGE_LANG = "ap_lang";
  const STORAGE_THEME = "ap_theme";

  /* ---------------------------------------------------------------------
     i18n: read a dotted key like "nav.about" out of I18N[lang]
     --------------------------------------------------------------------- */
  function readKey(obj, path) {
    return path.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), obj);
  }

  function applyLanguage(lang) {
    const dict = I18N[lang];
    if (!dict) return;

    root.setAttribute("lang", lang);
    root.setAttribute("dir", dict.dir);
    document.title = dict.meta_title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", dict.meta_desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", dict.meta_title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", dict.meta_desc);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = readKey(dict, key);
      if (typeof value === "string") el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      const value = readKey(dict, key);
      if (typeof value === "string") el.innerHTML = value;
    });

    const langBtn = document.getElementById("langToggle");
    if (langBtn) langBtn.textContent = dict.lang_toggle;

    updateThemeLabel();
    restartRoleTyping(dict.hero_roles);

    localStorage.setItem(STORAGE_LANG, lang);
  }

  /* ---------------------------------------------------------------------
     Theme
     --------------------------------------------------------------------- */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_THEME, theme);
    updateThemeLabel();
  }

  function updateThemeLabel() {
    const lang = root.getAttribute("lang") || "fa";
    const dict = I18N[lang];
    const theme = root.getAttribute("data-theme") || "dark";
    const label = document.getElementById("themeLabel");
    if (label && dict) {
      label.textContent = theme === "dark" ? dict.theme_toggle_dark : dict.theme_toggle_light;
    }
    const icon = document.getElementById("themeIcon");
    if (icon) icon.textContent = theme === "dark" ? "☾" : "☀";
  }

  /* ---------------------------------------------------------------------
     Hero role rotation (typing effect)
     --------------------------------------------------------------------- */
  let typingHandle = null;
  function restartRoleTyping(roles) {
    const el = document.getElementById("heroRole");
    if (!el || !roles || !roles.length) return;
    if (typingHandle) clearTimeout(typingHandle);

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          typingHandle = setTimeout(tick, 1600);
          return;
        }
        typingHandle = setTimeout(tick, 55);
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          typingHandle = setTimeout(tick, 300);
          return;
        }
        typingHandle = setTimeout(tick, 28);
      }
    }
    tick();
  }

  /* ---------------------------------------------------------------------
     Mobile menu
     --------------------------------------------------------------------- */
  function initMobileMenu() {
    const burger = document.getElementById("navBurger");
    const panel = document.getElementById("mobilePanel");
    if (!burger || !panel) return;
    burger.addEventListener("click", () => {
      panel.classList.toggle("open");
    });
    panel.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => panel.classList.remove("open"))
    );
    document.addEventListener("click", (e) => {
      if (!panel.contains(e.target) && !burger.contains(e.target)) {
        panel.classList.remove("open");
      }
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------------------- */
  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------------
     Init
     --------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem(STORAGE_LANG) || root.getAttribute("lang") || "fa";
    const savedTheme = localStorage.getItem(STORAGE_THEME) || "dark";

    applyTheme(savedTheme);
    applyLanguage(savedLang);

    const langBtn = document.getElementById("langToggle");
    if (langBtn) {
      langBtn.addEventListener("click", () => {
        const current = root.getAttribute("lang");
        applyLanguage(current === "fa" ? "en" : "fa");
      });
    }

    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const current = root.getAttribute("data-theme");
        applyTheme(current === "dark" ? "light" : "dark");
      });
    }

    initMobileMenu();
    initReveal();

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });
})();
