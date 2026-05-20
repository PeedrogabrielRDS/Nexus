// ---- READING PROGRESS ----
window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    const pct = Math.round((window.scrollY / total) * 100);
    document.documentElement.style.setProperty('--progress', pct + '%');
});

// ---- SIDEBAR ----
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');
document.getElementById('menu-btn').addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
});
overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
});
// close on sidebar link click
sidebar.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
    });
});

// ---- ACTIVE NAV on SCROLL ----
const sections = document.querySelectorAll('.section-anchor');
const navPills = document.querySelectorAll('.nav-pill');
const sidebarItems = document.querySelectorAll('.sidebar-item');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            navPills.forEach(p => p.classList.toggle('active', p.getAttribute('href') === '#' + id));
            sidebarItems.forEach(s => s.classList.toggle('active', s.getAttribute('href') === '#' + id));
        }
    });
}, { rootMargin: '-30% 0px -60% 0px' });

sections.forEach(s => observer.observe(s));

// ---- COLLAPSIBLE ----
function toggleCollapsible(header) {
    const body = header.nextElementSibling;
    header.classList.toggle('active');
    body.classList.toggle('open');
}

// ---- ROADMAP ITEM TOGGLE ----
function toggleDone(el) {
    el.classList.toggle('done');
}

// ---- COPY HEX ----
const tooltip = document.getElementById('hex-tooltip');
let tooltipTimeout;
function copyHex(hex) {
    navigator.clipboard.writeText(hex).catch(() => { });
    tooltip.textContent = hex + ' copiado!';
    tooltip.classList.add('show');
    clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => tooltip.classList.remove('show'), 1800);
}

// ---- SEARCH ----
const searchInput = document.getElementById('doc-search');
const searchCount = document.getElementById('search-count');

searchInput.addEventListener('input', () => {
    // Remove previous highlights
    document.querySelectorAll('.search-highlight').forEach(el => {
        const parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });

    const query = searchInput.value.trim();
    if (query.length < 2) { searchCount.textContent = ''; return; }

    const root = document.querySelector('.doc-root');
    let count = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    nodes.forEach(textNode => {
        if (!textNode.textContent.match(regex)) return;
        if (textNode.parentElement.closest('.sticky-nav, #sidebar, script, style')) return;
        const frag = document.createDocumentFragment();
        let last = 0;
        let m;
        regex.lastIndex = 0;
        const text = textNode.textContent;
        while ((m = regex.exec(text)) !== null) {
            frag.appendChild(document.createTextNode(text.slice(last, m.index)));
            const span = document.createElement('span');
            span.className = 'search-highlight';
            span.textContent = m[0];
            frag.appendChild(span);
            last = m.index + m[0].length;
            count++;
        }
        frag.appendChild(document.createTextNode(text.slice(last)));
        textNode.parentNode.replaceChild(frag, textNode);
    });

    searchCount.textContent = count > 0 ? count + ' resultado' + (count > 1 ? 's' : '') : 'sem resultados';

    // scroll to first highlight
    const first = document.querySelector('.search-highlight');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
});