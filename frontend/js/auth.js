function setLoading(btn, on, text) {
    if (on) { btn.dataset.label = btn.textContent; btn.textContent = text; btn.disabled = true; }
    else { btn.textContent = btn.dataset.label || btn.textContent; btn.disabled = false; }
}
function showFormError(msg) {
    const el = document.getElementById('auth-message');
    el.textContent = msg; el.classList.toggle('show', !!msg);
}
function togglePw(id, btn) {
    const input = document.getElementById(id);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? 'Hide' : 'Show';
}

// Already signed in? Skip the auth pages.
document.addEventListener('DOMContentLoaded', () => { if (Auth.user()) location.replace('restaurants.html'); });

async function handleLogin(e) {
    e.preventDefault(); showFormError('');
    const btn = document.getElementById('login-btn');
    setLoading(btn, true, 'Signing in…');
    try {
        const user = await fetchAPI('/customers/login', {
            method: 'POST',
            body: JSON.stringify({ email: document.getElementById('email').value.trim(), password: document.getElementById('password').value })
        });
        localStorage.setItem('currentUser', JSON.stringify(user));
        showToast('Welcome back!', 'success');
        const next = new URLSearchParams(location.search).get('next');
        setTimeout(() => (location.href = next && /^[a-z]+\.html$/i.test(next) ? next : 'restaurants.html'), 700);
    } catch (err) {
        showFormError('Invalid email or password.');
        setLoading(btn, false);
    }
}

async function handleRegister(e) {
    e.preventDefault(); showFormError('');
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (password.length < 6) return showFormError('Password must be at least 6 characters.');
    if (password !== document.getElementById('confirm-password').value) return showFormError('Passwords do not match.');

    const btn = document.getElementById('register-btn');
    setLoading(btn, true, 'Creating account…');
    try {
        await fetchAPI('/customers/register', { method: 'POST', body: JSON.stringify({ name, email, password, role: 'USER' }) });
        showToast('Account created! Redirecting to login…', 'success');
        setTimeout(() => (location.href = 'login.html'), 1300);
    } catch (err) {
        showFormError('Could not create account. That email may already be in use.');
        setLoading(btn, false);
    }
}
