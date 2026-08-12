import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ────────────────────────────────────────────────────────────────────────
   Pikadon 3D Pageflip Folio — High-Performance Editorial Hero Component

   Features:
   - Full-bleed smooth cross-fade background slideshow featuring dark-skinned
     children studio photography pointing directly at PIKADON.
   - Dynamic 3D page flip with physical cylinder bending & shadow-mapped lighting.
   - Non-blocking wheel & touch scrolling:
     - Scrolling down flips pages until the last page (SHEETS), then naturally
       scrolls past the hero section down the page.
     - Mobile vertical swiping passes through naturally to allow page scrolling.
   - GPU & battery optimized:
     - IntersectionObserver pauses rendering loop when scrolled out of view.
     - Adaptive geometry & texture resolution tailored for mobile vs desktop.
   ──────────────────────────────────────────────────────────────────────── */

/* The page photos (Pikadon early childhood & campus editorial). */
const IMAGES = [
  "hero-slides/slide1.jpg",
  "hero-slides/slide2.jpg",
  "hero-slides/slide3.webp",
  "hero-slides/slide4.jpg",
  "hero-slides/slide5.jpg",
  "hero-slides/slide6.jpg",
  "standards-cards/card1.jpg",
  "standards-cards/card2.jpg",
  "standards-cards/card3.webp",
  "our-promise-hero.webp",
  "founders-portrait.jpg",
  "hero-slides/slide2.jpg",
];

// Full-bleed Hero section background slideshow of dark-skinned children studio images
const BG_SLIDES = [
  {
    src: "black-child-pointing-pikadon.jpg",
    alt: "Dark-skinned Black child pointing directly at PIKADON",
    bgColor: "#EFA825",
  },
  {
    src: "black-child-peeking-pikadon.jpg",
    alt: "Dark-skinned Black child peeking behind PIKADON poster board",
    bgColor: "#FAF8F5",
  },
  {
    src: "black-child-astronaut.jpg",
    alt: "Dark-skinned Black child astronaut dreaming big",
    bgColor: "#ECEAE6",
  },
  {
    src: "black-child-blocks.jpg",
    alt: "Dark-skinned Black child playing with Montessori blocks",
    bgColor: "#E5E1D8",
  },
];

// One short caption per page (drawn small over the photo), and a section kicker.
const CAPTIONS = [
  "SAFE & HYGIENIC",
  "SENSORY PLAY",
  "EARLY LITERACY",
  "DAILY RHYTHM",
  "PIKADON FAMILY",
  "VETTED CARE",
  "SANITIZED SPACES",
  "STRUCTURED DAY",
  "DISCOVERY",
  "STORY CORNER",
  "ENGAGED PLAY",
  "MONTESSORI TOOLS",
];

// Book / page geometry, in world units (page aspect ≈ 2.1 : 3.0 for a larger spread).
const PW = 2.1;            // page width (spine → outer edge)
const PH = 3.0;            // page height
const NIMG = 12;
const SHEETS = NIMG / 2;   // physical leaves
const PAGE_Y = 0.012;      // pages float a hair above the surface
const PER_SHEET = 0.011;   // thickness one leaf adds to a stack
const BEND_MAX = 1.42;     // peak curl angle of the turning leaf (radians)
const LEAD = 0.22;         // diagonal corner-lead of the turn
const FLIP_MS = 850;       // snappy auto-flip duration

