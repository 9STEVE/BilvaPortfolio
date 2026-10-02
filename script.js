/* =========================================================
   Portfolio interactions
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Project images: show a styled placeholder if an image fails to load ---------- */
  document.querySelectorAll("img.project__thumb").forEach(img => {
    const swap = () => {
      const div = document.createElement("div");
      div.className = "project__thumb";
      div.style.cssText = img.getAttribute("style") || "";
      div.textContent = img.dataset.fallback || img.alt;
      img.closest(".project__media")?.classList.remove("project__media--logo");
      img.replaceWith(div);
    };
    if (img.complete && img.naturalWidth === 0) swap();
    else img.addEventListener("error", swap);
  });

  /* ---------- Hero title: word-by-word entrance ---------- */
  const title = document.querySelector(".hero__title");
  if (title) {
    let i = 0;
    title.innerHTML = title.innerHTML
      .split(/(<br\s*\/?>)/)
      .map(part => part.startsWith("<br") ? part :
        part.split(" ").filter(Boolean)
          .map(w => `<span class="word" style="animation-delay:${(i++) * 70}ms">${w}</span>`)
          .join(" "))
      .join("");
  }

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById("menuBtn");
  const scrim = document.getElementById("scrim");
  const setMenu = open => {
    body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
  };
  menuBtn.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
  scrim.addEventListener("click", () => setMenu(false));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
  document.querySelectorAll(".sidebar a").forEach(a => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Theme toggle (remembers choice) ---------- */
  const themeBtn = document.getElementById("themeBtn");
  const applyTheme = theme => {
    document.documentElement.dataset.theme = theme;
    themeBtn.textContent = theme === "light" ? "Switch to dark" : "Switch to light";
  };
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (_) {}
  applyTheme(saved || "dark");
  themeBtn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    applyTheme(next);
    try { localStorage.setItem("theme", next); } catch (_) {}
  });

  /* ---------- Active nav link on scroll ---------- */
  const links = [...document.querySelectorAll(".nav__link")];
  const sections = links.map(l => document.querySelector(l.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(l => l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(s => spy.observe(s));

  /* ---------- Stats count-up when visible ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const countUp = el => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const start = performance.now(), dur = 1200;
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { countUp(entry.target); statObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(el => statObserver.observe(el));

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const MY_EMAIL = "ndegebilfer@gmail.com";

  const validate = field => {
    const input = field.querySelector("input, textarea");
    const error = field.querySelector(".field__error");
    let msg = "";
    if (!input.value.trim()) msg = `Enter your ${input.name}.`;
    else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) msg = "Enter an email like name@example.com.";
    field.classList.toggle("has-error", !!msg);
    error.textContent = msg;
    return !msg;
  };

  form.querySelectorAll(".field").forEach(f =>
    f.querySelector("input, textarea").addEventListener("blur", () => validate(f)));

  form.addEventListener("submit", e => {
    e.preventDefault();
    const fields = [...form.querySelectorAll(".field")];
    const ok = fields.map(validate).every(Boolean);
    if (!ok) { status.textContent = ""; fields.find(f => f.classList.contains("has-error"))?.querySelector("input, textarea").focus(); return; }

    const data = Object.fromEntries(new FormData(form));
    /* Opens the visitor's email app with the message filled in.
       To receive messages directly instead, connect a service like Formspree or EmailJS here. */
    const mailto = `mailto:${MY_EMAIL}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(
      `${data.message}\n\n— ${data.name} (${data.email})`)}`;
    window.location.href = mailto;
    status.textContent = "Your email app should open with the message ready to send.";
    form.reset();
  });
});
