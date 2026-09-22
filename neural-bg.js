// neural-bg.js — Animated neural network background
(function () {
    const canvas = document.createElement('canvas');
    canvas.id = 'neuralBg';
    document.body.insertBefore(canvas, document.body.firstChild);
    const ctx = canvas.getContext('2d');

    let W, H, nodes = [];
    let mouseX = -9999, mouseY = -9999;
    let isRunning = true;

    const NODE_COUNT_DESKTOP = 70;
    const NODE_COUNT_MOBILE = 30;
    const MAX_LINK_DIST = 140;
    const MOUSE_RADIUS = 180;

    function getColors() {
        const isLight = document.body.getAttribute('data-theme') === 'light';
        return isLight
            ? { node: '#059669', line: '5, 150, 105', bg: '#f5faf8' }
            : { node: '#10b981', line: '16, 185, 129', bg: '#0a0f1a' };
    }

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        initNodes();
    }

    function initNodes() {
        const count = window.innerWidth < 640 ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;
        nodes = [];
        for (let i = 0; i < count; i++) {
            nodes.push({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 1.8 + 0.8,
            });
        }
    }

    function draw() {
        const colors = getColors();
        ctx.clearRect(0, 0, W, H);

        // Draw lines between nearby nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MAX_LINK_DIST) {
                    const alpha = (1 - dist / MAX_LINK_DIST) * 0.35;
                    ctx.strokeStyle = `rgba(${colors.line}, ${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        for (const n of nodes) {
            // Mouse interaction
            const dx = n.x - mouseX;
            const dy = n.y - mouseY;
            const mouseDist = Math.sqrt(dx * dx + dy * dy);

            if (mouseDist < MOUSE_RADIUS) {
                const force = (1 - mouseDist / MOUSE_RADIUS) * 0.6;
                n.vx += (dx / mouseDist) * force * 0.15;
                n.vy += (dy / mouseDist) * force * 0.15;
            }

            // Move
            n.x += n.vx;
            n.y += n.vy;

            // Damping
            n.vx *= 0.985;
            n.vy *= 0.985;

            // Wrap around edges
            if (n.x < 0) n.x = W;
            if (n.x > W) n.x = 0;
            if (n.y < 0) n.y = H;
            if (n.y > H) n.y = 0;

            // Draw node
            ctx.fillStyle = colors.node;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();

            // Glow for larger nodes
            if (n.r > 1.5) {
                ctx.globalAlpha = 0.2;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1;
        if (isRunning) requestAnimationFrame(draw);
    }

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        mouseX = -9999;
        mouseY = -9999;
    });

    // Visibility optimization: pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isRunning = false;
        } else {
            isRunning = true;
            draw();
        }
    });

    // Theme change re-init
    const themeObserver = new MutationObserver(() => {
        // Just trigger a redraw; colors will be fetched in draw()
    });
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

    // Init
    window.addEventListener('resize', resize);
    resize();
    draw();

    console.log('🌐 Neural network background ready');
})();