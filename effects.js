// effects.js — Cursor trail + click burst effects

// ===== Create Trail Canvas =====
const trailCanvas = document.createElement('canvas');
trailCanvas.id = 'trailCanvas';
document.body.appendChild(trailCanvas);
const tctx = trailCanvas.getContext('2d');

let W, H;
function resizeCanvas() {
    W = trailCanvas.width = window.innerWidth;
    H = trailCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ===== Theme-aware colors =====
function getThemeColors() {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    if (isLight) {
        return ['#059669', '#0284c7', '#d97706', '#7c3aed'];
    }
    return ['#10b981', '#0ea5e9', '#f59e0b', '#a78bfa'];
}

// ===== Trail particles =====
const particles = [];

document.addEventListener('mousemove', (e) => {
    const colors = getThemeColors();
    // Spawn 2 particles per move for a smooth trail
    for (let i = 0; i < 2; i++) {
        particles.push({
            x: e.clientX + (Math.random() - 0.5) * 8,
            y: e.clientY + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            life: 1,
            size: Math.random() * 5 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            isBurst: false
        });
    }
    // Cap total particles for performance
    if (particles.length > 300) {
        particles.splice(0, particles.length - 300);
    }
});

// ===== Click burst =====
document.addEventListener('mousedown', (e) => {
    const colors = getThemeColors();
    const count = 24;
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = Math.random() * 6 + 4;
        particles.push({
            x: e.clientX,
            y: e.clientY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            size: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            isBurst: true
        });
    }

    // Ripple ring
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
});

// ===== Animation loop =====
function animateTrail() {
    tctx.clearRect(0, 0, W, H);

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.isBurst) {
            p.vx *= 0.94;
            p.vy *= 0.94;
            p.life -= 0.025;
        } else {
            p.vx *= 0.97;
            p.vy *= 0.97;
            p.vy += 0.08; // slight gravity
            p.life -= 0.028;
        }

        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        // Glow effect
        tctx.globalAlpha = p.life * 0.9;
        tctx.shadowBlur = 14;
        tctx.shadowColor = p.color;
        tctx.fillStyle = p.color;
        tctx.beginPath();
        tctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        tctx.fill();
    }

    tctx.globalAlpha = 1;
    tctx.shadowBlur = 0;
    requestAnimationFrame(animateTrail);
}
animateTrail();

// ===== Hero title letter animation =====
function initTextAnimations() {
    const heroTitle = document.querySelector('.hero-title');    if (heroTitle) {
        // Wrap each letter of the gradient span in its own span
        const gradientSpan = heroTitle.querySelector('.gradient-text');
        if (gradientSpan) {
            const text = gradientSpan.textContent;
            gradientSpan.innerHTML = '';
            for (let i = 0; i < text.length; i++) {
                const ch = text[i] === ' ' ? '&nbsp;' : text[i];
                const span = document.createElement('span');
                span.className = 'hero-letter';
                span.style.transitionDelay = (i * 0.04) + 's';
                span.innerHTML = ch;
                gradientSpan.appendChild(span);
            }

            // On hover, animate each letter
            heroTitle.addEventListener('mouseenter', () => {
                document.querySelectorAll('.hero-letter').forEach((span, i) => {
                    span.style.transitionDelay = (i * 0.04) + 's';
                    span.classList.add('bounce');
                });
            });

            heroTitle.addEventListener('mouseleave', () => {
                document.querySelectorAll('.hero-letter').forEach(span => {
                    span.classList.remove('bounce');
                });
            });
        }
    }

    // Section title letter wrapping
    document.querySelectorAll('.section-title').forEach(title => {
        const text = title.textContent;
        title.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
            const ch = text[i] === ' ' ? '&nbsp;' : text[i];
            const span = document.createElement('span');
            span.className = 'section-letter';
            span.style.transitionDelay = (i * 0.03) + 's';
            span.innerHTML = ch;
            title.appendChild(span);
        }

        title.addEventListener('mouseenter', () => {
            title.querySelectorAll('.section-letter').forEach((s, i) => {
                s.style.transitionDelay = (i * 0.03) + 's';
                s.classList.add('lift');
            });
        });

        title.addEventListener('mouseleave', () => {
            title.querySelectorAll('.section-letter').forEach(s => {
                s.classList.remove('lift');
            });
        });
    });

        // Nav links subtle wave
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.classList.add('nav-wave');
        });
        link.addEventListener('mouseleave', () => {
            link.classList.remove('nav-wave');
        });
    });
}

// Run after DOM is ready — with a small delay to ensure other scripts finish
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initTextAnimations, 500));
} else {
    setTimeout(initTextAnimations, 500);
}
console.log('✅ Effects loaded — cursor trail + click burst + text animations');