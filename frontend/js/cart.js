document.addEventListener('DOMContentLoaded', renderCart);
window.addEventListener('cart:change', renderCart);

function renderCart() {
    const list = document.getElementById('cart-items-container');
    if (!list) return;
    const items = Cart.items();
    const btn = document.getElementById('checkout-btn');

    if (!items.length) {
        list.innerHTML = `<div class="state" style="border:0"><div class="emoji">🛒</div><h3>Your cart is empty</h3><p>Looks like you haven't added any delicious meals yet.</p><a href="restaurants.html" class="btn btn-primary">Browse restaurants</a></div>`;
        document.getElementById('cart-subtotal').textContent = money(0);
        document.getElementById('cart-total').textContent = money(0);
        document.getElementById('cart-from').style.display = 'none';
        btn.disabled = true;
        document.getElementById('clear-cart').style.display = 'none';
        return;
    }

    list.innerHTML = items.map(i => `<div class="cart-row">
        <div class="thumb">${foodEmoji(i.name, i.category)}</div>
        <div class="info"><h4>${escapeHtml(i.name)}</h4><small>${money(i.price)} each</small></div>
        <div class="stepper"><button data-act="dec" data-id="${i.id}" aria-label="Decrease">−</button><span>${i.quantity}</span><button data-act="inc" data-id="${i.id}" aria-label="Increase">+</button></div>
        <div class="line">${money(i.price * i.quantity)}</div>
        <button class="icon-btn" data-act="del" data-id="${i.id}" aria-label="Remove ${escapeHtml(i.name)}">✕</button></div>`).join('');

    const total = Cart.total();
    document.getElementById('cart-subtotal').textContent = money(total);
    document.getElementById('cart-total').textContent = money(total);
    const from = document.getElementById('cart-from');
    from.style.display = Cart.restaurantName() ? 'block' : 'none';
    from.innerHTML = `Ordering from <strong>${escapeHtml(Cart.restaurantName())}</strong>`;
    document.getElementById('clear-cart').style.display = '';
    btn.disabled = false;
}

document.addEventListener('click', async e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const id = Number(b.dataset.id);
    if (b.dataset.act === 'inc') Cart.setQty(id, Cart.qty(id) + 1);
    if (b.dataset.act === 'dec') Cart.setQty(id, Cart.qty(id) - 1);
    if (b.dataset.act === 'del') { Cart.setQty(id, 0); showToast('Item removed.', 'info'); }
});

async function clearCart() {
    if (await confirmDialog('Clear cart?', 'This removes all items from your cart.', 'Clear')) Cart.clear();
}

async function submitOrder() {
    const items = Cart.items();
    if (!items.length) return;
    const user = Auth.user();
    if (!user) {
        showToast('Please log in to place your order.', 'error');
        setTimeout(() => (location.href = 'login.html'), 1200);
        return;
    }
    const btn = document.getElementById('checkout-btn');
    const original = btn.textContent;
    btn.textContent = 'Placing order…'; btn.disabled = true;

    try {
        const order = await fetchAPI('/orders', { method: 'POST', body: JSON.stringify({ customerId: user.id, restaurantId: items[0].restaurantId }) });
        for (const item of items) {
            await fetchAPI(`/orders/${order.orderId}/items`, { method: 'POST', body: JSON.stringify({ menuItemId: item.id, quantity: item.quantity }) });
        }
        Cart.clear();
        showToast('Order placed! Redirecting…', 'success');
        setTimeout(() => (location.href = 'orders.html'), 1400);
    } catch (err) {
        showToast(err.message || 'Failed to place order. Try again.', 'error');
        btn.textContent = original; btn.disabled = false;
    }
}
