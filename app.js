(() => {
  "use strict";
  const STORAGE_KEY = "kiratveerStudioContentV2";
  const ANALYTICS_KEY = "kiratveerStudioAnalyticsV1";
  const defaults = window.KS_DEFAULTS || {projects: [], references: []};
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (_) { saved = {}; }
  const data = {
    ...defaults,
    ...saved,
    projects: Array.isArray(saved.projects) && saved.projects.length ? saved.projects : defaults.projects,
    references: Array.isArray(saved.references) && saved.references.length ? saved.references : defaults.references
  };

  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  function applyTheme(theme, persist = true) {
    const next = theme === "dark" ? "dark" : "light";
    root.dataset.theme = next;
    if (persist) { try { localStorage.setItem("kiratveerTheme", next); } catch (_) {} }
    const label = themeToggle?.querySelector("b");
    const icon = themeToggle?.querySelector(".theme-icon");
    if (label) label.textContent = next === "dark" ? "Dark" : "Light";
    if (icon) icon.textContent = next === "dark" ? "☀" : "☾";
    themeToggle?.setAttribute("aria-pressed", String(next === "dark"));
    themeToggle?.setAttribute("aria-label", `Switch to ${next === "dark" ? "light" : "dark"} theme`);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#050909" : "#f4efe7");
  }
  applyTheme(root.dataset.theme || "light", false);
  themeToggle?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    if (document.startViewTransition) document.startViewTransition(() => applyTheme(next));
    else applyTheme(next);
    track(`theme:${next}`);
  });

  const esc = (value = "") => String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  const safeUrl = value => /^(https?:\/\/|mailto:)/i.test(String(value || "")) ? String(value) : "";
  const safeMedia = value => /^(https?:\/\/|data:image\/|[\w./-]+\.(?:jpg|jpeg|png|webp|gif))/i.test(String(value || "")) ? String(value) : "";

  function analytics() {
    let state = {pageViews: 0, sessions: 0, events: {}, lastVisit: ""};
    try { state = {...state, ...JSON.parse(localStorage.getItem(ANALYTICS_KEY) || "{}")}; } catch (_) {}
    return state;
  }
  function track(name) {
    const state = analytics();
    state.events[name] = (state.events[name] || 0) + 1;
    state.lastVisit = new Date().toISOString();
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(state));
  }
  const state = analytics();
  state.pageViews += 1;
  if (!sessionStorage.getItem("ksSession")) { state.sessions += 1; sessionStorage.setItem("ksSession", "1"); }
  state.lastVisit = new Date().toISOString();
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(state));

  const offerText = document.querySelector(".offer-bar p");
  if (offerText && data.offer) offerText.innerHTML = `<span>Studio Note</span> ${esc(data.offer)}`;

  const projectTrack = document.getElementById("projectTrack");
  if (projectTrack) {
    projectTrack.innerHTML = data.projects.map((project, index) => {
      const image = safeMedia(project.image);
      const url = safeUrl(project.url);
      return `<article class="project-card" style="--project-color:${esc(project.color || "#222")}" data-project-id="${esc(project.id || index)}">
        <div class="project-visual">
          ${image ? `<img src="${esc(image)}" alt="${esc(project.title)} project preview" loading="${index ? "lazy" : "eager"}">` : `<div class="project-monogram">${esc(project.monogram || project.title.slice(0,2))}</div>`}
          <span class="project-status">${esc(project.status || "Selected project")}</span>
        </div>
        <div class="project-info">
          <p>${String(index + 1).padStart(2,"0")} / ${esc(project.category)}</p>
          <h3>${esc(project.title)}</h3>
          <span>${esc(project.description)}</span>
          <div class="project-tags">${(project.tags || []).map(tag => `<i>${esc(tag)}</i>`).join("")}</div>
          ${url ? `<a class="project-link" href="${esc(url)}" target="_blank" rel="noopener" data-track="project:${esc(project.id || index)}">Visit live project <b>↗</b></a>` : `<div class="project-link"><span>Currently being built</span><b>•••</b></div>`}
        </div>
      </article>`;
    }).join("");
    const total = document.getElementById("projectTotal");
    if (total) total.textContent = String(data.projects.length).padStart(2,"0");
  }

  const referenceTrack = document.getElementById("referenceTrack");
  if (referenceTrack) {
    referenceTrack.innerHTML = data.references.map((item, index) => {
      const url = safeUrl(item.url);
      const image = safeMedia(item.image);
      return `<article class="reference-card${image ? " has-image" : ""}" style="--ref-color:${esc(item.color || "#ccc")}">
        ${image ? `<img class="reference-image" src="${esc(image)}" alt="AI-generated visual for ${esc(item.name)}" loading="lazy"><span class="reference-shade"></span>` : ""}
        <span>${String(index + 1).padStart(2,"0")} / ${esc(item.type)}</span>
        <strong>${esc(item.name)}</strong><p>${esc(item.note)}</p>
        ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="Open ${esc(item.name)}" data-track="reference:${esc(item.name)}">↗</a>` : ""}
      </article>`;
    }).join("");
  }

  const intro = document.getElementById("intro");
  const closeIntro = () => {
    if (!intro || intro.classList.contains("is-leaving")) return;
    intro.classList.add("is-leaving");
    setTimeout(() => {
      intro.classList.add("is-fading");
      document.body.classList.remove("intro-lock");
      document.body.classList.add("page-ready");
    }, 880);
    setTimeout(() => { intro.classList.add("is-gone"); intro.remove(); }, 1430);
  };
  if (intro) {
    document.body.classList.add("intro-lock");
    requestAnimationFrame(() => requestAnimationFrame(() => intro.classList.add("is-ready")));
    intro.querySelector(".intro-skip")?.addEventListener("click", closeIntro);
    setTimeout(closeIntro, 3200);
    setTimeout(() => {
      if (document.body.classList.contains("intro-lock")) document.body.classList.remove("intro-lock");
      document.body.classList.add("page-ready");
      intro?.classList.add("is-gone");
    }, 5100);
  } else document.body.classList.add("page-ready");

  const menuButton = document.querySelector(".menu-button");
  const mobileNav = document.getElementById("mobileNav");
  const scrim = document.querySelector(".nav-scrim");
  function setMenu(open) {
    mobileNav?.classList.toggle("open", open);
    scrim?.classList.toggle("show", open);
    document.body.classList.toggle("menu-open", open);
    menuButton?.setAttribute("aria-expanded", String(open));
    menuButton?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuButton?.addEventListener("click", () => setMenu(!mobileNav.classList.contains("open")));
  document.getElementById("drawerClose")?.addEventListener("click", () => setMenu(false));
  scrim?.addEventListener("click", () => setMenu(false));
  mobileNav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", event => { if (event.key === "Escape") setMenu(false); });

  const header = document.querySelector(".site-header");
  let previousY = window.scrollY;
  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      header?.classList.toggle("is-scrolled", currentY > 20);
      header?.classList.toggle("is-hidden", currentY > previousY && currentY > 180 && !document.body.classList.contains("menu-open"));
      previousY = currentY;
      scrollTicking = false;
    });
  }, {passive:true});

  const revealElements = Array.from(document.querySelectorAll(".reveal"));
  revealElements.forEach((element, index) => {
    if (!element.dataset.reveal) element.dataset.reveal = index % 4 === 0 ? "left" : index % 4 === 2 ? "right" : "up";
  });
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver.unobserve(entry.target); }
  }), {threshold: .1, rootMargin: "0px 0px -7%"});
  revealElements.forEach(element => revealObserver.observe(element));

  const carousels = {};
  document.querySelectorAll("[data-carousel]").forEach(root => {
    const name = root.dataset.carousel;
    const trackElement = root.firstElementChild;
    const items = Array.from(trackElement?.children || []);
    carousels[name] = {root, track: trackElement, items, index: 0, timer: 0, paused: false};
  });
  function moveCarousel(name, direction) {
    const carousel = carousels[name];
    if (!carousel || carousel.items.length < 2) return;
    carousel.index = (carousel.index + direction + carousel.items.length) % carousel.items.length;
    const target = carousel.items[carousel.index];
    carousel.root.scrollTo({left: target.offsetLeft - carousel.track.offsetLeft, behavior:"smooth"});
    if (name === "projects") {
      const current = document.getElementById("projectCurrent");
      if (current) current.textContent = String(carousel.index + 1).padStart(2,"0");
    }
    track(`carousel:${name}`);
  }
  document.querySelectorAll("[data-carousel-next]").forEach(button => button.addEventListener("click", () => moveCarousel(button.dataset.carouselNext, 1)));
  document.querySelectorAll("[data-carousel-prev]").forEach(button => button.addEventListener("click", () => moveCarousel(button.dataset.carouselPrev, -1)));
  Object.entries(carousels).forEach(([name, carousel]) => {
    let raf = 0;
    carousel.root.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let closest = 0, distance = Infinity;
        carousel.items.forEach((item, index) => {
          const delta = Math.abs((item.offsetLeft - carousel.track.offsetLeft) - carousel.root.scrollLeft);
          if (delta < distance) { distance = delta; closest = index; }
        });
        carousel.index = closest;
        if (name === "projects") document.getElementById("projectCurrent").textContent = String(closest + 1).padStart(2,"0");
      });
    }, {passive:true});
    const delay = name === "projects" ? 6500 : name === "references" ? 5200 : 7600;
    carousel.timer = window.setInterval(() => { if (!carousel.paused && !document.hidden) moveCarousel(name, 1); }, delay);
    ["pointerenter","focusin"].forEach(type => carousel.root.addEventListener(type, () => { carousel.paused = true; }));
    ["pointerleave","focusout"].forEach(type => carousel.root.addEventListener(type, () => { carousel.paused = false; }));
  });

  const stage = document.querySelector(".hero-stage");
  stage?.addEventListener("pointermove", event => {
    const rect = stage.getBoundingClientRect();
    stage.style.setProperty("--stage-x", (((event.clientX - rect.left) / rect.width) - .5) * 6);
    stage.style.setProperty("--stage-y", (((event.clientY - rect.top) / rect.height) - .5) * 6);
  });
  stage?.addEventListener("pointerleave", () => { stage.style.setProperty("--stage-x", 0); stage.style.setProperty("--stage-y", 0); });
  const aura = document.querySelector(".cursor-aura");
  window.addEventListener("pointermove", event => {
    aura?.style.setProperty("--cursor-x", `${event.clientX}px`);
    aura?.style.setProperty("--cursor-y", `${event.clientY}px`);
  }, {passive:true});

  document.querySelectorAll(".video-toggle").forEach(button => button.addEventListener("click", () => {
    const video = button.parentElement.querySelector("video");
    if (!video) return;
    if (video.paused) { video.play(); button.textContent = "Pause"; track("video:play"); }
    else { video.pause(); button.textContent = "Play"; }
  }));

  document.querySelectorAll("[data-track]").forEach(link => link.addEventListener("click", () => track(link.dataset.track)));
  document.querySelectorAll("a[href='#contact']").forEach(link => link.addEventListener("click", () => track("cta:contact")));
  document.querySelectorAll("a[href*='wa.me']").forEach(link => link.addEventListener("click", () => track("cta:whatsapp")));

  const form = document.getElementById("portfolioForm");
  const formStatus = document.getElementById("formStatus");
  form?.addEventListener("submit", async event => {
    event.preventDefault();
    formStatus.textContent = "Sending your brief…";
    const submit = form.querySelector("button[type='submit']");
    submit.disabled = true;
    try {
      const response = await fetch("https://formspree.io/f/xjgadypw", {method:"POST", body:new FormData(form), headers:{Accept:"application/json"}});
      if (!response.ok) throw new Error("Request failed");
      track("form:submitted");
      location.href = "thanks.html";
    } catch (_) {
      formStatus.textContent = "Could not send right now. Please use WhatsApp instead.";
      submit.disabled = false;
    }
  });
})();
