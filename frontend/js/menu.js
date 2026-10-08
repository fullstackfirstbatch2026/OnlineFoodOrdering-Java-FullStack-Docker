let restaurant = null, menuItems = [], activeCat = 'All';

document.addEventListener('DOMContentLoaded', loadMenu);
window.addEventListener('cart:change', () => { if (menuItems.length) renderItems(); });

async function loadMenu() {
    const id = new URLSearchParams(location.search).get('restaurantId');
    const list = document.getElementById('menu-container');
    if (!id) {
        list.innerHTML = `<div class="state"><div class="emoji">😕</div><h3>No restaurant selected</h3><p>Choose a restaurant to see its menu.</p><a href="restaurants.html" class="btn btn-primary">Browse restaurants</a></div>`;
        return;
    }
    list.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div>';
    try {
        const [r, items] = await Promise.all([
            fetchAPI(`/restaurants/${encodeURIComponent(id)}`).catch(() => null),
            fetchAPI(`/restaurants/${encodeURIComponent(id)}/menu`)
        ]);
        restaurant = r || { id: Number(id), name: 'Menu', description: '' };
        menuItems = items;
        document.title = `${restaurant.name} | Docker Eats`;
        renderHeader();
        renderFilters();
        renderItems();
    } catch (err) {
        list.innerHTML = `<div class="state error"><div class="emoji">⚠️</div><h3>Failed to load menu</h3><p>${escapeHtml(err.message)}</p></div>`;
    }
}

function renderHeader() {
    document.getElementById('crumb-name').textContent = restaurant.name;
    document.getElementById('menu-hero').innerHTML = `
        <div class="emoji">${foodEmoji(restaurant.name, restaurant.description)}</div>
        <div><h1>${escapeHtml(restaurant.name)}</h1>
        <p>${escapeHtml(restaurant.description || '')}</p>
        ${restaurant.address ? `<p>📍 ${escapeHtml(restaurant.address)}</p>` : ''}</div>`;
    document.getElementById('menu-hero').style.background = gradientFor(restaurant.id);
}

function renderFilters() {
    const cats = ['All', ...new Set(menuItems.map(i => i.category).filter(Boolean))];
    const row = document.getElementById('filters');
    row.innerHTML = cats.map(c => `<button class="chip ${c === activeCat ? 'active' : ''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('');
    row.onclick = e => {
        const b = e.target.closest('[data-cat]'); if (!b) return;
        activeCat = b.dataset.cat; renderFilters(); renderItems();
    };
    document.getElementById('menu-search').oninput = renderItems;
}

function renderItems() {
    const list = document.getElementById('menu-container');
    const q = document.getElementById('menu-search').value.trim().toLowerCase();
    const items = menuItems.filter(i => (activeCat === 'All' || i.category === activeCat) && (!q || i.name.toLowerCase().includes(q)));

    if (!menuItems.length) {
        list.innerHTML = `<div class="state"><div class="emoji">🍽️</div><h3>Menu is empty</h3><p>This restaurant hasn't added items yet.</p></div>`;
        return;
    }
    if (!items.length) {
        list.innerHTML = `<div class="state"><div class="emoji">🔎</div><h3>Nothing found</h3><p>Try another category or search.</p></div>`;
        return;
    }
    list.innerHTML = items.map(i => {
        const qty = Cart.qty(i.id);
        const control = qty
            ? `<div class="stepper"><button data-act="dec" data-id="${i.id}" aria-label="Remove one">−</button><span>${qty}</span><button data-act="inc" data-id="${i.id}" aria-label="Add one">+</button></div>`
            : `<button class="btn btn-primary btn-sm" data-act="add" data-id="${i.id}">+ Add</button>`;
        return `<div class="menu-item">
            <div class="thumb">${foodEmoji(i.name, i.category)}</div>
            <div class="info"><h4>${escapeHtml(i.name)}</h4><span class="badge">${escapeHtml(i.category || 'Item')}</span></div>
            <div class="buy"><span class="price">${money(i.price)}</span>${control}</div></div>`;
    }).join('');
}

document.addEventListener('click', async e => {
    const btn = e.target.closest('[data-act]');
    if (!btn || !document.getElementById('menu-container').contains(btn)) return;
    const id = Number(btn.dataset.id);
    const item = menuItems.find(i => i.id === id);
    if (!item) return;

    if (btn.dataset.act === 'dec') return Cart.setQty(id, Cart.qty(id) - 1);
    if (btn.dataset.act === 'inc') return Cart.setQty(id, Cart.qty(id) + 1);

    // add – one restaurant per order
    const current = Cart.restaurantId();
    if (current && current !== restaurant.id) {
        const ok = await confirmDialog('Start a new cart?',
            `Your cart has items from ${Cart.restaurantName() || 'another restaurant'}. Adding this will clear it.`, 'Start new cart');
        if (!ok) return;
        Cart.clear();
    }
    Cart.add({ id, name: item.name, price: Number(item.price), restaurantId: restaurant.id, restaurantName: restaurant.name, category: item.category });
    showToast(`Added ${item.name} to your cart`, 'success');
});
