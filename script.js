const canvas = document.querySelector("#particle-field");
const context = canvas ? canvas.getContext("2d") : null;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let particles = [];
let width = 0;
let height = 0;

function resizeCanvas() {
  if (!canvas || !context) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  createParticles();
}

function createParticles() {
  const count = Math.min(90, Math.floor(width / 18));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.8 + 0.4,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    alpha: Math.random() * 0.58 + 0.18
  }));
}

function drawParticles() {
  if (!canvas || !context) return;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#7beaff";
  context.strokeStyle = "rgba(0, 174, 239, 0.12)";

  particles.forEach((particle, index) => {
    if (!prefersReducedMotion) {
      particle.x += particle.vx;
      particle.y += particle.vy;
    }

    if (particle.x < 0 || particle.x > width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > height) particle.vy *= -1;

    context.globalAlpha = particle.alpha;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();

    for (let next = index + 1; next < particles.length; next += 1) {
      const other = particles[next];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < 120) {
        context.globalAlpha = (120 - distance) / 120 * 0.32;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
    }
  });

  context.globalAlpha = 1;
  requestAnimationFrame(drawParticles);
}

function animateCounter(element) {
  const target = Number(element.dataset.count);
  if (!target || element.dataset.done) return;
  element.dataset.done = "true";
  const duration = 1300;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.round(target * eased)}${element.dataset.suffix || ""}`;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    entry.target.querySelectorAll("[data-count]").forEach(animateCounter);
    if (entry.target.matches("[data-count]")) animateCounter(entry.target);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

document.querySelectorAll(".reveal, [data-count]").forEach((element) => {
  revealObserver.observe(element);
});

const header = document.querySelector(".header");
if (header) {
  window.addEventListener("scroll", () => {
    const offset = window.scrollY;
    header.style.transform = offset > 20 ? "translateY(-4px)" : "translateY(0)";
    document.documentElement.style.setProperty("--scroll", String(offset));

    if (!prefersReducedMotion) {
      document.querySelectorAll(".dashboard-panel").forEach((panel, index) => {
        panel.style.translate = `0 ${Math.sin(offset / 180 + index) * 6}px`;
      });
    }
  }, { passive: true });
}

const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button");
    if (!button) return;
    const originalText = button.textContent;
    button.textContent = "Request Received";
    button.disabled = true;
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      event.currentTarget.reset();
    }, 1800);
  });
}

resizeCanvas();
drawParticles();
window.addEventListener("resize", resizeCanvas);
