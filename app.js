(() => {
  "use strict";
  const STORAGE_KEY = "kiratveerStudioContentV5";
  const ANALYTICS_KEY = "kiratveerStudioAnalyticsV1";
  const defaults = window.KS_DEFAULTS || {projects: [], references: []};
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (_) { saved = {}; }

  const keyOf = value => String(value || "").trim().toLowerCase();
  const mergeCollection = (savedItems, defaultItems, labelKey = "title") => {
    if (!Array.isArray(savedItems) || !savedItems.length) return Array.isArray(defaultItems) ? defaultItems : [];
    const defaultsById = new Map((defaultItems || []).map((item, index) => [keyOf(item.id || item[labelKey] || index), item]));
    const defaultsByName = new Map((defaultItems || []).map(item => [keyOf(item[labelKey] || item.name), item]));
    return savedItems.map((item, index) => {
      const fallback = defaultsById.get(keyOf(item.id || item[labelKey] || index)) || defaultsByName.get(keyOf(item[labelKey] || item.name)) || (defaultItems || [])[index] || {};
      return {...fallback, ...item, image: item.image || fallback.image || ""};
    });
  };

  const data = {
    ...defaults,
    ...saved,
    projects: mergeCollection(saved.projects, defaults.projects, "title"),
    references: mergeCollection(saved.references, defaults.references, "name")
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
  const safeMedia = value => /^(https?:\/\/|data:image\/|[\w./-]+\.(?:jpg|jpeg|png|webp|gif)(?:\?.*)?$)/i.test(String(value || "")) ? String(value) : "";
  const fallbackPng = src => {
    const value = String(src || "");
    if (!value) return "";
    if (/logo-premium-display\.webp/i.test(value)) return "logo-premium.png";
    return value.replace(/\.webp(?:\?.*)?$/i, ".png");
  };
  const defaultProjectImage = (project, index) => {
    const source = (defaults.projects || []).find(item => keyOf(item.id) === keyOf(project.id) || keyOf(item.title) === keyOf(project.title)) || (defaults.projects || [])[index] || {};
    return safeMedia(source.image) || "";
  };
  const defaultReferenceImage = (item, index) => {
    const source = (defaults.references || []).find(ref => keyOf(ref.name) === keyOf(item.name)) || (defaults.references || [])[index] || {};
    return safeMedia(source.image) || "";
  };
  const fallbackAttrs = fallback => {
    const first = safeMedia(fallback) || "";
    const final = safeMedia(fallbackPng(first)) || "";
    return `${first ? ` data-fallback="${esc(first)}"` : ""}${final && final !== first ? ` data-fallback-final="${esc(final)}"` : ""}`;
  };
  function attachImageFallbacks() {
    document.querySelectorAll("img").forEach(img => {
      if (img.dataset.fallbackReady) return;
      img.dataset.fallbackReady = "1";
      img.classList.toggle("is-loaded", img.complete && img.naturalWidth > 0);
      img.addEventListener("load", () => img.classList.add("is-loaded"));
      img.addEventListener("error", () => {
        const next = img.dataset.fallback || "";
        const final = img.dataset.fallbackFinal || "";
        const current = img.getAttribute("src") || "";
        if (next && current !== next) {
          img.dataset.fallback = final;
          img.removeAttribute("srcset");
          img.src = next;
          return;
        }
        if (final && current !== final) {
          img.dataset.fallbackFinal = "";
          img.src = final;
          return;
        }
        img.classList.add("image-missing");
      });
    });
  }
  function preloadStudioImages() {
    const sources = new Set(["logo-premium-display.webp", "logo-premium.png"]);
    [...(defaults.projects || []), ...(defaults.references || []), ...(data.projects || []), ...(data.references || [])]
      .map(item => safeMedia(item.image))
      .filter(Boolean)
      .forEach(src => sources.add(src));
    sources.forEach(src => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
    });
  }

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
      const fallback = defaultProjectImage(project, index);
      const image = safeMedia(project.image) || fallback;
      const url = safeUrl(project.url);
      return `<article class="project-card" style="--project-color:${esc(project.color || "#222")}" data-project-id="${esc(project.id || index)}">
        <div class="project-visual">
          ${image ? `<img src="${esc(image)}"${fallbackAttrs(fallback || fallbackPng(image))} alt="${esc(project.title)} project preview" width="1536" height="1024" loading="eager" decoding="async" fetchpriority="${index < 2 ? "high" : "auto"}">` : `<div class="project-monogram">${esc(project.monogram || project.title.slice(0,2))}</div>`}
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
      const fallback = defaultReferenceImage(item, index);
      const image = safeMedia(item.image) || fallback;
      return `<article class="reference-card${image ? " has-image" : ""}" style="--ref-color:${esc(item.color || "#ccc")}">
        ${image ? `<img class="reference-image" src="${esc(image)}"${fallbackAttrs(fallback || fallbackPng(image))} alt="AI-generated visual for ${esc(item.name)}" width="1536" height="1024" loading="eager" decoding="async"><span class="reference-shade"></span>` : ""}
        <span>${String(index + 1).padStart(2,"0")} / ${esc(item.type)}</span>
        <strong>${esc(item.name)}</strong><p>${esc(item.note)}</p>
        ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="Open ${esc(item.name)}" data-track="reference:${esc(item.name)}">↗</a>` : ""}
      </article>`;
    }).join("");
  }
  attachImageFallbacks();
  preloadStudioImages();
  window.addEventListener("load", attachImageFallbacks, {once:true});

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
    setTimeout(closeIntro, 3300);
    setTimeout(() => {
      if (document.body.classList.contains("intro-lock")) document.body.classList.remove("intro-lock");
      document.body.classList.add("page-ready");
      intro?.classList.add("is-gone");
    }, 6100);
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
  const compactMedia = window.matchMedia("(max-width: 760px)");
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
    if (!compactMedia.matches) {
      carousel.timer = window.setInterval(() => { if (!carousel.paused && !document.hidden) moveCarousel(name, 1); }, delay);
    }
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

  const mediaVideos = Array.from(document.querySelectorAll(".media-card video"));
  const mobileMediaMode = window.matchMedia("(max-width: 760px)");
  const updateVideoCard = video => {
    const card = video.closest(".media-card");
    const button = card?.querySelector(".video-toggle");
    const playing = !video.paused && !video.ended;
    card?.classList.toggle("is-playing", playing);
    card?.classList.toggle("is-ready", video.readyState >= 2);
    if (button) {
      button.textContent = playing ? "Pause" : "Play";
      button.setAttribute("aria-label", `${playing ? "Pause" : "Play"} ${card?.querySelector("h3")?.textContent || "video"}`);
    }
  };
  mediaVideos.forEach(video => {
    video.muted = true;
    video.playsInline = true;
    video.controls = true;
    video.preload = mobileMediaMode.matches ? "metadata" : "auto";
    if (mobileMediaMode.matches) {
      video.autoplay = false;
      video.removeAttribute("autoplay");
      video.pause();
    } else {
      video.autoplay = true;
      video.setAttribute("autoplay", "");
    }
    const setVideoFormat = () => {
      const card = video.closest(".media-card");
      const portrait = video.videoHeight > video.videoWidth;
      card?.classList.toggle("is-portrait", portrait);
      card?.classList.toggle("is-landscape", !portrait);
    };
    ["loadeddata","canplay","play","pause","ended"].forEach(type => video.addEventListener(type, () => updateVideoCard(video)));
    video.addEventListener("loadedmetadata", setVideoFormat);
    video.addEventListener("error", () => video.closest(".media-card")?.classList.add("video-error"));
    const attempt = () => video.play().catch(() => updateVideoCard(video));
    if (video.readyState >= 1) setVideoFormat();
    if (!mobileMediaMode.matches) {
      if (video.readyState >= 2) attempt();
      else video.addEventListener("canplay", attempt, {once:true});
    }
    updateVideoCard(video);
  });
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      const video = entry.target;
      if (entry.intersectionRatio > .75) video.play().catch(() => updateVideoCard(video));
      else if (!video.paused) video.pause();
    }), {threshold:[0,.75,.9]});
    mediaVideos.forEach(video => videoObserver.observe(video));
  }
  document.querySelectorAll(".video-toggle").forEach(button => button.addEventListener("click", () => {
    const video = button.closest(".media-card")?.querySelector("video");
    if (!video) return;
    if (video.paused) {
      video.dataset.userPlayed = "true";
      video.preload = "auto";
      video.play().then(() => track("video:play")).catch(() => updateVideoCard(video));
    } else { video.pause(); track("video:pause"); }
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
