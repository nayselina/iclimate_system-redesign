// Magic card (Magic UI): each bordered card tracks the pointer so its border glow follows it.
document.querySelectorAll([
    '.pillar-card', '.feature-card', '.role-card', '.contact-method',
    '.mission-card', '.contact-form-card', '.contact-details',
].join(',')).forEach((card) => {
    card.classList.add('magic-card');
    // The glow is positioned inside the card; leave cards that are already positioned alone.
    if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
    card.addEventListener('pointermove', (event) => {
        const box = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - box.left}px`);
        card.style.setProperty('--my', `${event.clientY - box.top}px`);
    });
});

// Hero map: a real map of Lian with the Municipal Agriculture Office pinned and
// the office card attached to the pin. Leaflet loads only when the map is on the
// page; without it the card stays where the markup put it.
const heroMap = document.getElementById('heroMap');
if (heroMap) {
    Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')]).then(([{ default: L }]) => {
        const office = [Number(heroMap.dataset.lat), Number(heroMap.dataset.lng)];
        const map = L.map(heroMap, {
            zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false,
            boxZoom: false, keyboard: false, touchZoom: false, attributionControl: false,
        }).setView(office, 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
        }).addTo(map);

        const pin = L.marker(office, {
            icon: L.divIcon({ className: '', html: '<div class="hero-pin"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }),
            keyboard: false, interactive: false,
        }).addTo(map);

        const card = document.getElementById('heroMapCard');
        if (card) {
            pin.bindTooltip(card, { permanent: true, direction: 'top', offset: [0, -18], className: 'hero-map-tip', opacity: 1 }).openTooltip();
        }
        // Keep the pin above the weather figures at the bottom of the panel.
        map.panBy([0, heroMap.clientHeight * 0.12], { animate: false });
        new ResizeObserver(() => map.invalidateSize()).observe(heroMap);
    }).catch(() => { /* the panel still shows the office card without the map */ });
}

// Nav: one pill slides to whichever link is active (set on click and by the scroll spy).
const navLinks = document.getElementById('navLinks');
if (navLinks) {
    const indicator = document.createElement('span');
    indicator.className = 'nav-indicator';
    navLinks.prepend(indicator);
    navLinks.classList.add('has-indicator');
    const place = () => {
        const active = navLinks.querySelector('.nav-link.active');
        indicator.style.opacity = active ? '1' : '0';
        if (!active) return;
        indicator.style.width = `${active.offsetWidth}px`;
        indicator.style.height = `${active.offsetHeight}px`;
        indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    };
    new MutationObserver(place).observe(navLinks, { subtree: true, attributeFilter: ['class'] });
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place);
    place();
}

// Number ticker (Magic UI): a figure counts up to its value, keeping its unit.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.icTick = (el) => {
    const text = el.textContent.trim();
    const match = text.match(/^(-?\d+(?:\.(\d+))?)(.*)$/);
    if (!match || reduceMotion) return;
    const target = Number(match[1]);
    const decimals = match[2]?.length ?? 0;
    const start = performance.now();
    const frame = (now) => {
        const t = Math.min((now - start) / 1200, 1);
        const eased = 1 - Math.pow(2, -10 * t);
        el.textContent = (target * (t === 1 ? 1 : eased)).toFixed(decimals) + match[3];
        if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
};
document.querySelectorAll('[data-tick]').forEach(window.icTick);

// Dia text reveal (Magic UI): a band of colour sweeps across the place line and
// leaves the text in its own colour behind it. Starts with the page, alongside the blur fade.
const dia = document.querySelector('[data-dia]');
if (dia && !reduceMotion) {
    const colors = ['#7fd6b5', '#c9f2e1', '#ffb005', '#fa7a3d', '#e1e1fe'];
    const band = 17;
    const textColor = getComputedStyle(dia).color;
    const gradient = (pos) => {
        const start = pos - band;
        const end = pos + band;
        if (start >= 100) return 'none';
        const parts = [];
        if (start > 0) parts.push(`${textColor} 0%`, `${textColor} ${start.toFixed(2)}%`);
        colors.forEach((c, i) => parts.push(`${c} ${(start + (i / (colors.length - 1)) * band * 2).toFixed(2)}%`));
        if (end < 100) parts.push(`transparent ${end.toFixed(2)}%`, 'transparent 100%');
        return `linear-gradient(90deg, ${parts.join(', ')})`;
    };
    const ease = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
    Object.assign(dia.style, { color: 'transparent', webkitBackgroundClip: 'text', backgroundClip: 'text', backgroundImage: gradient(-band) });
    const startAt = performance.now();
    const frame = (now) => {
        const t = Math.min(Math.max((now - startAt) / 1200, 0), 1);
        const image = gradient(-band + ease(t) * (100 + band * 2));
        if (image === 'none' || t === 1) {
            Object.assign(dia.style, { color: '', backgroundImage: '', webkitBackgroundClip: '', backgroundClip: '' });
            return;
        }
        dia.style.backgroundImage = image;
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
}

// Particles (Magic UI): faint drifting specks over the hero photo that lean
// toward the pointer. Paused while the hero is off screen.
const particleCanvas = document.querySelector('.hero-particles');
if (particleCanvas && !reduceMotion) {
    const ctx = particleCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const quantity = 80, staticity = 50, easing = 50;
    const mouse = { x: 0, y: 0 };
    let w = 0, h = 0, circles = [], running = false, raf = 0;

    const make = () => ({
        x: Math.random() * w, y: Math.random() * h, tx: 0, ty: 0,
        size: Math.floor(Math.random() * 2) + 0.4, alpha: 0,
        target: Number((Math.random() * 0.6 + 0.1).toFixed(1)),
        dx: (Math.random() - 0.5) * 0.1, dy: (Math.random() - 0.5) * 0.1 - 0.05,
        magnetism: 0.1 + Math.random() * 4,
    });
    const resize = () => {
        w = particleCanvas.offsetWidth; h = particleCanvas.offsetHeight;
        particleCanvas.width = w * dpr; particleCanvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        circles = Array.from({ length: quantity }, make);
    };
    const tick = () => {
        ctx.clearRect(0, 0, w, h);
        circles.forEach((c, i) => {
            const edge = Math.min(c.x + c.tx, w - c.x - c.tx, c.y + c.ty, h - c.y - c.ty) - c.size;
            const fade = Math.max(edge / 20, 0);
            c.alpha = fade > 1 ? Math.min(c.alpha + 0.02, c.target) : c.target * fade;
            c.x += c.dx; c.y += c.dy;
            c.tx += (mouse.x / (staticity / c.magnetism) - c.tx) / easing;
            c.ty += (mouse.y / (staticity / c.magnetism) - c.ty) / easing;
            ctx.beginPath();
            ctx.arc(c.x + c.tx, c.y + c.ty, c.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(214, 245, 231, ${c.alpha})`;
            ctx.fill();
            if (c.x < -c.size || c.x > w + c.size || c.y < -c.size || c.y > h + c.size) circles[i] = make();
        });
        raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', (event) => {
        const box = particleCanvas.getBoundingClientRect();
        const x = event.clientX - box.left - w / 2;
        const y = event.clientY - box.top - h / 2;
        if (Math.abs(x) < w / 2 && Math.abs(y) < h / 2) { mouse.x = x; mouse.y = y; }
    });
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 200); });
    resize();
    new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !running) { running = true; raf = requestAnimationFrame(tick); }
        if (!entry.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
    }).observe(particleCanvas);
}

