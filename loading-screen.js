// loading-screen.js — Animated splash screen
(function () {
    // Only show once per session
    if (sessionStorage.getItem('portfolio-loaded') === '1') return;

    const screen = document.createElement('div');
    screen.className = 'loading-screen';
    screen.id = 'loadingScreen';
    screen.innerHTML = `
        <div class="loading-content">
            <div class="loading-name">
                <span>D</span><span>e</span><span>b</span><span>a</span><span>r</span><span>g</span><span>h</span><span>a</span>
                <span class="space">&nbsp;</span>
                <span>M</span><span>o</span><span>n</span><span>d</span><span>a</span><span>l</span>
            </div>
            <div class="loading-tagline">AI / ML Engineer</div>
            <div class="loading-bar"><div class="loading-fill"></div></div>
        </div>
    `;
    document.body.appendChild(screen);

    // Animate letters
    const letters = screen.querySelectorAll('.loading-name span:not(.space)');
    letters.forEach((l, i) => {
        l.style.animationDelay = (i * 0.06) + 's';
        l.classList.add('fade-in');
    });

    // Animate progress bar + hide
    setTimeout(() => {
        screen.classList.add('fade-out');
        sessionStorage.setItem('portfolio-loaded', '1');
        setTimeout(() => screen.remove(), 700);
    }, 1800);

    console.log('⏳ Loading screen shown');
})();