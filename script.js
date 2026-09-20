// portfolio/script.js

// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    localStorage.setItem('portfolio-theme', theme);
}

const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme');
    applyTheme(current === 'light' ? 'dark' : 'light');
});

// ===== Custom Smooth Scroll =====
function smoothScrollTo(targetY, duration = 1000) {
    const startY = window.pageYOffset;
    const difference = targetY - startY;
    const startTime = performance.now();

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY + difference * easeInOutCubic(progress));
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#' || targetId.length < 2) return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;
            smoothScrollTo(offsetPosition, 1100);
        }
    });
});

// ===== Scroll Reveal =====
const revealElements = document.querySelectorAll('.project-card, .skill-category, .fact-card, .contact-card');

// Step 1: Set initial hidden state
revealElements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px) scale(0.96)';
    el.style.transition = 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';

    const parent = el.parentElement;
    const index = Array.prototype.indexOf.call(parent.children, el);
    el.style.transitionDelay = `${index * 0.08}s`;
});

// Step 2: Wait for two animation frames, THEN set up the observer
requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                    revealObserver.unobserve(entry.target);

                    // After reveal, switch to fast transition for tilt
                    setTimeout(() => {
                        entry.target.style.transition =
                            'transform 0.15s ease-out, ' +
                            'box-shadow 0.3s ease, ' +
                            'border-color 0.3s ease, ' +
                            'background 0.3s ease, ' +
                            'opacity 0.3s ease';
                        entry.target.style.transitionDelay = '0s';
                    }, 1500);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -60px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    });
});
// ===== Animated Number Counters =====
const counters = document.querySelectorAll('.stat-number');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            const text = entry.target.textContent;
            if (text.match(/^\d+\+?$/)) {
                const hasPlus = text.includes('+');
                const target = parseInt(text);
                let current = 0;
                const increment = target / 60;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    entry.target.textContent = Math.floor(current) + (hasPlus ? '+' : '');
                }, 25);
            }
        }
    });
}, { threshold: 0.5 });

counters.forEach(c => counterObserver.observe(c));

// ===== 3D Tilt on Project Cards =====
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
        card.style.transform = `translateY(-10px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

console.log('✅ Portfolio loaded with reveal + tilt animations');