export default function ScrollMorphHero() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % BG_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const isCard = new URLSearchParams(window.location.search).has("card");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;

    // Adaptive grid resolution based on device hardware
    const NX = isMobile ? 32 : 44;
    const NZ = isMobile ? 12 : 16;
    const shadowSize = isMobile ? 1024 : 1536;

    // ── renderer ────────────────────────────────────────────────────────
    const canvas = document.createElement("canvas");
    canvas.className = "kpf-gl";
    host.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();

    // Pikadon Forest Green Studio Backdrop (vertical sweep)
    const bgC = document.createElement("canvas");
    bgC.width = 16; bgC.height = 256;
    const bgx = bgC.getContext("2d")!;
    const bgg = bgx.createLinearGradient(0, 0, 0, 256);
    bgg.addColorStop(0, "#142e20");    // Pikadon Deep Forest Green top
    bgg.addColorStop(0.55, "#0a1b12");  // Dark Forest transition
    bgg.addColorStop(1, "#050d09");     // Obsidian Forest base
    bgx.fillStyle = bgg; bgx.fillRect(0, 0, 16, 256);
    const bgTex = new THREE.CanvasTexture(bgC);
    bgTex.colorSpace = THREE.SRGBColorSpace;
    scene.background = bgTex;

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

    // ── lights ──────────────────────────────────────────────────────────
    const key = new THREE.DirectionalLight(0xfff3e2, 2.7);
    key.position.set(-3.6, 8.2, 4.4);
    key.castShadow = true;
    key.shadow.mapSize.set(shadowSize, shadowSize);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 26;
    const sc = key.shadow.camera as THREE.OrthographicCamera;
    sc.left = -4.5; sc.right = 4.5; sc.top = 4.5; sc.bottom = -4.5;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.025;
    key.shadow.radius = isMobile ? 4 : 6;
    scene.add(key);

    const fill = new THREE.HemisphereLight(0xeddcc4, 0x0c1b12, 0.6);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xe5a93c, 0.35); // Warm Honey Gold rim light
    rim.position.set(4.5, 3.5, -5.5);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0xfff4e6, 0.25));

    // ── ground: Pikadon studio floor with Warm Honey Gold light pool ───────────────
    const grC = document.createElement("canvas");
    grC.width = grC.height = 256;
    const grx = grC.getContext("2d")!;
    grx.fillStyle = "#0c1811";
    grx.fillRect(0, 0, 256, 256);
    const pool = grx.createRadialGradient(128, 110, 20, 128, 128, 170);
    pool.addColorStop(0, "rgba(229, 169, 60, 0.45)");   // Pikadon Warm Honey Gold light pool
    pool.addColorStop(0.4, "rgba(22, 60, 40, 0.25)");   // Forest green halo
    pool.addColorStop(1, "rgba(12, 24, 17, 0)");
    grx.fillStyle = pool; grx.fillRect(0, 0, 256, 256);
    const grTex = new THREE.CanvasTexture(grC);
    grTex.colorSpace = THREE.SRGBColorSpace;
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ map: grTex, roughness: 0.96, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // ── texture baking resolution tailoring ──────────────────────────────
    const TW = isMobile ? 640 : 880;
    const TH = Math.round((TW * PH) / PW);
    const texCache = new Map<number, THREE.CanvasTexture>();
    const imgs: (HTMLImageElement | null)[] = new Array(NIMG).fill(null);

    function coverDraw(ctx: CanvasRenderingContext2D, img: HTMLImageElement,
                       x: number, y: number, w: number, h: number) {
      const ir = img.width / img.height, cr = w / h;
      let dw: number, dh: number;
      if (ir > cr) { dh = h; dw = h * ir; } else { dw = w; dh = w / ir; }
      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
      ctx.restore();
    }

    function bakePhoto(index: number, gutterRight: boolean): THREE.CanvasTexture {
      const c = document.createElement("canvas");
      c.width = TW; c.height = TH;
      const ctx = c.getContext("2d")!;

      // paper: Pikadon warm cream
      ctx.fillStyle = "#faf7f0"; ctx.fillRect(0, 0, TW, TH);

      // photo with a thin printed frame
      const m = Math.round(TW * 0.045);
      const px = m, py = m, pw = TW - m * 2, ph = TH - m * 2;
      const img = imgs[index];
      if (img) coverDraw(ctx, img, px, py, pw, ph);
      else { ctx.fillStyle = "#dcd5c7"; ctx.fillRect(px, py, pw, ph); }

      // gentle photo vignette
      const vg = ctx.createRadialGradient(TW / 2, TH * 0.46, TH * 0.2, TW / 2, TH * 0.5, TH * 0.66);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.22)");
      ctx.fillStyle = vg; ctx.fillRect(px, py, pw, ph);

      // caption block over the lower photo
      const sg = ctx.createLinearGradient(0, TH * 0.62, 0, TH);
      sg.addColorStop(0, "rgba(8,8,10,0)");
      sg.addColorStop(1, "rgba(8,8,10,0.65)");
      ctx.fillStyle = sg; ctx.fillRect(px, py, pw, ph);

      const tx = px + pw * 0.07;
      ctx.textAlign = "left";
      ctx.fillStyle = "#e5a93c"; // Honey gold kicker
      ctx.font = `600 ${Math.round(TW * 0.028)}px "DM Mono", monospace`;
      ctx.fillText(`№ ${String(index + 1).padStart(2, "0")} — EDITORIAL`, tx, TH - ph * 0.14);
      ctx.fillStyle = "#fcfaf4";
      ctx.font = `italic 500 ${Math.round(TW * 0.085)}px "Playfair Display", serif`;
      ctx.fillText(CAPTIONS[index] || "PIKADON", tx, TH - ph * 0.055);

      // running header on the frame
      ctx.fillStyle = "rgba(13,34,24,0.7)"; // Pikadon Forest Green
      ctx.font = `500 ${Math.round(TW * 0.022)}px "DM Mono", monospace`;
      ctx.textAlign = gutterRight ? "left" : "right";
      ctx.fillText("PIKADON · NAJJERA CENTRE", gutterRight ? m * 1.3 : TW - m * 1.3, m * 0.74);

      // binding (gutter) shade — page curves into the spine
      const gw = TW * 0.2;
      const gx = gutterRight ? TW - gw : 0;
      const gg = ctx.createLinearGradient(gutterRight ? TW : 0, 0, gutterRight ? TW - gw : gw, 0);
      gg.addColorStop(0, "rgba(0,0,0,0.30)");
      gg.addColorStop(0.5, "rgba(0,0,0,0.07)");
      gg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gg; ctx.fillRect(gx, 0, gw, TH);

      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      return t;
    }

    function bakeCover(gutterRight: boolean): THREE.CanvasTexture {
      const c = document.createElement("canvas");
      c.width = TW; c.height = TH;
      const ctx = c.getContext("2d")!;
      
      // Pikadon Forest Green gradient
      const g = ctx.createLinearGradient(0, 0, 0, TH);
      g.addColorStop(0, "#163324"); g.addColorStop(1, "#0a1a11");
      ctx.fillStyle = g; ctx.fillRect(0, 0, TW, TH);

      // Gold foil inner border frame
      ctx.strokeStyle = "rgba(229, 169, 60, 0.4)";
      ctx.lineWidth = 4;
      ctx.strokeRect(TW * 0.04, TH * 0.03, TW * 0.92, TH * 0.94);

      ctx.textAlign = "center";
      ctx.fillStyle = "#e5a93c"; // Pikadon Warm Gold
      ctx.font = `600 ${Math.round(TW * 0.022)}px "DM Mono", monospace`;
      ctx.fillText("NAJJERA CENTRE · KAMPALA", TW / 2, TH * 0.22);
      ctx.fillStyle = "#fcfaf4";
      ctx.font = `700 ${Math.round(TW * 0.16)}px "Playfair Display", serif`;
      ctx.fillText("PIKADON", TW / 2, TH * 0.52);
      ctx.fillStyle = "#e5a93c";
      ctx.font = `italic 500 ${Math.round(TW * 0.042)}px "Playfair Display", serif`;
      ctx.fillText("child development network", TW / 2, TH * 0.61);
      ctx.fillStyle = "rgba(252,250,244,0.7)";
      ctx.font = `500 ${Math.round(TW * 0.02)}px "DM Mono", monospace`;
      ctx.fillText("SAFE · LOVED · GROWING", TW / 2, TH * 0.82);

      const gw = TW * 0.2, gx = gutterRight ? TW - gw : 0;
      const gg = ctx.createLinearGradient(gutterRight ? TW : 0, 0, gutterRight ? TW - gw : gw, 0);
      gg.addColorStop(0, "rgba(0,0,0,0.42)"); gg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gg; ctx.fillRect(gx, 0, gw, TH);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
      return t;
    }

    let coverFront: THREE.CanvasTexture | null = null;
    let coverBack: THREE.CanvasTexture | null = null;

    function texFor(index: number): THREE.CanvasTexture {
      if (index < 0) return (coverFront ??= bakeCover(true));
      if (index >= NIMG) return (coverBack ??= bakeCover(false));
      const hit = texCache.get(index);
      if (hit) return hit;
      const t = bakePhoto(index, index % 2 === 1);
      texCache.set(index, t);
      return t;
    }

    // ── page geometry (shared rest grid) ────────────────────────────────
    function makeGrid(uMin: number, uMax: number) {
      const g = new THREE.BufferGeometry();
      const verts = (NX + 1) * (NZ + 1);
      const pos = new Float32Array(verts * 3);
      const uv = new Float32Array(verts * 2);
      for (let iz = 0; iz <= NZ; iz++) {
        for (let ix = 0; ix <= NX; ix++) {
          const k = iz * (NX + 1) + ix;
          pos[k * 3] = (ix / NX) * PW;
          pos[k * 3 + 1] = 0;
          pos[k * 3 + 2] = -PH / 2 + (iz / NZ) * PH;
          uv[k * 2] = uMin + (uMax - uMin) * (ix / NX);
          uv[k * 2 + 1] = 1 - iz / NZ;
        }
      }
      const idx: number[] = [];
      for (let iz = 0; iz < NZ; iz++) {
        for (let ix = 0; ix < NX; ix++) {
          const a = iz * (NX + 1) + ix, b = a + 1, c = a + (NX + 1), d = c + 1;
          idx.push(a, c, b, b, c, d);
        }
      }
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    }

    function makeFlatPage(side: "left" | "right") {
      const g = makeGrid(0, 1);
      const p = g.attributes.position as THREE.BufferAttribute;
      const arr = p.array as Float32Array;
      for (let i = 0; i < arr.length; i += 3) {
        if (side === "left") arr[i] -= PW;
        const frac = Math.abs(arr[i]) / PW;
        arr[i + 1] = PAGE_Y + Math.sin(frac * Math.PI) * 0.055;
      }
      p.needsUpdate = true;
      g.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0 });
      const m = new THREE.Mesh(g, mat);
      m.castShadow = true; m.receiveShadow = true;
      return m;
    }

    const leftPage = makeFlatPage("left");
    const rightPage = makeFlatPage("right");
    scene.add(leftPage, rightPage);

    // ── the turning leaf (deformable, two-sided texture) ────────────────
    const flipGeo = makeGrid(0, 1);
    const restS = new Float32Array(NX + 1);
    const restZ = new Float32Array(NZ + 1);
    for (let ix = 0; ix <= NX; ix++) restS[ix] = (ix / NX) * PW;
    for (let iz = 0; iz <= NZ; iz++) restZ[iz] = -PH / 2 + (iz / NZ) * PH;

    const backMapU = { value: texFor(1) as THREE.Texture };
    const flipMat = new THREE.MeshStandardMaterial({
      map: texFor(0), roughness: 0.6, metalness: 0, side: THREE.DoubleSide,
    });
    flipMat.onBeforeCompile = (shader) => {
      shader.uniforms.backMap = backMapU;
      shader.fragmentShader = "uniform sampler2D backMap;\n" + shader.fragmentShader.replace(
        "#include <map_fragment>",
        `vec4 sampledDiffuseColor;
         if (gl_FrontFacing) sampledDiffuseColor = texture2D( map, vMapUv );
         else sampledDiffuseColor = texture2D( backMap, vec2(1.0 - vMapUv.x, vMapUv.y) );
         diffuseColor *= sampledDiffuseColor;`,
      );
    };
    const flipMesh = new THREE.Mesh(flipGeo, flipMat);
    flipMesh.castShadow = true; flipMesh.receiveShadow = true;
    flipMesh.visible = false;
    scene.add(flipMesh);

    function deformFlip(tv: number) {
      const theta = tv * Math.PI;
      const curl = Math.sin(tv * Math.PI);
      const bend = curl * BEND_MAX;
      const lead = curl * LEAD;
      const bowFade = 1 - curl;
      const pos = flipGeo.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      const flat = bend < 1e-4;
      const rho = flat ? 0 : PW / bend;
      for (let iz = 0; iz <= NZ; iz++) {
        const zc = restZ[iz];
        const th = theta + lead * (zc / PH);
        const ct = Math.cos(th), st = Math.sin(th);
        for (let ix = 0; ix <= NX; ix++) {
          const s = restS[ix];
          let cx: number, cy: number;
          if (flat) { cx = s; cy = 0; }
          else { const a = (s / PW) * bend; cx = rho * Math.sin(a); cy = rho * (1 - Math.cos(a)); }
          const bow = Math.sin((s / PW) * Math.PI) * 0.055 * bowFade;
          const k = (iz * (NX + 1) + ix) * 3;
          arr[k] = cx * ct - cy * st;
          arr[k + 1] = cx * st + cy * ct + PAGE_Y + 0.006 + bow;
          arr[k + 2] = zc;
        }
      }
      pos.needsUpdate = true;
      flipGeo.computeVertexNormals();
    }

    // ── page stacks (thickness) ─────────────────────────────────────────
    function makeStack(side: "left" | "right") {
      const mat = new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.9, metalness: 0 });
      const g = new THREE.BoxGeometry(PW, 1, PH);
      const m = new THREE.Mesh(g, mat);
      m.castShadow = true; m.receiveShadow = true;
      m.position.x = side === "left" ? -PW / 2 : PW / 2;
      scene.add(m);
      return m;
    }
    const leftStack = makeStack("left");
    const rightStack = makeStack("right");
    // a slim Pikadon forest spine ridge
    const spine = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.06, PH),
      new THREE.MeshStandardMaterial({ color: 0x12241a, roughness: 0.8 }),
    );
    scene.add(spine);

    function layoutStacks(open: number) {
      const lh = Math.max(0.02, open * PER_SHEET);
      const rh = Math.max(0.02, (SHEETS - open) * PER_SHEET);
      leftStack.scale.y = lh; leftStack.position.y = -lh / 2;
      rightStack.scale.y = rh; rightStack.position.y = -rh / 2;
      spine.position.y = 0.0;
    }

    // ── book state ──────────────────────────────────────────────────────
    let o = 1;
    type Flip = { base: number; from: number; to: number; tv: number; drag: boolean; t0: number };
    let flip: Flip | null = null;

    function setStatics() {
      (leftPage.material as THREE.MeshStandardMaterial).map = texFor(2 * o - 1);
      (rightPage.material as THREE.MeshStandardMaterial).map = texFor(2 * o);
      leftPage.material.needsUpdate = true;
      rightPage.material.needsUpdate = true;
      layoutStacks(o);
    }

    function beginFlip(dir: 1 | -1, drag: boolean): boolean {
      if (flip) return false;
      if (dir > 0 && o >= SHEETS) return false;
      if (dir < 0 && o <= 0) return false;
      const base = dir > 0 ? o : o - 1;
      (leftPage.material as THREE.MeshStandardMaterial).map = texFor(2 * base - 1);
      (rightPage.material as THREE.MeshStandardMaterial).map = texFor(2 * base + 2);
      leftPage.material.needsUpdate = true;
      rightPage.material.needsUpdate = true;
      flipMat.map = texFor(2 * base);
      backMapU.value = texFor(2 * base + 1);
      flipMat.needsUpdate = true;
      flipMesh.visible = true;
      const from = dir > 0 ? 0 : 1;
      const to = dir > 0 ? 1 : 0;
      flip = { base, from, to: drag ? to : to, tv: from, drag, t0: performance.now() };
      if (drag) flip.to = to;
      deformFlip(from);
      layoutStacks(base + from);
      return true;
    }

    function commitFlip(target: 0 | 1) {
      if (!flip) return;
      o = flip.base + target;
      flip = null;
      flipMesh.visible = false;
      setStatics();
    }

    const easeInOut = (x: number) =>
      x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

    // ── pointer → surface position (world X) ────────────────────────────
    const raycaster = new THREE.Raycaster();
    const deskPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -PAGE_Y);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    function surfaceX(cx: number, cy: number): number | null {
      const rect = host!.getBoundingClientRect();
      ndc.x = ((cx - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((cy - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(deskPlane, hit)) return null;
      return hit.x;
    }
    const xToTv = (x: number) => Math.acos(THREE.MathUtils.clamp(x / PW, -1, 1)) / Math.PI;

    let down = false, moved = false, downX = 0, downY = 0;
    const onDown = (e: PointerEvent) => {
      if (flip) return;
      const x = surfaceX(e.clientX, e.clientY);
      if (x == null) return;
      down = true; moved = false; downX = e.clientX; downY = e.clientY;
      const dir: 1 | -1 = x >= 0 ? 1 : -1;
      if (beginFlip(dir, true)) {
        flip!.tv = xToTv(x);
        deformFlip(flip!.tv);
        layoutStacks(flip!.base + flip!.tv);
      }
    };
    const onMoveP = (e: PointerEvent) => {
      if (!down || !flip || !flip.drag) return;
      const deltaX = e.clientX - downX;
      const deltaY = e.clientY - downY;
      
      // On touch devices, allow vertical swipes to scroll the window naturally
      if (e.pointerType === "touch" && Math.abs(deltaY) > Math.abs(deltaX) + 8) {
        down = false;
        startAuto(flip.tv > 0.5 ? 1 : 0);
        return;
      }

      if (Math.abs(deltaX) + Math.abs(deltaY) > 5) moved = true;
      const x = surfaceX(e.clientX, e.clientY);
      if (x == null) return;
      flip.tv = THREE.MathUtils.clamp(xToTv(x), 0, 1);
      deformFlip(flip.tv);
      layoutStacks(flip.base + flip.tv);
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (!flip) return;
      if (!moved) {
        const target: 0 | 1 = flip.base === o ? 1 : 0;
        startAuto(target);
      } else {
        startAuto(flip.tv > 0.5 ? 1 : 0);
      }
    };

    function startAuto(target: 0 | 1) {
      if (!flip) return;
      flip.drag = false;
      flip.from = flip.tv;
      flip.to = target;
      flip.t0 = performance.now();
    }

    function autoFlip(dir: 1 | -1) {
      if (flip) return;
      if (beginFlip(dir, false)) {
        flip!.from = dir > 0 ? 0 : 1;
        flip!.to = dir > 0 ? 1 : 0;
        flip!.tv = flip!.from;
        flip!.t0 = performance.now();
      }
    }

    // ── NON-BLOCKING SMART WHEEL SCROLLING ────────────────────────────────
    // Allows user to flip through pages, and then smoothly scroll past the hero!
    const onWheel = (e: WheelEvent) => {
      if (flip) {
        e.preventDefault();
        return;
      }
      
      // Scrolling Down
      if (e.deltaY > 0) {
        if (o < SHEETS) {
          // Still have un-flipped pages remaining: flip next page
          e.preventDefault();
          autoFlip(1);
        }
        // If o >= SHEETS (at the last page/cover), do NOT call preventDefault!
        // The browser naturally scrolls down to the next section
      } 
      // Scrolling Up
      else if (e.deltaY < 0) {
        // Only flip backwards if at the top of the viewport and there are pages on the left
        if (window.scrollY < 10 && o > 0) {
          e.preventDefault();
          autoFlip(-1);
        }
      }
    };

    if (!isCard && !reduced) {
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointermove", onMoveP);
      window.addEventListener("pointerup", onUp);
      host.addEventListener("wheel", onWheel, { passive: false });
    }

    // ── camera framing ──────────────────────────────────────────────────
    const camDir = new THREE.Vector3();
    function frame() {
      const w = host!.clientWidth || window.innerWidth;
      const h = host!.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;
      // Fluid framing radius calculated based on aspect ratio for perfect bounds on mobile, tablet & desktop
      const radius = aspect < 0.65 ? 3.1 : aspect < 0.85 ? 2.75 : aspect < 1.25 ? 2.3 : 2.05;
      const vFov = (camera.fov * Math.PI) / 180;
      let dist = radius / Math.sin(vFov / 2);
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
      dist = Math.max(dist, radius / Math.sin(hFov / 2));
      camDir.set(0.62 * Math.sin(0.34), 0.86, 0.62 * Math.cos(0.34)).normalize();
      camera.position.copy(camDir.multiplyScalar(dist));
      camera.lookAt(0, -0.05, 0);
      camera.updateProjectionMatrix();
    }
    frame();
    const ro = new ResizeObserver(frame);
    ro.observe(host);

    // ── load photos ─────────────────────────────────────────────────────
    let ready = false;
    let loaded = 0;
    function refreshTextures() {
      for (const [i, t] of texCache) {
        const fresh = bakePhoto(i, i % 2 === 1);
        t.image = fresh.image;
        t.needsUpdate = true;
      }
      setStatics();
      backMapU.value = texFor(2 * Math.max(0, o - 1) + 1);
    }
    IMAGES.forEach((src, i) => {
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = () => {
        imgs[i] = im; loaded += 1;
        if (loaded === NIMG) { ready = true; refreshTextures(); }
      };
      im.onerror = () => { loaded += 1; if (loaded === NIMG) { ready = true; refreshTextures(); } };
      im.src = src;
    });

    setStatics();
    deformFlip(0);

    if (document.fonts && "load" in document.fonts) {
      Promise.all([
        document.fonts.load('italic 500 80px "Playfair Display"').catch(() => {}),
        document.fonts.load('500 30px "DM Mono"').catch(() => {}),
      ]).then(() => { if (ready) refreshTextures(); });
    }

    // ── VIEWPORT INTERSECTION OBSERVER FOR GPU EFFICIENCY ─────────────────
    let isVisible = true;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        isVisible = entry.isIntersecting;
      }
    }, { threshold: 0.1 });
    io.observe(host);

    // ── RENDER LOOP (PAUSES WHEN SCOLLLED OUT OF VIEW) ───────────────────
    let raf = 0;
    function loop() {
      raf = requestAnimationFrame(loop);

      // Skip GPU rendering when stage is scrolled out of viewport
      if (!isVisible && !flip) return;

      const now = performance.now();

      if (flip) {
        if (flip.drag) {
          // tv set by pointer handlers
        } else {
          const p = THREE.MathUtils.clamp((now - flip.t0) / FLIP_MS, 0, 1);
          flip.tv = flip.from + (flip.to - flip.from) * easeInOut(p);
          deformFlip(flip.tv);
          layoutStacks(flip.base + flip.tv);
          if (p >= 1) commitFlip(flip.to as 0 | 1);
        }
      }

      renderer.render(scene, camera);
    }

    if (reduced) {
      o = 1; setStatics(); deformFlip(0);
      const renderOnce = () => renderer.render(scene, camera);
      renderOnce();
      const id = window.setTimeout(renderOnce, 500);
      return () => {
        window.clearTimeout(id);
        ro.disconnect();
        io.disconnect();
        renderer.dispose();
        canvas.remove();
      };
    }

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMoveP);
      window.removeEventListener("pointerup", onUp);
      host.removeEventListener("wheel", onWheel);
      renderer.dispose();
      flipGeo.dispose();
      flipMat.dispose();
      texCache.forEach((t) => t.dispose());
      coverFront?.dispose(); coverBack?.dispose();
      bgTex.dispose(); grTex.dispose();
      canvas.remove();
    };
  }, []);

  return (
    <div ref={hostRef} className="kpf-stage">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Mono:wght@400;500&display=swap');
        .kpf-stage {
          position: relative; width: 100%; height: 100svh; min-height: 640px; max-height: 960px; overflow: hidden;
          background: #050d09; cursor: grab;
          font-family: "DM Mono", monospace; touch-action: pan-y;
        }
        .kpf-stage:active { cursor: grabbing; }
        .kpf-gl { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
        .kpf-chrome {
          position: absolute; inset: 0; pointer-events: none; z-index: 2;
          color: #fcfaf4; mix-blend-mode: difference;
          text-transform: uppercase; letter-spacing: 0.16em;
        }
        .kpf-chrome span { position: absolute; font-size: 11px; font-weight: 500; white-space: nowrap; }
        .kpf-tl { top: 26px; left: 30px; font-weight: 700; letter-spacing: 0.04em; color: #e5a93c; }
        .kpf-tr { top: 26px; right: 30px; }
        .kpf-bl { bottom: 26px; left: 30px; }
        .kpf-br { bottom: 26px; right: 30px; }

        /* Full-Bleed Background Hero Slideshow Layer */
        .kpf-hero-slideshow {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          overflow: hidden; user-select: none;
        }
        .kpf-slide-item {
          position: absolute; inset: 0; width: 100%; height: 100%;
        }

        @media (max-width: 640px) {
          .kpf-chrome span { font-size: 9px; letter-spacing: 0.12em; }
          .kpf-tl, .kpf-tr { top: 18px; }
          .kpf-tl, .kpf-bl { left: 18px; }
          .kpf-tr, .kpf-br { right: 18px; }
          .kpf-bl, .kpf-br { bottom: 18px; }
        }
      `}</style>

      {/* Full-Bleed Clear Background Slideshow of Dark-Skinned Children Studio Photography (No Dark Overlay, Zoomed Out & Whole) */}
      <div className="kpf-hero-slideshow" aria-hidden="true">
        {BG_SLIDES.map((slide, idx) => (
          <div
            key={slide.src}
            className="kpf-slide-item flex items-center justify-center p-2 sm:p-4 md:p-8"
            style={{
              opacity: idx === slideIdx ? 1 : 0,
              backgroundColor: slide.bgColor,
              transition: "opacity 1400ms cubic-bezier(0.4, 0, 0.2, 1), background-color 1400ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <img
              src={`/${slide.src}`}
              alt={slide.alt}
              className="w-full h-full object-contain object-center"
            />
          </div>
        ))}
      </div>

      <div className="kpf-chrome">
        <span className="kpf-tl">PIKADON®</span>
        <span className="kpf-tr">Editorial Folio · Volume 01</span>
        <span className="kpf-bl">Drag a corner · scroll · click to turn</span>
        <span className="kpf-br">Najjera, Kampala</span>
      </div>
    </div>
  );
}
