document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('hero-search').addEventListener('submit', e => {
        e.preventDefault();
        const q = document.getElementById('hero-q').value.trim();
        location.href = 'restaurants.html' + (q ? `?q=${encodeURIComponent(q)}` : '');
    });

    const grid = document.getElementById('featured-grid');
    grid.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
    try {
        const list = await fetchAPI('/restaurants');
        document.getElementById('stat-restaurants').textContent = list.length;
        grid.innerHTML = list.slice(0, 3).map(restaurantCard).join('') ||
            '<div class="state"><div class="emoji">🏪</div><h3>No restaurants yet</h3><p>Check back soon.</p></div>';
    } catch (err) {
        grid.innerHTML = `<div class="state error"><div class="emoji">🔌</div><h3>Can't load restaurants</h3><p>${escapeHtml(err.message)}</p></div>`;
    }
});

function restaurantCard(r) {
    return `<article class="card hover">
        <div class="r-cover" style="background:${gradientFor(r.id)}"><span>${foodEmoji(r.name, r.description)}</span><span class="tag">Open now</span></div>
        <div class="r-body">
            <h3>${escapeHtml(r.name)}</h3>
            <p class="desc">${escapeHtml(r.description || '')}</p>
            <div class="r-meta">📍 ${escapeHtml(r.address || 'Address unavailable')}</div>
            <a href="menu.html?restaurantId=${encodeURIComponent(r.id)}" class="btn btn-primary btn-block">View menu</a>
        </div></article>`;
}
