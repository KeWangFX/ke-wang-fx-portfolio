import * as THREE from "./assets/vendor/three.module.min.js";

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const warpFragmentShader = `
  uniform float iTime;
  uniform vec2 iResolution;
  uniform vec2 iPointer;

  void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 p = uv - 0.5;
    p.x *= iResolution.x / iResolution.y;

    vec2 pointer = iPointer - 0.5;
    pointer.x *= iResolution.x / iResolution.y;

    vec2 q = p * 1.18;
    float t = iTime * 0.34;

    q += 0.14 * sin(vec2(q.y * 8.0 + t * 2.0, q.x * 8.0 - t * 1.6));
    q += 0.08 * sin(vec2(q.y * 18.0 - t * 1.4, q.x * 18.0 + t * 1.2));
    q += pointer * 0.15 * exp(-length(p - pointer) * 3.0);

    float shapeScale = 0.43;
    vec2 checks = floor((q + 8.0) / shapeScale);
    float pattern = mod(checks.x + checks.y, 2.0);

    vec3 colA = vec3(0.03, 0.13, 0.20);
    vec3 colB = vec3(0.32, 0.88, 0.82);
    vec3 col = mix(colA, colB, pattern);

    vec2 cell = abs(fract(q / shapeScale) - 0.5);
    float edge = exp(-18.0 * min(cell.x, cell.y));
    col += vec3(0.14, 0.40, 0.48) * edge;

    float pulse = 0.5 + 0.5 * sin(t * 3.0 + q.x * 3.5);
    col += vec3(0.08, 0.18, 0.22) * pulse;

    float vignette = smoothstep(1.28, 0.08, length(p));
    gl_FragColor = vec4(col * vignette, 1.0);
  }
`;

const heroFragmentShader = `
  uniform float iTime;
  uniform vec2 iResolution;
  uniform vec2 iPointer;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rot * p * 2.0 + 0.5;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / min(iResolution.x, iResolution.y);
    vec2 pointer = (iPointer - 0.5) * 2.0;
    pointer.x *= iResolution.x / iResolution.y;

    float t = iTime * 0.24;
    vec2 q = uv;
    q += 0.12 * vec2(sin(q.y * 4.0 + t), cos(q.x * 4.0 - t));

    float haze = fbm(q * 1.7 + vec2(t * 0.6, -t * 0.35));
    float embers = fbm(q * 4.6 - vec2(t * 1.2, t * 0.5));
    float glow = exp(-length(uv - pointer * 0.22) * 4.0);

    vec3 base = mix(vec3(0.10, 0.03, 0.03), vec3(0.45, 0.12, 0.08), haze);
    vec3 highlights = mix(vec3(0.82, 0.37, 0.11), vec3(1.0, 0.78, 0.42), embers);
    vec3 col = base + highlights * smoothstep(0.24, 1.0, haze + embers * 0.45) * 0.72;
    col += glow * vec3(0.94, 0.42, 0.20) * 0.22;

    float vignette = smoothstep(1.45, 0.06, length(uv));
    gl_FragColor = vec4(col * vignette, 1.0);
  }
`;

function initShaderSurface(selector, fragmentShader) {
  const elements = document.querySelectorAll(selector);

  elements.forEach((element) => {
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },
      iPointer: { value: new THREE.Vector2(0.5, 0.5) }
    };

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms,
      vertexShader,
      fragmentShader
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    element.appendChild(renderer.domElement);

    const parentSection = element.parentElement || element;

    const resize = () => {
      const width = element.clientWidth || parentSection.clientWidth || window.innerWidth;
      const height = element.clientHeight || parentSection.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      uniforms.iResolution.value.set(width, height);
    };

    const updatePointer = (clientX, clientY) => {
      const rect = element.getBoundingClientRect();
      const x = (clientX - rect.left) / Math.max(rect.width, 1);
      const y = 1 - (clientY - rect.top) / Math.max(rect.height, 1);
      uniforms.iPointer.value.set(x, y);
    };

    const handleMove = (event) => {
      updatePointer(event.clientX, event.clientY);
    };

    const handleLeave = () => {
      uniforms.iPointer.value.set(0.5, 0.5);
    };

    resize();
    parentSection.addEventListener("pointermove", handleMove);
    parentSection.addEventListener("pointerleave", handleLeave);

    let frameId = 0;
    const animate = () => {
      uniforms.iTime.value += prefersReducedMotion ? 0.0 : 0.012;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("resize", resize);

    window.addEventListener(
      "beforeunload",
      () => {
        window.cancelAnimationFrame(frameId);
        window.removeEventListener("resize", resize);
        parentSection.removeEventListener("pointermove", handleMove);
        parentSection.removeEventListener("pointerleave", handleLeave);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      },
      { once: true }
    );
  });
}

function initFlowField() {
  const wrappers = document.querySelectorAll("[data-effect-flow]");

  wrappers.forEach((wrapper) => {
    const canvas = wrapper.querySelector("[data-effect-flow-canvas]");
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const host = wrapper.parentElement || wrapper;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frameId = 0;
    let mouse = { x: -1000, y: -1000 };
    let particles = [];

    class Particle {
      constructor() {
        this.reset();
        this.age = Math.random() * 200;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 240 + 120;
      }

      update() {
        const angle =
          (Math.cos(this.x * 0.0055) + Math.sin(this.y * 0.0055)) * Math.PI;

        this.vx += Math.cos(angle) * 0.18;
        this.vy += Math.sin(angle) * 0.18;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = 140;

        if (distance < interactionRadius) {
          const force = (interactionRadius - distance) / interactionRadius;
          this.vx -= dx * force * 0.028;
          this.vy -= dy * force * 0.028;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.age += 1;

        if (this.age > this.life) {
          this.reset();
        }

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        const alpha = 1 - Math.abs(this.age / this.life - 0.5) * 2;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#8aa4ff";
        ctx.fillRect(this.x, this.y, 1.4, 1.4);
      }
    }

    const resize = () => {
      width = wrapper.clientWidth || host.clientWidth || window.innerWidth;
      height = wrapper.clientHeight || host.clientHeight || 600;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const particleCount = Math.min(
        680,
        Math.max(220, Math.floor((width * height) / 3600))
      );

      particles = Array.from({ length: particleCount }, () => new Particle());
    };

    const handlePointerMove = (event) => {
      const rect = wrapper.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const animate = () => {
      ctx.fillStyle = "rgba(3, 6, 14, 0.12)";
      ctx.fillRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      frameId = window.requestAnimationFrame(animate);
    };

    resize();
    animate();

    host.addEventListener("pointermove", handlePointerMove);
    host.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", resize);

    window.addEventListener(
      "beforeunload",
      () => {
        window.cancelAnimationFrame(frameId);
        host.removeEventListener("pointermove", handlePointerMove);
        host.removeEventListener("pointerleave", handlePointerLeave);
        window.removeEventListener("resize", resize);
      },
      { once: true }
    );
  });
}

initShaderSurface("[data-effect-warp]", warpFragmentShader);
initFlowField();
initShaderSurface("[data-effect-hero]", heroFragmentShader);
