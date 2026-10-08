// Backend base URL. Override by setting window.API_BASE_URL before this script if needed.
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080/api';

async function fetchAPI(endpoint, options = {}) {
    const opts = { ...options, headers: { ...(options.headers || {}) } };
    if (opts.body && !opts.headers['Content-Type']) opts.headers['Content-Type'] = 'application/json';

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, opts);
    } catch (err) {
        throw new Error('Cannot reach the server. Is the backend running?');
    }

    // Expired session handling – but not for the login call itself (wrong password is not an expired session)
    const isAuthCall = endpoint.startsWith('/customers/login') || endpoint.startsWith('/customers/register');
    if ((response.status === 401 || response.status === 403) && !isAuthCall) {
        localStorage.removeItem('currentUser');
        if (typeof showToast === 'function') showToast('Session expired. Please log in again.', 'error');
        setTimeout(() => (window.location.href = 'login.html'), 1200);
        throw new Error('Unauthorized');
    }

    const text = await response.text();
    let data = {};
    if (text) { try { data = JSON.parse(text); } catch { data = { message: text }; } }

    if (!response.ok) {
        throw new Error((data && data.message) || `Request failed (${response.status})`);
    }
    return data;
}
