document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('loginError');
      errorEl.textContent = '';

      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
          errorEl.textContent = 'Neplatné přihlašovací údaje.';
          return;
        }

        const data = await res.json();
        setToken(data.token);
        window.location.href = 'wall.html';
      } catch (err) {
        errorEl.textContent = 'Chyba připojení k serveru.';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const age = parseInt(document.getElementById('age').value, 10);
      const gender = document.getElementById('gender').value;
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const photoInput = document.getElementById('photo');
      const errorEl = document.getElementById('registerError');
      errorEl.textContent = '';

      // JS kontrola věku
      if (age < 13) {
        errorEl.textContent = 'Musíš mít alespoň 13 let.';
        return;
      }

      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('age', age);
      formData.append('gender', gender);
      formData.append('username', username);
      formData.append('password', password);
      if (photoInput.files[0]) {
        formData.append('photo', photoInput.files[0]);
      }

      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          errorEl.textContent = 'Registrace se nezdařila.';
          return;
        }

        // Po registraci můžeš buď rovnou přihlásit, nebo přesměrovat na login
        window.location.href = 'login.html';
      } catch (err) {
        errorEl.textContent = 'Chyba připojení k serveru.';
      }
    });
  }
});
