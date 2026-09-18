/** A scroll-directed, progressively enhanced physical portfolio edition. */
export async function initBook({ root, projects = [] } = {}) {
  if (!root) return () => {};

  const stage = root.querySelector('.book-stage');
  const fallback = root.querySelector('.book-fallback');
  const status = root.querySelector('.book-status');
  const progressFill = root.querySelector('.book-progress');
  const selected = projects.filter((project) => project?.title).slice(0, 6);
  const edition = selected.length ? [...selected, selected[0]] : []; // Return to the flagship for the portal.
  if (!stage || !edition.length) return () => {};

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  let disposed = false;
  let failed = false;
  let near = false;
  let inView = false;
  let pending = false;
  let generation = 0;
  let frame = 0;
  let graphics = null;
  let lastStatus = '';
  let pointerX = 0;
  let pointerY = 0;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smooth = (value) => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const mix = (start, end, amount) => start + (end - start) * amount;
  const tier = () => {
    if (motionQuery.matches || window.innerWidth <= 767) return 'magazine';
    if (navigator.connection?.saveData && window.innerWidth < 1100) return 'magazine';
    return window.innerWidth < 1100 || navigator.deviceMemory <= 4 || navigator.hardwareConcurrency <= 4 ? 'medium' : 'high';
  };

  function showMagazine(reason = 'fallback') {
    root.classList.remove('book-ready');
    root.dataset.bookMode = 'magazine';
    root.dataset.bookDiagnostic = reason;
    if (fallback) fallback.hidden = false;
    if (status) status.textContent = 'THE INDEPENDENT EDITION / SELECTED WORK';
    lastStatus = '';
  }

  function releaseGraphics() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    generation += 1;
    const current = graphics;
    graphics = null;
    if (!current) return;
    current.canvas.removeEventListener('webglcontextlost', onContextLost);
    current.images.forEach((image) => { image.onload = null; image.onerror = null; });
    current.textures.forEach((texture) => texture.dispose());
    current.geometries.forEach((geometry) => geometry.dispose());
    current.materials.forEach((material) => material.dispose());
    current.shadows.forEach((shadow) => shadow.dispose());
    current.renderer.dispose();
    current.renderer.forceContextLoss();
    current.canvas.remove();
  }

  function onContextLost(event) {
    event.preventDefault();
    failed = true;
    showMagazine('context-lost');
    releaseGraphics();
  }

  function requestFrame() {
    if (disposed || !graphics || !inView || document.hidden || frame) return;
    frame = requestAnimationFrame(draw);
  }

  function onEnvironmentChange() {
    if (!pointerQuery.matches) { pointerX = 0; pointerY = 0; }
    if (tier() === 'magazine') {
      showMagazine('reduced-or-mobile');
      releaseGraphics();
    } else {
      if (near && !graphics && !pending) void start();
      requestFrame();
    }
  }

  function getProgress() {
    const bounds = root.getBoundingClientRect();
    return clamp(-bounds.top / Math.max(1, bounds.height - window.innerHeight));
  }

  function draw() {
    frame = 0;
    const current = graphics;
    if (!current || disposed || !inView || document.hidden) return;
    try {
      const width = Math.max(1, stage.clientWidth);
      const height = Math.max(1, stage.clientHeight);
      if (width !== current.width || height !== current.height) {
        current.width = width;
        current.height = height;
        current.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier() === 'medium' ? 1 : 1.5));
        current.renderer.setSize(width, height, false);
        current.camera.aspect = width / height;
        current.camera.updateProjectionMatrix();
      }

      const p = getProgress();
      const entered = smooth(p / 0.12);
      const rotated = smooth((p - 0.12) / 0.16);
      const opening = p < .45 ? smooth((p - .28) / .17) * .48 : .48 + smooth((p - .45) / .23) * .52;
      const story = clamp((p - 0.68) / 0.20);
      const portal = smooth((p - 0.88) / 0.12);
      const spreadProgress = story * Math.max(0, edition.length - 1);
      const spread = Math.min(edition.length - 1, Math.floor(spreadProgress));
      const local = spreadProgress - spread;
      const turn = smooth((local - 0.24) / 0.60);
      const next = Math.min(edition.length - 1, spread + 1);
      const turning = next !== spread && turn > 0 && turn < 1;

      current.book.position.set(mix(-current.pageWidth / 2, mix(0, -0.9, portal), opening), mix(-0.38, -0.10, entered), 0);
      current.book.rotation.set(mix(-0.12, -0.24, rotated) + pointerY * 0.035, mix(-0.62, -0.42, rotated) + mix(0, 0.5, opening) + pointerX * 0.05, mix(-0.02, -0.045, rotated));
      current.book.scale.setScalar(mix(0.94, mix(1.08, 1.22, portal), entered));
      current.coverPivot.rotation.y = -opening * Math.PI;
      current.coverBoard.castShadow = opening < 0.99;
      current.leftPage.visible = opening > 0.95;
      current.leftPage.material.opacity = smooth((opening - 0.95) / 0.05);

      const visibleHeight = Math.max(6.7, (current.pageWidth * 2 + 1.5) / current.camera.aspect);
      const cameraDistance = visibleHeight / (2 * Math.tan((current.camera.fov * Math.PI) / 360));
      // Give lifted paper room in perspective, clear of the navigation and folio.
      const motionClearance = 1 + Math.sin(opening * Math.PI) * 0.35 + (turning ? Math.sin(turn * Math.PI) * 0.28 : 0);
      const portraitTablet = innerWidth <= 1100 && innerHeight > innerWidth;
      const heroOffset = portraitTablet ? 0 : current.camera.aspect < 1.25 ? -1.25 : -1.9;
      const heroLift = portraitTablet ? mix(2.1, 0, opening) : 0;
      current.camera.position.set(mix(heroOffset, mix(0, 0.6, portal), opening) + pointerX * 0.12, 0.24 + heroLift - pointerY * 0.08, cameraDistance * mix(1.08, mix(.92, .76, portal), entered) * motionClearance);
      current.camera.lookAt(mix(heroOffset, mix(0, .45, portal), opening), heroLift, 0);

      const rightIndex = turn > 0 ? next : spread;
      const leftIndex = turn >= 1 ? next : spread;
      current.leftPage.material.map = current.pageTextures[leftIndex].left;
      current.rightPage.material.map = current.pageTextures[rightIndex].right;
      current.rightPage.position.z = mix(0.108, 1.6, portal);
      current.rightPage.scale.setScalar(mix(1, 1.34, portal));
      current.turnFront.material.map = current.pageTextures[spread].right;
      current.turnBack.material.map = current.pageTextures[next].left;
      current.turnFront.visible = turning && opening > 0.99;
      current.turnBack.visible = current.turnFront.visible;
      if (turning) current.bendPage(turn);

      const labelIndex = turn > 0.72 ? next : spread;
      const label = opening < 0.98 ? 'THE INDEPENDENT EDITION / SCROLL TO OPEN' :
        `${String(labelIndex % selected.length + 1).padStart(2, '0')} / ${String(selected.length).padStart(2, '0')} — ${edition[labelIndex].title.toUpperCase()}`;
      if (status && label !== lastStatus) { status.textContent = label; lastStatus = label; }
      if (progressFill) {
        progressFill.style.transformOrigin = 'left center';
        progressFill.style.transform = `scaleX(${p})`;
      }
      root.style.setProperty('--book-progress', p.toFixed(4));
      root.style.setProperty('--book-open', opening.toFixed(4));
      root.style.setProperty('--book-portal', portal.toFixed(4));
      root.dataset.bookChapter = p < .12 ? 'approach' : p < .28 ? 'rotation' : p < .68 ? 'opening' : p < .84 ? 'edition' : 'portal';
      current.renderer.shadowMap.needsUpdate = true;
      const themeChanging = current.updateTheme?.();
      current.renderer.render(current.scene, current.camera);
      if (themeChanging) requestFrame();
      if (!root.classList.contains('book-ready')) {
        root.classList.add('book-ready');
        root.dataset.bookMode = '3d';
        root.dataset.bookDiagnostic = 'active';
        if (fallback) fallback.hidden = true;
      }
    } catch {
      failed = true;
      showMagazine();
      releaseGraphics();
    }
  }

  async function start() {
    if (disposed || failed || pending || graphics || tier() === 'magazine') return;
    pending = true;
    root.dataset.bookDiagnostic = 'initializing';
    const token = generation;
    let localGraphics;
    try {
      const {
        ACESFilmicToneMapping, BackSide, BoxGeometry, BufferGeometry,
        CanvasTexture, DirectionalLight, DoubleSide, Float32BufferAttribute,
        FrontSide, Group, HemisphereLight, LineBasicMaterial,
        LineSegments, Mesh, MeshBasicMaterial, MeshStandardMaterial,
        PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, SRGBColorSpace,
        Scene, ShadowMaterial, WebGLRenderer,
      } = await import('./book-three.js');
      // Canvas print must use the same loaded, self-hosted type as the edition.
      if (document.fonts) await document.fonts.ready;
      if (disposed || token !== generation || tier() === 'magazine') return;
      const canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
      const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: tier() === 'medium' ? 'low-power' : 'high-performance' });
      if (!context) { failed = true; showMagazine('webgl2-unavailable'); return; }

      const geometries = new Set();
      const materials = new Set();
      const textures = new Set();
      const images = new Set();
      const shadows = new Set();
      const geometry = (value) => { geometries.add(value); return value; };
      const material = (value) => { materials.add(value); return value; };
      const texture = (value) => { textures.add(value); return value; };
      const renderer = new WebGLRenderer({ canvas, context, antialias: true, alpha: true });
      renderer.outputColorSpace = SRGBColorSpace;
      renderer.toneMapping = ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.16;
      renderer.setClearColor(0x08090b, 0);
      renderer.shadowMap.enabled = tier() === 'high';
      renderer.shadowMap.type = PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = false;

      const scene = new Scene();
      const camera = new PerspectiveCamera(35, 1, 0.1, 80);
      const book = new Group();
      scene.add(book);
      const pageWidth = 3.05;
      const pageHeight = 4.15;
      localGraphics = { canvas, renderer, scene, camera, book, pageWidth, geometries, materials, textures, images, shadows, width: 0, height: 0 };
      graphics = localGraphics;

      const ambient = new HemisphereLight(0xf6f1e7, 0x424759, 1.42);
      scene.add(ambient);
      const keyLight = new DirectionalLight(0xfff4e2, 2.15);
      keyLight.position.set(-3.5, 5, 8);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.left = -8;
      keyLight.shadow.camera.right = 8;
      keyLight.shadow.camera.top = 7;
      keyLight.shadow.camera.bottom = -7;
      keyLight.shadow.camera.near = 0.1;
      keyLight.shadow.camera.far = 25;
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = 0.025;
      shadows.add(keyLight.shadow);
      scene.add(keyLight);
      const rim = new DirectionalLight(0x96a9ff, 0.92);
      rim.position.set(5, -1, 4);
      scene.add(rim);

      const mesh = (shape, surface, parent = book) => {
        const result = new Mesh(geometry(shape), material(surface));
        parent.add(result);
        return result;
      };
      const floor = mesh(new PlaneGeometry(36, 26), new ShadowMaterial({ color: 0x000000, opacity: 0.28 }), scene);
      floor.position.z = -0.43;
      floor.receiveShadow = true;

      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = shadowCanvas.height = 128;
      const shadowContext = shadowCanvas.getContext('2d');
      const gradient = shadowContext.createRadialGradient(64, 64, 8, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(0,0,0,.58)');
      gradient.addColorStop(0.55, 'rgba(0,0,0,.28)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      shadowContext.fillStyle = gradient;
      shadowContext.fillRect(0, 0, 128, 128);
      const contactShadow = mesh(new PlaneGeometry(8.6, 6.6), new MeshBasicMaterial({ map: texture(new CanvasTexture(shadowCanvas)), transparent: true, depthWrite: false }), scene);
      contactShadow.position.set(0.15, -0.13, -0.42);

      const paper = { color: 0xeee9dc, roughness: 0.92, metalness: 0 };
      const coverSurface = { color: 0x191a1e, roughness: 0.82, metalness: 0.08 };
      const backCover = mesh(new BoxGeometry(pageWidth + 0.10, pageHeight + 0.14, 0.065), new MeshStandardMaterial(coverSurface));
      backCover.position.set(pageWidth / 2, 0, -0.16);
      backCover.castShadow = true;
      const pageBlock = mesh(new BoxGeometry(pageWidth - 0.025, pageHeight - 0.035, 0.225), new MeshStandardMaterial(paper));
      pageBlock.position.set(pageWidth / 2, 0, -0.008);
      pageBlock.castShadow = true;
      pageBlock.receiveShadow = true;

      // Thin paper-edge striations give the object its scale without expensive geometry.
      const edgePositions = [];
      for (let i = 0; i < 22; i += 1) {
        const z = -0.112 + i * 0.01;
        edgePositions.push(0.04, -pageHeight / 2 + 0.02, z, pageWidth - 0.025, -pageHeight / 2 + 0.02, z);
        edgePositions.push(pageWidth - 0.013, -pageHeight / 2 + 0.02, z, pageWidth - 0.013, pageHeight / 2 - 0.02, z);
      }
      const edgeGeometry = geometry(new BufferGeometry());
      edgeGeometry.setAttribute('position', new Float32BufferAttribute(edgePositions, 3));
      const edges = new LineSegments(edgeGeometry, material(new LineBasicMaterial({ color: 0xada69a, transparent: true, opacity: 0.34 })));
      book.add(edges);

      const spine = mesh(new BoxGeometry(0.11, pageHeight + 0.14, 0.325), new MeshStandardMaterial({ color: 0x203f9b, roughness: 0.72, metalness: 0.08 }));
      spine.position.set(-0.047, 0, -0.008);
      spine.castShadow = true;
      const coverPivot = new Group();
      coverPivot.position.set(0, 0, 0.147);
      book.add(coverPivot);
      const coverBoard = mesh(new BoxGeometry(pageWidth + 0.1, pageHeight + 0.14, 0.073), new MeshStandardMaterial(coverSurface), coverPivot);
      coverBoard.position.set(pageWidth / 2, 0, 0);
      coverBoard.castShadow = true;
      coverBoard.receiveShadow = true;

      const resolution = tier() === 'medium' ? 768 : 1024;
      function newPageCanvas() {
        const result = document.createElement('canvas');
        result.width = resolution;
        result.height = Math.round(resolution * pageHeight / pageWidth);
        return result;
      }
      function canvasTexture(source) {
        const result = texture(new CanvasTexture(source));
        result.colorSpace = SRGBColorSpace;
        result.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        return result;
      }
      function wrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = Infinity) {
        const words = String(text || '').split(/\s+/);
        let line = '';
        let count = 0;
        for (const word of words) {
          const attempt = line ? `${line} ${word}` : word;
          if (ctx.measureText(attempt).width > maxWidth && line) {
            ctx.fillText(line, x, y);
            y += lineHeight;
            count += 1;
            if (count >= maxLines) return y;
            line = word;
          } else line = attempt;
        }
        if (line && count < maxLines) ctx.fillText(line, x, y);
        return y + lineHeight;
      }
      function label(ctx, text, x, y, size = 16, color = '#353734') {
        ctx.fillStyle = color;
        ctx.font = `500 ${size}px "Manrope", "Arial", sans-serif`;
        ctx.fillText(text, x, y);
      }
      function drawContainedImage(ctx, source, x, y, width, height) {
        const scale = Math.min(width / source.naturalWidth, height / source.naturalHeight);
        const drawWidth = source.naturalWidth * scale;
        const drawHeight = source.naturalHeight * scale;
        ctx.drawImage(source, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
      }

      const coverCanvas = newPageCanvas();
      const coverContext = coverCanvas.getContext('2d');
      const cw = coverCanvas.width;
      const ch = coverCanvas.height;
      coverContext.fillStyle = '#191a1e';
      coverContext.fillRect(0, 0, cw, ch);
      // Deterministic, fine cloth grain, generated as a native book material.
      let seed = 67;
      for (let i = 0; i < 42000; i += 1) {
        seed = (seed * 16807) % 2147483647;
        const x = (seed % 10000) / 10000 * cw;
        seed = (seed * 16807) % 2147483647;
        const y = (seed % 10000) / 10000 * ch;
        coverContext.fillStyle = i % 2 ? 'rgba(255,255,255,.018)' : 'rgba(0,0,0,.12)';
        coverContext.fillRect(x, y, 1, 3);
      }
      coverContext.strokeStyle = '#4b4d50';
      coverContext.lineWidth = 1;
      coverContext.strokeRect(cw * 0.066, ch * 0.048, cw * 0.868, ch * 0.904);
      label(coverContext, 'KIRATVEER SINGH RALHAN', cw * 0.102, ch * 0.103, cw * 0.021, '#d9d2c4');
      // Keep the print subdued so the raised metallic KR remains the focal mark.
      coverContext.fillStyle = '#303236';
      coverContext.font = `600 ${cw * 0.27}px "Manrope", Arial, sans-serif`;
      // The raised monogram is the sole mark on this part of the cover.
      coverContext.strokeStyle = '#314fbb';
      coverContext.lineWidth = cw * 0.004;
      coverContext.beginPath();
      coverContext.moveTo(cw * 0.105, ch * 0.425);
      coverContext.lineTo(cw * 0.9, ch * 0.425);
      coverContext.stroke();
      label(coverContext, 'DESIGN × AI × DEVELOPMENT', cw * 0.108, ch * 0.495, cw * 0.021, '#cec8bc');
      label(coverContext, 'DIGITAL PRACTICE', cw * 0.108, ch * 0.524, cw * 0.021, '#cec8bc');
      label(coverContext, 'SELECTED WORK', cw * 0.105, ch * 0.844, cw * 0.021, '#d9d2c4');
      coverContext.font = `400 ${cw * 0.077}px "Instrument Serif", Georgia, serif`;
      coverContext.fillStyle = '#e7dfcf';
      coverContext.fillText('2026', cw * 0.105, ch * 0.905);
      label(coverContext, 'VOL. 01', cw * 0.762, ch * 0.9, cw * 0.019, '#b6b1a7');
      const outerCover = mesh(new PlaneGeometry(pageWidth + 0.087, pageHeight + 0.127), new MeshStandardMaterial({ map: canvasTexture(coverCanvas), roughness: 0.88, metalness: 0.035 }), coverPivot);
      outerCover.position.set(pageWidth / 2, 0, 0.038);
      const relief = new Group();
      relief.position.set(pageWidth * 0.34, 0.55, 0.082);
      coverPivot.add(relief);
      const metal = new MeshStandardMaterial({ color: 0xd3c2a0, emissive: 0x443821, emissiveIntensity: .22, roughness: 0.24, metalness: 0.72 });
      const reliefBar = (w, h, x, y, rotation = 0) => { const bar = mesh(new BoxGeometry(w, h, 0.032), metal, relief); bar.position.set(x, y, 0); bar.rotation.z = rotation; bar.castShadow = true; return bar; };
      reliefBar(.055, .62, 0, 0);
      reliefBar(.055, .39, .13, .135, -.66);
      reliefBar(.055, .39, .13, -.135, .66);
      reliefBar(.055, .62, .43, 0);
      reliefBar(.29, .055, .56, .275);
      reliefBar(.29, .055, .56, .03);
      reliefBar(.055, .28, .7, .15);
      reliefBar(.055, .36, .59, -.14, .62);

      const nightMap = outerCover.material.map;
      const dayCanvas = newPageCanvas();
      const dayContext = dayCanvas.getContext('2d');
      dayContext.drawImage(coverCanvas, 0, 0);
      dayContext.globalCompositeOperation = 'screen';
      dayContext.fillStyle = '#34363a';
      dayContext.fillRect(0, 0, cw, ch);
      const dayMap = canvasTexture(dayCanvas);
      let themeMix = document.documentElement.dataset.theme === 'day' ? 1 : 0;
      let themeTarget = themeMix;
      let themeStarted = 0;
      let themeFrom = themeMix;
      const graphite = coverBoard.material.color.clone().set('#191a1e');
      const stone = graphite.clone().set('#505258');
      const coolRim = rim.color.clone();
      const daylight = rim.color.clone().set('#e4edff');
      localGraphics.setTheme = () => {
        themeFrom = themeMix;
        themeTarget = document.documentElement.dataset.theme === 'day' ? 1 : 0;
        themeStarted = performance.now();
        outerCover.material.map = themeTarget ? dayMap : nightMap;
        requestFrame();
      };
      localGraphics.updateTheme = () => {
        const progress = smooth((performance.now() - themeStarted) / 420);
        themeMix = mix(themeFrom, themeTarget, progress);
        coverBoard.material.color.lerpColors(graphite, stone, themeMix);
        backCover.material.color.copy(coverBoard.material.color);
        ambient.intensity = mix(1.25, 1.65, themeMix);
        keyLight.intensity = mix(2.0, 2.6, themeMix);
        rim.intensity = mix(.95, .65, themeMix);
        rim.color.lerpColors(coolRim, daylight, themeMix);
        metal.roughness = mix(.24, .36, themeMix);
        metal.metalness = mix(.72, .55, themeMix);
        floor.material.opacity = mix(.28, .15, themeMix);
        contactShadow.material.opacity = mix(1, .5, themeMix);
        renderer.toneMappingExposure = mix(1.12, 1.02, themeMix);
        return progress < 1;
      };
      localGraphics.setTheme();

      const insideCanvas = newPageCanvas();
      const insideContext = insideCanvas.getContext('2d');
      insideContext.fillStyle = '#172b66';
      insideContext.fillRect(0, 0, insideCanvas.width, insideCanvas.height);
      label(insideContext, 'A SELECTED VIEW', cw * 0.14, ch * 0.16, cw * 0.023, '#dcd9cf');
      insideContext.fillStyle = '#ddd9cd';
      insideContext.font = `400 ${cw * 0.09}px "Instrument Serif", Georgia, serif`;
      wrappedText(insideContext, 'Ideas, made tangible.', cw * 0.14, ch * 0.49, cw * 0.67, cw * 0.104);
      label(insideContext, 'KIRATVEER SINGH RALHAN', cw * 0.14, ch * 0.86, cw * 0.018, '#c4cbd9');
      const insideCover = mesh(new PlaneGeometry(pageWidth + 0.06, pageHeight + 0.1), new MeshStandardMaterial({ map: canvasTexture(insideCanvas), roughness: 0.92 }), coverPivot);
      insideCover.position.set(pageWidth / 2, 0, -0.038);
      insideCover.rotation.y = Math.PI;

      const pageTextures = selected.map((project, index) => {
        const leftCanvas = newPageCanvas();
        const rightCanvas = newPageCanvas();
        const left = canvasTexture(leftCanvas);
        const right = canvasTexture(rightCanvas);

        function paint(source) {
          const w = leftCanvas.width;
          const h = leftCanvas.height;
          const a = leftCanvas.getContext('2d');
          a.fillStyle = '#eeeadf';
          a.fillRect(0, 0, w, h);
          label(a, 'KIRAT / SELECTED WORK', w * 0.105, h * 0.071, w * 0.018);
          a.fillStyle = '#2546af';
          a.font = `400 ${w * 0.24}px "Instrument Serif", Georgia, serif`;
          a.fillText(String(index % selected.length + 1).padStart(2, '0'), w * 0.1, h * 0.276);
          a.strokeStyle = '#b7b3a8';
          a.beginPath(); a.moveTo(w * 0.105, h * 0.322); a.lineTo(w * 0.88, h * 0.322); a.stroke();
          a.fillStyle = '#191a1c';
          a.font = `400 ${w * 0.103}px "Instrument Serif", Georgia, serif`;
          const titleEnd = wrappedText(a, project.title, w * 0.1, h * 0.422, w * 0.79, w * 0.112, 3);
          a.font = `500 ${w * 0.024}px "Manrope", Arial, sans-serif`;
          wrappedText(a, String(project.category || 'Digital experience').toUpperCase(), w * 0.105, Math.max(titleEnd + h * 0.025, h * 0.525), w * 0.76, w * 0.039, 3);
          a.fillStyle = '#4b4b47';
          a.font = `400 ${w * 0.027}px "Manrope", Arial, sans-serif`;
          wrappedText(a, project.description || project.summary || 'An independent project by Kiratveer Singh Ralhan.', w * 0.105, h * 0.688, w * 0.76, w * 0.044, 5);
          label(a, 'THE INDEPENDENT EDITION', w * 0.105, h * 0.942, w * 0.016, '#68695f');

          const b = rightCanvas.getContext('2d');
          b.fillStyle = '#f4f0e7';
          b.fillRect(0, 0, w, h);
          label(b, `${String(index % selected.length + 1).padStart(2, '0')} / ${project.title.toUpperCase()}`, w * 0.075, h * 0.071, w * 0.018);
          b.fillStyle = index === 0 ? '#111820' : '#e2dfd7';
          b.fillRect(w * 0.065, h * 0.132, w * 0.87, h * 0.69);
          if (source) drawContainedImage(b, source, w * 0.065, h * 0.132, w * 0.87, h * 0.69);
          else {
            b.fillStyle = index === 0 ? '#f0ece0' : '#22252b';
            b.font = `400 ${w * 0.088}px "Instrument Serif", Georgia, serif`;
            wrappedText(b, project.title, w * 0.13, h * 0.42, w * 0.72, w * 0.101, 3);
            label(b, 'PROJECT STUDY', w * 0.13, h * 0.71, w * 0.02, index === 0 ? '#a7b4ce' : '#666761');
          }
          b.font = `400 ${w * 0.018}px "Manrope", Arial, sans-serif`;
          b.fillStyle = '#55574f';
          wrappedText(b, project.imageNote || 'Selected project artwork.', w * 0.075, h * 0.867, w * 0.80, w * 0.028, 3);
          label(b, `K / ${String(index % selected.length + 1).padStart(2, '0')}`, w * 0.805, h * 0.946, w * 0.017, '#66685f');
          left.needsUpdate = true;
          right.needsUpdate = true;
          requestFrame();
        }
        paint();
        if (project.image) {
          const source = new Image();
          images.add(source);
          source.decoding = 'async';
          source.onload = () => {
            if (!disposed && token === generation && graphics === localGraphics && source.naturalWidth) paint(source);
            source.onload = null;
            source.onerror = null;
          };
          source.onerror = () => { source.onload = null; source.onerror = null; };
          source.src = project.image;
        }
        return { left, right };
      });

      pageTextures.push(pageTextures[0]);

      const rightPage = mesh(new PlaneGeometry(pageWidth, pageHeight), new MeshStandardMaterial({ map: pageTextures[0].right, roughness: 0.92 }));
      rightPage.position.set(pageWidth / 2, 0, 0.108);
      rightPage.receiveShadow = true;
      const leftPage = mesh(new PlaneGeometry(pageWidth, pageHeight), new MeshStandardMaterial({ map: pageTextures[0].left, roughness: 0.92, transparent: true }));
      leftPage.position.set(-pageWidth / 2, 0, 0.19);
      leftPage.receiveShadow = true;
      leftPage.visible = false;

      const segmentsX = tier() === 'medium' ? 32 : 56;
      const segmentsY = 8;
      const turnGeometry = geometry(new PlaneGeometry(pageWidth, pageHeight, segmentsX, segmentsY));
      const backGeometry = geometry(turnGeometry.clone());
      const backUvs = backGeometry.getAttribute('uv');
      for (let i = 0; i < backUvs.count; i += 1) backUvs.setX(i, 1 - backUvs.getX(i));
      backUvs.needsUpdate = true;
      // Both sides share positions/normals; only the back's print coordinates differ.
      backGeometry.setAttribute('position', turnGeometry.getAttribute('position'));
      backGeometry.setAttribute('normal', turnGeometry.getAttribute('normal'));
      const turnFront = new Mesh(turnGeometry, material(new MeshStandardMaterial({ map: pageTextures[0].right, roughness: 0.92, side: FrontSide, shadowSide: DoubleSide })));
      const turnBack = new Mesh(backGeometry, material(new MeshStandardMaterial({ map: pageTextures[Math.min(1, edition.length - 1)].left, roughness: 0.92, side: BackSide, shadowSide: DoubleSide })));
      book.add(turnFront, turnBack);
      turnFront.position.z = turnBack.position.z = 0.195;
      turnFront.castShadow = true;
      turnBack.castShadow = true;
      turnFront.receiveShadow = true;
      turnBack.receiveShadow = true;
      turnFront.frustumCulled = false;
      turnBack.frustumCulled = false;
      turnFront.visible = turnBack.visible = false;

      function bendPage(amount) {
        const positions = turnGeometry.getAttribute('position');
        const arc = Math.PI * amount;
        const curl = Math.sin(arc) * 0.46;
        const xs = [0];
        const zs = [0];
        const step = pageWidth / segmentsX;
        for (let column = 1; column <= segmentsX; column += 1) {
          const u = (column - 0.5) / segmentsX;
          const tangent = -arc + curl * Math.pow(u, 1.15);
          xs[column] = xs[column - 1] + Math.cos(tangent) * step;
          zs[column] = zs[column - 1] - Math.sin(tangent) * step;
        }
        for (let row = 0; row <= segmentsY; row += 1) {
          const v = row / segmentsY;
          for (let column = 0; column <= segmentsX; column += 1) {
            const u = column / segmentsX;
            const index = row * (segmentsX + 1) + column;
            const flex = Math.sin(arc) * Math.sin(u * Math.PI) * 0.036;
            positions.setXYZ(index, xs[column], (0.5 - v) * pageHeight + flex * Math.sin(v * Math.PI), zs[column] + flex * Math.pow(v * 2 - 1, 2));
          }
        }
        positions.needsUpdate = true;
        turnGeometry.computeVertexNormals();
      }

      Object.assign(localGraphics, { coverPivot, coverBoard, leftPage, rightPage, turnFront, turnBack, pageTextures, bendPage });
      canvas.addEventListener('webglcontextlost', onContextLost);
      stage.prepend(canvas);
      requestFrame();
    } catch {
      failed = true;
      showMagazine('initialization-failed');
      if (graphics === localGraphics) releaseGraphics();
    } finally {
      pending = false;
      if (!disposed && !failed && near && !graphics && tier() !== 'magazine') void start();
    }
  }

  showMagazine(tier() === 'magazine' ? 'reduced-or-mobile' : 'awaiting-viewport');
  const lazyObserver = typeof IntersectionObserver === 'function' ? new IntersectionObserver((entries) => {
    near = entries[0].isIntersecting;
    if (near) void start();
  }, { rootMargin: '600px 0px' }) : null;
  const visibilityObserver = typeof IntersectionObserver === 'function' ? new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    if (inView) requestFrame();
    else if (frame) { cancelAnimationFrame(frame); frame = 0; }
  }) : null;
  lazyObserver?.observe(root);
  visibilityObserver?.observe(root);
  const initialBounds = root.getBoundingClientRect();
  near = initialBounds.bottom >= -600 && initialBounds.top <= window.innerHeight + 600;
  inView = initialBounds.bottom > 0 && initialBounds.top < window.innerHeight;
  if (!lazyObserver || near) void start();

  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(requestFrame) : null;
  resizeObserver?.observe(stage);
  window.addEventListener('scroll', requestFrame, { passive: true });
  const onPointerMove = (event) => { if (!pointerQuery.matches || event.pointerType === 'touch' || !inView) return; pointerX = event.clientX / Math.max(1, innerWidth) - .5; pointerY = event.clientY / Math.max(1, innerHeight) - .5; requestFrame(); };
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  const onTheme = () => graphics?.setTheme();
  window.addEventListener('kirat:theme', onTheme);
  window.addEventListener('resize', onEnvironmentChange, { passive: true });
  window.addEventListener('orientationchange', onEnvironmentChange, { passive: true });
  document.addEventListener('visibilitychange', requestFrame);
  motionQuery.addEventListener('change', onEnvironmentChange);
  pointerQuery.addEventListener('change', onEnvironmentChange);

  return () => {
    disposed = true;
    lazyObserver?.disconnect();
    visibilityObserver?.disconnect();
    resizeObserver?.disconnect();
    window.removeEventListener('kirat:theme', onTheme);
    window.removeEventListener('scroll', requestFrame);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', onEnvironmentChange);
    window.removeEventListener('orientationchange', onEnvironmentChange);
    document.removeEventListener('visibilitychange', requestFrame);
    motionQuery.removeEventListener('change', onEnvironmentChange);
    pointerQuery.removeEventListener('change', onEnvironmentChange);
    releaseGraphics();
    showMagazine();
    root.style.removeProperty('--book-progress');
    root.style.removeProperty('--book-open');
    root.style.removeProperty('--book-portal');
  };
}
