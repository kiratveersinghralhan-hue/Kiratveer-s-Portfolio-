(() => {
  "use strict";
  const STORAGE_KEY = "kiratveerStudioContentV5";
  const ANALYTICS_KEY = "kiratveerStudioAnalyticsV1";
  const defaults = window.KS_DEFAULTS || {projects: [], references: []};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(max-width: 760px)").matches;
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const esc = (value = "") => String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const safeUrl = value => /^(https?:\/\/|mailto:)/i.test(String(value || "")) ? String(value) : "";
  const safeMedia = value => /^(https?:\/\/|data:image\/|[\w./-]+\.(?:jpg|jpeg|png|webp|gif)(?:\?.*)?$)/i.test(String(value || "")) ? String(value) : "";

  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (_) {}
  const keyOf = v => String(v || "").trim().toLowerCase();
  const mergeCollection = (savedItems, defaultItems, labelKey = "title") => {
    if (!Array.isArray(savedItems) || !savedItems.length) return defaultItems || [];
    return savedItems.map((item, i) => {
      const match = (defaultItems || []).find(d => keyOf(d.id) === keyOf(item.id) || keyOf(d[labelKey]) === keyOf(item[labelKey])) || defaultItems?.[i] || {};
      return {...match, ...item, image:item.image || match.image || ""};
    });
  };
  const data = {...defaults, ...saved, projects:mergeCollection(saved.projects, defaults.projects, "title"), references:mergeCollection(saved.references, defaults.references, "name")};

  function imageFallbacks(){
    document.querySelectorAll("img").forEach(img => {
      if (img.dataset.fallbackReady) return;
      img.dataset.fallbackReady = "1";
      img.addEventListener("error", () => {
        const next = img.dataset.fallback;
        if (next && img.src.indexOf(next) === -1) img.src = next;
      });
    });
  }

  function track(name){
    try {
      const state = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '{"events":{}}');
      state.events = state.events || {};
      state.events[name] = (state.events[name] || 0) + 1;
      state.lastVisit = new Date().toISOString();
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  const projectRoot = document.getElementById("projectStories");
  if (projectRoot) {
    projectRoot.innerHTML = (data.projects || []).map((project, index) => {
      const url = safeUrl(project.url);
      const image = safeMedia(project.image) || safeMedia(defaults.projects?.[index]?.image) || "";
      return `<article class="project-story" data-project="${index}" data-scene="project-${index}">
        <a class="project-visual" ${url ? `href="${esc(url)}" target="_blank" rel="noopener"` : ""} aria-label="${url ? `Open ${esc(project.title)}` : esc(project.title)}">
          ${image ? `<img src="${esc(image)}" data-fallback="${esc(String(image).replace(/\.webp(?:\?.*)?$/i,'.png'))}" alt="${esc(project.title)} project visual" loading="${index < 2 ? 'eager' : 'lazy'}" decoding="async">` : ""}
          <span class="project-no">PROJECT ${String(index + 1).padStart(2,"0")} / ${String(data.projects.length).padStart(2,"0")}</span>
        </a>
        <div class="project-copy">
          <span class="status"><i></i>${esc(project.status || "Selected work")}</span>
          <h3>${esc(project.title)}</h3>
          <span class="category">${esc(project.category || "Digital Project")}</span>
          <p>${esc(project.description || "")}</p>
          <div class="project-tags">${(project.tags || []).map(t => `<span>${esc(t)}</span>`).join("")}</div>
          ${url ? `<a class="project-link" href="${esc(url)}" target="_blank" rel="noopener" data-track="project:${esc(project.id || index)}">Visit live project <b>↗</b></a>` : `<span class="project-built">CURRENTLY IN DEVELOPMENT</span>`}
        </div>
      </article>`;
    }).join("");
  }
  imageFallbacks();

  const boot = document.getElementById("boot");
  const finishBoot = () => boot?.classList.add("done");
  window.addEventListener("load", () => setTimeout(finishBoot, reduceMotion ? 100 : 650), {once:true});
  setTimeout(finishBoot, reduceMotion ? 200 : 2800);

  const header = document.querySelector(".site-header");
  const menu = document.getElementById("mobileNav");
  const menuButton = document.getElementById("menuButton");
  const setMenu = open => {
    menu?.classList.toggle("open", open); document.body.classList.toggle("menu-open", open);
    menuButton?.setAttribute("aria-expanded", String(open));
  };
  menuButton?.addEventListener("click", () => setMenu(!menu?.classList.contains("open")));
  document.getElementById("mobileClose")?.addEventListener("click", () => setMenu(false));
  menu?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  document.addEventListener("pointermove", e => {
    document.documentElement.style.setProperty("--cx", `${e.clientX}px`);
    document.documentElement.style.setProperty("--cy", `${e.clientY}px`);
  }, {passive:true});
  document.querySelectorAll("a,button,.project-visual").forEach(el => {
    el.addEventListener("pointerenter", () => document.body.classList.add("cursor-active"));
    el.addEventListener("pointerleave", () => document.body.classList.remove("cursor-active"));
  });
  if (!mobile && !reduceMotion) document.querySelectorAll(".magnetic").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.12}px)`;
    });
    el.addEventListener("pointerleave", () => el.style.transform = "");
  });

  let scrollY = window.scrollY, smoothY = scrollY;
  const projectEls = [...document.querySelectorAll(".project-story")];
  const process = document.querySelector(".process");
  const updateDomMotion = () => {
    scrollY = window.scrollY;
    smoothY = reduceMotion ? scrollY : lerp(smoothY, scrollY, .085);
    header?.classList.toggle("scrolled", scrollY > 20);
    const vh = innerHeight;
    projectEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      const p = clamp((vh - rect.top) / (vh + rect.height));
      const focus = clamp(1 - Math.abs(p - .5) * 2);
      el.style.setProperty("--focus", focus.toFixed(3));
      el.style.setProperty("--travel", (p - .5).toFixed(3));
    });
    if (process) {
      const rect = process.getBoundingClientRect();
      const p = clamp((vh - rect.top) / (rect.height + vh));
      process.style.setProperty("--process", `${Math.round(p * 100)}%`);
    }
    requestAnimationFrame(updateDomMotion);
  };
  requestAnimationFrame(updateDomMotion);

  document.querySelectorAll("[data-track]").forEach(el => el.addEventListener("click", () => track(el.dataset.track)));
  document.querySelectorAll("a[href='#contact']").forEach(el => el.addEventListener("click", () => track("cta:contact")));
  document.querySelectorAll("a[href*='wa.me']").forEach(el => el.addEventListener("click", () => track("cta:whatsapp")));

  document.querySelectorAll(".film-strip article").forEach(card => {
    const video = card.querySelector("video"), button = card.querySelector(".video-play");
    if (!video || !button) return;
    const sync = () => { const playing = !video.paused; card.classList.toggle("playing", playing); button.textContent = playing ? "PAUSE" : "PLAY"; };
    button.addEventListener("click", () => { if (video.paused) video.play().catch(()=>{}); else video.pause(); sync(); });
    video.addEventListener("play", sync); video.addEventListener("pause", sync); video.addEventListener("ended", sync);
  });

  const form = document.getElementById("portfolioForm");
  const formStatus = document.getElementById("formStatus");
  form?.addEventListener("submit", async e => {
    e.preventDefault();
    const button = form.querySelector("button[type='submit']");
    if (formStatus) formStatus.textContent = "Sending your brief…";
    if (button) button.disabled = true;
    try {
      const response = await fetch("https://formspree.io/f/xjgadypw", {method:"POST",body:new FormData(form),headers:{Accept:"application/json"}});
      if (!response.ok) throw new Error("send failed");
      track("form:submitted"); location.href = "thanks.html";
    } catch (_) {
      if (formStatus) formStatus.textContent = "Could not send right now — WhatsApp me instead.";
      if (button) button.disabled = false;
    }
  });

  if (!reduceMotion && !mobile) initThree();
  async function initThree(){
    const canvas = document.getElementById("webgl"); if (!canvas) return;
    try {
      const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js");
      const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:"high-performance"});
      renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));
      renderer.setSize(innerWidth,innerHeight,false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050608,.027);
      const camera = new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,180);
      camera.position.set(0,0,10);

      const ambient = new THREE.AmbientLight(0x9dc8ff,1.4); scene.add(ambient);
      const key = new THREE.PointLight(0xb8ff4a,40,45,2); key.position.set(4,5,5); scene.add(key);
      const fill = new THREE.PointLight(0x76d6ff,32,45,2); fill.position.set(-6,-2,-10); scene.add(fill);

      const heroGroup = new THREE.Group(); scene.add(heroGroup);
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2.1,2),new THREE.MeshPhysicalMaterial({color:0x11161b,metalness:.72,roughness:.2,transmission:.06,clearcoat:1,clearcoatRoughness:.16,emissive:0x1d2a10,emissiveIntensity:.45}));
      heroGroup.add(core);
      [2.8,3.45,4.15].forEach((radius,i)=>{
        const ring = new THREE.Mesh(new THREE.TorusGeometry(radius,.018 + i*.006,8,180),new THREE.MeshBasicMaterial({color:i===1?0x76d6ff:0xb8ff4a,transparent:true,opacity:.28-i*.045}));
        ring.rotation.set(Math.PI/(2.5+i*.45),.3+i*.7,.1); heroGroup.add(ring);
      });
      heroGroup.position.set(4.7,.2,-2.5);

      const starsGeo = new THREE.BufferGeometry();
      const starCount=1500, pos=new Float32Array(starCount*3);
      for(let i=0;i<starCount;i++){pos[i*3]=(Math.random()-.5)*55;pos[i*3+1]=(Math.random()-.5)*30;pos[i*3+2]=8-Math.random()*88;}
      starsGeo.setAttribute("position",new THREE.BufferAttribute(pos,3));
      const stars = new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xbcc8d7,size:.035,transparent:true,opacity:.58,sizeAttenuation:true})); scene.add(stars);

      const shards = new THREE.Group(); scene.add(shards);
      for(let i=0;i<34;i++){
        const geo = new THREE.OctahedronGeometry(.12+Math.random()*.32,0);
        const mat = new THREE.MeshStandardMaterial({color:i%3===0?0xb8ff4a:0x18202a,metalness:.75,roughness:.25,emissive:i%3===0?0x30400d:0x000000,emissiveIntensity:.3});
        const mesh = new THREE.Mesh(geo,mat); mesh.position.set((Math.random()-.5)*16,(Math.random()-.5)*10,-5-Math.random()*66); mesh.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3); mesh.userData.speed=.15+Math.random()*.35; shards.add(mesh);
      }

      const tunnel = new THREE.Group(); scene.add(tunnel);
      for(let i=0;i<10;i++){
        const ring = new THREE.Mesh(new THREE.TorusGeometry(6.5+i%2*.6,.012,6,160),new THREE.MeshBasicMaterial({color:i%3===0?0xb8ff4a:0x76d6ff,transparent:true,opacity:.09}));
        ring.position.z=-8-i*8.5; ring.rotation.x=Math.PI/2; ring.rotation.z=i*.18; tunnel.add(ring);
      }

      const planeGroups=[];
      const loader = new THREE.TextureLoader();
      (data.projects || []).slice(0,5).forEach((project,i)=>{
        const src=safeMedia(project.image); if(!src)return;
        const g=new THREE.Group(); const tex=loader.load(src); tex.colorSpace=THREE.SRGBColorSpace;
        const plane=new THREE.Mesh(new THREE.PlaneGeometry(4.8,3.15),new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.78,toneMapped:false}));
        const frame=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(5.05,3.4,.12)),new THREE.LineBasicMaterial({color:i%2?0x76d6ff:0xb8ff4a,transparent:true,opacity:.35}));
        g.add(plane,frame); g.position.set(i%2===0?-5.4:5.4,((i%3)-1)*1.15,-12-i*11.5); g.rotation.y=i%2===0?.48:-.48; g.rotation.z=(i-2)*.015; scene.add(g); planeGroups.push(g);
      });

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0,0,11),new THREE.Vector3(-1,.4,2),new THREE.Vector3(1,-.5,-12),new THREE.Vector3(-1.2,.6,-27),new THREE.Vector3(1.1,-.6,-43),new THREE.Vector3(-.6,.3,-59),new THREE.Vector3(0,0,-72)
      ]);
      const look = new THREE.Vector3(); let progress=0, targetProgress=0;
      let mx=0,my=0; window.addEventListener("pointermove",e=>{mx=(e.clientX/innerWidth-.5);my=(e.clientY/innerHeight-.5);},{passive:true});
      const clock=new THREE.Clock();
      function render(){
        const max=Math.max(1,document.documentElement.scrollHeight-innerHeight); targetProgress=clamp(window.scrollY/max); progress=lerp(progress,targetProgress,.035);
        const p=curve.getPointAt(progress); const p2=curve.getPointAt(Math.min(.999,progress+.012));
        camera.position.lerp(new THREE.Vector3(p.x+mx*.55,p.y-my*.38,p.z),.14); look.lerp(p2,.12); camera.lookAt(look);
        const t=clock.getElapsedTime(); heroGroup.rotation.x=t*.11; heroGroup.rotation.y=t*.19; core.rotation.z=t*.13;
        heroGroup.position.y=Math.sin(t*.7)*.18; key.position.x=4+Math.sin(t*.55)*2; fill.position.y=-2+Math.cos(t*.46)*1.5;
        stars.rotation.z=t*.008; tunnel.rotation.z=t*.012;
        shards.children.forEach((m,i)=>{m.rotation.x+=.002*m.userData.speed;m.rotation.y+=.003*m.userData.speed;m.position.x+=Math.sin(t*.4+i)*.0008;});
        planeGroups.forEach((g,i)=>{g.position.y+=Math.sin(t*.5+i)*.0012;});
        renderer.render(scene,camera); requestAnimationFrame(render);
      }
      render(); document.body.classList.add("webgl-ready");
      addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setSize(innerWidth,innerHeight,false);});
    } catch (err) { console.warn("3D scene unavailable; using visual fallback.", err); }
  }
})();
