document.addEventListener('DOMContentLoaded', loadOrders);

const fmtDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return isNaN(date) ? '' : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

async function loadOrders() {
    const box = document.getElementById('orders-container');
    const user = Auth.user();
    if (!user) {
        box.innerHTML = `<div class="state"><div class="emoji">🔒</div><h3>Log in to see your orders</h3><p>Your order history lives in your account.</p><a href="login.html" class="btn btn-primary">Log in</a></div>`;
        return;
    }
    box.innerHTML = '<div class="skeleton" style="height:200px"></div><div class="skeleton" style="height:200px"></div>';
    try {
        const orders = await fetchAPI('/orders');
        if (!orders.length) {
            box.innerHTML = `<div class="state"><div class="emoji">🧾</div><h3>No orders yet</h3><p>Time to satisfy those cravings!</p><a href="restaurants.html" class="btn btn-primary">Browse restaurants</a></div>`;
            return;
        }
        box.innerHTML = orders.map(o => {
            const status = (o.status || 'PENDING').toLowerCase();
            const lines = (o.items || []).map(it => `<div class="order-line">
                <span><span class="qty">${it.quantity}×</span>${escapeHtml(it.menuItemName || 'Menu item')}</span>
                <span>${money(it.price * it.quantity)}</span></div>`).join('') ||
                `<div class="order-line"><em style="color:var(--muted)">No items recorded</em></div>`;
            return `<article class="card">
                <div class="order-head">
                    <div><small>Order #${escapeHtml(o.id)} · ${escapeHtml(fmtDate(o.orderDate))}</small><strong>${escapeHtml(o.restaurantName || 'Restaurant order')}</strong></div>
                    <span class="status ${escapeHtml(status)}">${escapeHtml(status)}</span>
                </div>
                <div class="order-body">${lines}</div>
                <div class="order-foot"><span style="color:var(--muted)">Total</span><strong style="font-size:1.2rem">${money(o.totalAmount)}</strong></div>
            </article>`;
        }).join('');
    } catch (err) {
        box.innerHTML = `<div class="state error"><div class="emoji">⚠️</div><h3>Couldn't load orders</h3><p>${escapeHtml(err.message)}</p></div>`;
    }
}