// Small line drawings of rice and weather drifting slowly behind every section.
document.querySelectorAll('.about-section, .features-section, .roles-section, .contact-section').forEach((section) => {
    // Line drawings: rice stalk, leaf, sun, cloud, rain, wind.
    const shapes = [
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V9"/><path d="M12 9c0-3 2-5 4-6-.2 2.6-1.6 4.8-4 6Z"/><path d="M12 13c0-3-2-5-4-6 .2 2.6 1.6 4.8 4 6Z"/><path d="M12 17c0-3 2-5 4-6-.2 2.6-1.6 4.8-4 6Z"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19C5 10 11 5 19 5c0 8-5 14-14 14Z"/><path d="M5 19 13 11"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9.5 4.3 4.3 0 0 1 17.5 18H7Z"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M7 14a3.5 3.5 0 0 1-.5-7A5 5 0 0 1 16 6.5 3.7 3.7 0 0 1 15.5 14H7Z"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 14h15a3 3 0 1 1-3 3"/></svg>',
    ];
    const layer = document.createElement('div');
    layer.className = 'drift-layer';
    layer.setAttribute('aria-hidden', 'true');
    const random = (min, max) => min + Math.random() * (max - min);
    for (let i = 0; i < 14; i++) {
        const item = document.createElement('span');
        const size = random(20, 36);
        item.innerHTML = shapes[i % shapes.length];
        Object.assign(item.style, {
            left: `${random(0, 100)}%`, top: `${random(0, 100)}%`,
            width: `${size}px`, height: `${size}px`, opacity: random(0.1, 0.22).toFixed(2),
        });
        item.style.setProperty('--dx', `${random(-70, 70)}px`);
        item.style.setProperty('--dy', `${random(-70, 70)}px`);
        item.style.setProperty('--rot', `${random(-120, 120)}deg`);
        item.style.setProperty('--dur', `${random(12, 24)}s`);
        item.style.setProperty('--delay', `${-random(0, 24)}s`);
        layer.append(item);
    }
    section.prepend(layer);
});
