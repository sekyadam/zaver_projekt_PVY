const API_BASE = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
}

function isLoggedIn() {
  return !!getToken();
}

function authFetch(url, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return fetch(url, { ...options, headers });
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

function setupMenu() {
  const loggedIn = isLoggedIn();
  const authLinks = document.querySelectorAll('.auth-only');
  const guestLinks = document.querySelectorAll('.guest-only');

  authLinks.forEach(el => el.style.display = loggedIn ? 'inline-block' : 'none');
  guestLinks.forEach(el => el.style.display = loggedIn ? 'none' : 'inline-block');

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearToken();
      window.location.href = 'login.html';
    });
  }
}
