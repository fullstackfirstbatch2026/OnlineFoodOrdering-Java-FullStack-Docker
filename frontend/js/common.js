/* Shared helpers: escaping, toasts, cart store, navbar */

const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const money = (n) => '$' + Number(n || 0).toFixed(2);

/* ---------- Food visuals (emoji + soft gradient by keyword) ---------- */
const FOOD_MAP = [
    [/burger|grill|joint/i, '🍔'], [/pizza|pizzeria/i, '🍕'], [/sushi|roll|japan|zen/i, '🍣'],
    [/fries|side/i, '🍟'], [/soup|miso/i, '🍜'], [/salad|healthy|green/i, '🥗'],
    [/cake|dessert|sweet|ice/i, '🍰'], [/taco|mex/i, '🌮'], [/pasta|ital/i, '🍝'],
    [/coffee|cafe|drink|beverage/i, '☕'], [/chicken|wing/i, '🍗'], [/starter/i, '🥟'], [/main/i, '🍽️']
];
const GRADIENTS = [
    'linear-gradient(135deg,#fed7aa,#fdba74)', 'linear-gradient(135deg,#bbf7d0,#86efac)',
    'linear-gradient(135deg,#fecaca,#fca5a5)', 'linear-gradient(135deg,#bfdbfe,#93c5fd)',
    'linear-gradient(135deg,#fde68a,#fcd34d)', 'linear-gradient(135deg,#e9d5ff,#d8b4fe)'
];
function foodEmoji(...texts) {
    const s = texts.filter(Boolean).join(' ');
    for (const [re, e] of FOOD_MAP) if (re.test(s)) return e;
    return '🍴';
}
const gradientFor = (id) => GRADIENTS[Math.abs(Number(id) || 0) % GRADIENTS.length];

/* ---------- Toasts ---------- */
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3200);
}

/* ---------- Confirm modal ---------- */
function confirmDialog(title, text, okLabel = 'Confirm') {
    return new Promise(resolve => {
        const back = document.createElement('div');
        back.className = 'modal-back';
        back.innerHTML = `<div class="card modal" role="dialog" aria-modal="true">
            <h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p>
            <div class="actions"><button class="btn btn-ghost" data-r="0">Cancel</button>
            <button class="btn btn-primary" data-r="1">${escapeHtml(okLabel)}</button></div></div>`;
        back.addEventListener('click', e => {
            const r = e.target.dataset && e.target.dataset.r;
            if (r !== undefined || e.target === back) { back.remove(); resolve(r === '1'); }
        });
        document.body.appendChild(back);
        back.querySelector('[data-r="1"]').focus();
    });
}

/* ---------- Auth state ---------- */
const Auth = {
    user() { try { return JSON.parse(localStorage.getItem('currentUser')); } catch { return null; } },
    logout() { localStorage.removeItem('currentUser'); showToast('Logged out successfully.', 'info'); setTimeout(() => (location.href = 'login.html'), 700); }
};

/* ---------- Cart store (quantity-aware, single restaurant) ---------- */
const Cart = {
    _read() {
        let raw; try { raw = JSON.parse(localStorage.getItem('cart')) || []; } catch { raw = []; }
        // migrate legacy format (one row per click, no quantity)
        const merged = new Map();
        raw.forEach(i => {
            const e = merged.get(i.id);
            if (e) e.quantity += (i.quantity || 1); else merged.set(i.id, { ...i, quantity: i.quantity || 1 });
        });
        return [...merged.values()];
    },
    _write(items) { localStorage.setItem('cart', JSON.stringify(items)); window.dispatchEvent(new Event('cart:change')); },
    items() { return this._read(); },
    count() { return this._read().reduce((s, i) => s + i.quantity, 0); },
    total() { return this._read().reduce((s, i) => s + i.price * i.quantity, 0); },
    qty(id) { const i = this._read().find(x => x.id === id); return i ? i.quantity : 0; },
    restaurantId() { const i = this._read()[0]; return i ? i.restaurantId : null; },
    restaurantName() { const i = this._read()[0]; return i ? i.restaurantName : ''; },
    add(item) {
        const items = this._read();
        const found = items.find(i => i.id === item.id);
        if (found) found.quantity = Math.min(found.quantity + 1, 20); else items.push({ ...item, quantity: 1 });
        this._write(items);
    },
    setQty(id, qty) {
        let items = this._read();
        if (qty <= 0) items = items.filter(i => i.id !== id);
        else items = items.map(i => (i.id === id ? { ...i, quantity: Math.min(qty, 20) } : i));
        this._write(items);
    },
    clear() { localStorage.removeItem('cart'); window.dispatchEvent(new Event('cart:change')); }
};

/* ---------- Navbar & footer ---------- */
function renderNav() {
    const host = document.getElementById('site-nav');
    if (!host) return;
    const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const link = (href, label, extra = []) => {
        const active = page === href || extra.includes(page);
        return `<li><a href="${href}" class="${active ? 'active' : ''}">${label}</a></li>`;
    };
    const user = Auth.user();
    const authHtml = user
        ? `<div class="user-chip" title="${escapeHtml(user.email || '')}"><span class="avatar">${escapeHtml((user.name || '?')[0].toUpperCase())}</span><span class="name">${escapeHtml(user.name)}</span></div>
           <button class="btn btn-ghost btn-sm" id="logout-btn">Logout</button>`
        : `<a href="login.html" class="btn btn-ghost btn-sm">Log in</a><a href="register.html" class="btn btn-primary btn-sm">Sign up</a>`;

    host.className = 'site-nav';
    host.innerHTML = `<div class="container nav-inner">
        <a href="index.html" class="brand"><span class="brand-mark">🍔</span><span>docker<em>eats</em></span></a>
        <ul class="nav-links" id="nav-links">
            ${link('index.html', 'Home')}${link('restaurants.html', 'Restaurants', ['menu.html'])}${link('orders.html', 'My Orders')}
        </ul>
        <div class="nav-actions">
            <a href="cart.html" class="cart-btn" aria-label="Cart">🛒<span class="cart-badge" id="cart-badge">0</span></a>
            ${authHtml}
            <button class="menu-toggle" id="menu-toggle" aria-label="Menu">☰</button>
        </div></div>`;

    document.getElementById('menu-toggle').onclick = () => document.getElementById('nav-links').classList.toggle('open');
    const lo = document.getElementById('logout-btn');
    if (lo) lo.onclick = () => Auth.logout();
    updateCartBadge(false);
}

function updateCartBadge(animate = true) {
    const b = document.getElementById('cart-badge');
    if (!b) return;
    const n = Cart.count();
    b.textContent = n;
    b.style.display = n > 0 ? 'grid' : 'none';
    if (animate) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
}

function renderFooter() {
    const f = document.getElementById('site-footer');
    if (!f) return;
    f.className = 'site-footer';
    f.innerHTML = `<div class="container"><span>© ${new Date().getFullYear()} Docker Eats</span><span>Fresh food, delivered fast.</span></div>`;
}

document.addEventListener('DOMContentLoaded', () => { renderNav(); renderFooter(); });
window.addEventListener('cart:change', () => updateCartBadge(true));
window.addEventListener('storage', () => updateCartBadge(false));
