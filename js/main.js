/* ClickTracker – Website-Skript */
(function () {
  "use strict";

  const cfg = window.CLICKTRACKER || {};
  const DOWNLOAD_DIR = "downloads/";

  // ---------- Mobile-Menü ----------
  const menuBtn = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
  }

  // ---------- Header-Linie beim Scrollen ----------
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Einblenden beim Scrollen ----------
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  // ---------- Jahr im Footer ----------
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  // ---------- Code kopieren ----------
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.parentElement.querySelector("pre").innerText.trim();
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Kopiert ✓";
      } catch (e) {
        btn.textContent = "Bitte manuell kopieren";
      }
      setTimeout(() => { btn.textContent = "Kopieren"; }, 1800);
    });
  });

  // ---------- Bild vergrössern ----------
  const zoomables = document.querySelectorAll("[data-zoom]");
  if (zoomables.length) {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = '<img alt="">';
    document.body.appendChild(box);
    zoomables.forEach((img) => img.addEventListener("click", () => {
      box.querySelector("img").src = img.src;
      box.querySelector("img").alt = img.alt;
      box.classList.add("open");
    }));
    box.addEventListener("click", () => box.classList.remove("open"));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") box.classList.remove("open"); });
  }

  // ---------- Installer ----------
  function versionOf(name) {
    const m = /(\d+(?:\.\d+)+)/.exec(name || "");
    return m ? m[1] : null;
  }
  function formatSize(bytes) {
    if (!bytes) return null;
    return (bytes / 1024 / 1024).toLocaleString("de-CH", { maximumFractionDigits: 0 }) + " MB";
  }
  function formatDate(ms) {
    if (!ms) return null;
    return new Date(ms).toLocaleDateString("de-CH", { day: "numeric", month: "long", year: "numeric" });
  }
  function fill(attr, value) {
    document.querySelectorAll("[" + attr + "]").forEach((el) => {
      if (value) { el.textContent = value; el.closest("[data-hide-empty]")?.removeAttribute("hidden"); }
      else { el.closest("[data-hide-empty]")?.setAttribute("hidden", ""); }
    });
  }

  async function loadInstallers() {
    let list = null;
    try {
      const res = await fetch("api/installers", { cache: "no-store" });
      if (res.ok) list = await res.json();
    } catch (e) { /* kein server.py – Fallback aus config.js */ }

    const wanted = cfg.installer && cfg.installer !== "auto" ? cfg.installer : null;
    let current;
    if (Array.isArray(list)) {
      current = wanted ? list.find((i) => i.file === wanted) : list[0];
      if (!current) current = { file: wanted || null, missing: true };
    } else {
      current = { file: wanted || cfg.fallbackFile || null };
    }
    current.version = current.version || versionOf(current.file);
    return { current, all: Array.isArray(list) ? list : [] };
  }

  loadInstallers().then(({ current, all }) => {
    const href = current.file ? DOWNLOAD_DIR + encodeURIComponent(current.file) : null;

    document.querySelectorAll("[data-installer-link]").forEach((a) => {
      if (href && !current.missing) {
        a.href = href;
        a.setAttribute("download", current.file);
        a.removeAttribute("aria-disabled");
      } else {
        a.removeAttribute("href");
        a.setAttribute("aria-disabled", "true");
      }
    });
    fill("data-installer-version", current.version);
    fill("data-installer-file", current.file);
    fill("data-installer-size", formatSize(current.size));
    fill("data-installer-date", formatDate(current.modified));

    const missing = document.querySelector("[data-installer-missing]");
    if (missing && (current.missing || !current.file)) missing.hidden = false;

    // Ältere Versionen
    const older = document.querySelector("[data-older-versions]");
    const others = all.filter((i) => i.file !== current.file);
    if (older && cfg.showOlderVersions !== false && others.length) {
      const ul = older.querySelector("ul");
      others.forEach((i) => {
        const li = document.createElement("li");
        const meta = [formatSize(i.size), formatDate(i.modified)].filter(Boolean).join(" · ");
        li.innerHTML = '<span class="v"></span><span class="meta"></span><a>Herunterladen</a>';
        li.querySelector(".v").textContent = i.version ? "v" + i.version : i.file;
        li.querySelector(".meta").textContent = meta;
        const a = li.querySelector("a");
        a.href = DOWNLOAD_DIR + encodeURIComponent(i.file);
        a.setAttribute("download", i.file);
        ul.appendChild(li);
      });
      older.hidden = false;
    }
  });
})();
