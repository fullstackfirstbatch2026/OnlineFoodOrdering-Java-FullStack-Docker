let allRestaurants = [];

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('restaurants-grid');
    const search = document.getElementById('search');
    search.value = new URLSearchParams(location.search).get('q') || '';
    search.addEventListener('input', render);

    grid.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
    try {
        allRestaurants = await fetchAPI('/restaurants');
        render();
    } catch (err) {
        grid.innerHTML = `<div class="state error"><div class="emoji">🔌</div><h3>Connection error</h3><p>${escapeHtml(err.message)}</p>
            <button class="btn btn-dark" onclick="location.reload()">Try again</button></div>`;
    }
});

function render() {
    const grid = document.getElementById('restaurants-grid');
    const q = document.getElementById('search').value.trim().toLowerCase();
    const list = allRestaurants.filter(r => !q || `${r.name} ${r.description} ${r.address}`.toLowerCase().includes(q));
    document.getElementById('result-count').textContent = `${list.length} restaurant${list.length === 1 ? '' : 's'}`;

    if (!list.length) {
        grid.innerHTML = `<div class="state"><div class="emoji">🔎</div><h3>${allRestaurants.length ? 'No matches' : 'No restaurants available'}</h3>
            <p>${allRestaurants.length ? 'Try a different search term.' : 'We are expanding – check back soon!'}</p></div>`;
        return;
    }
    grid.innerHTML = list.map(r => `<article class="card hover">
        <div class="r-cover" style="background:${gradientFor(r.id)}"><span>${foodEmoji(r.name, r.description)}</span></div>
        <div class="r-body">
            <h3>${escapeHtml(r.name)}</h3>
            <p class="desc">${escapeHtml(r.description || '')}</p>
            <div class="r-meta">📍 ${escapeHtml(r.address || 'Address unavailable')}</div>
            <a href="menu.html?restaurantId=${encodeURIComponent(r.id)}" class="btn btn-primary btn-block">View menu</a>
        </div></article>`).join('');
}
