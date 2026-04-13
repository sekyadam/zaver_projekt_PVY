
document.addEventListener('DOMContentLoaded', () => {
  const usersContainer = document.getElementById('usersContainer');
  const userInfo = document.getElementById('userInfo');
  const userPosts = document.getElementById('userPosts');
  const userActivityPosts = document.getElementById('userActivityPosts');

  // Seznam uživatelů
  if (usersContainer) {
    loadUsers();
  }

  // Detail uživatele
  if (userInfo && userPosts && userActivityPosts) {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    if (!userId) {
      userInfo.textContent = 'Chybí ID uživatele.';
      return;
    }
    loadUserDetail(userId);
  }

  async function loadUsers() {
    usersContainer.textContent = 'Načítám uživatele...';
    try {
      const res = await authFetch(`${API_BASE}/users`);
      if (!res.ok) {
        usersContainer.textContent = 'Nepodařilo se načíst uživatele.';
        return;
      }
      const users = await res.json();
      if (!users.length) {
        usersContainer.textContent = 'Žádní uživatelé.';
        return;
      }
      usersContainer.innerHTML = '';
      users.forEach(u => {
        const div = document.createElement('div');
        div.className = 'user-list-item card';

        const img = document.createElement('img');
        img.className = 'user-list-photo';
        img.src = u.photoPath || 'https://via.placeholder.com/32';

        const infoDiv = document.createElement('div');
        const nameEl = document.createElement('div');
        nameEl.className = 'user-list-name';
        const link = document.createElement('a');
        link.href = `userDetail.html?id=${u.id}`;
        link.textContent = `${u.firstName} ${u.lastName}`;
        nameEl.appendChild(link);

        const postsEl = document.createElement('div');
        postsEl.className = 'user-list-posts';
        postsEl.textContent = `Příspěvků: ${u.postsCount || 0}`;

        infoDiv.appendChild(nameEl);
        infoDiv.appendChild(postsEl);

        div.appendChild(img);
        div.appendChild(infoDiv);

        usersContainer.appendChild(div);
      });
    } catch (err) {
      usersContainer.textContent = 'Chyba při načítání uživatelů.';
    }
  }

  async function loadUserDetail(userId) {
    userInfo.textContent = 'Načítám uživatele...';
    userPosts.textContent = 'Načítám příspěvky...';
    userActivityPosts.textContent = 'Načítám aktivitu...';

    try {
      const res = await authFetch(`${API_BASE}/users/${userId}`);
      if (!res.ok) {
        userInfo.textContent = 'Nepodařilo se načíst uživatele.';
        return;
      }
      const data = await res.json();

      // Info o uživateli
      const u = data.user;
      const infoHtml = `
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${u.photoPath || 'https://via.placeholder.com/40'}" class="post-user-photo">
          <div>
            <div><strong>${u.firstName} ${u.lastName}</strong></div>
            <div>Věk: ${u.age}</div>
            <div>Pohlaví: ${u.gender}</div>
          </div>
        </div>
      `;
      userInfo.innerHTML = infoHtml;

      // Jeho příspěvky
      renderPostList(data.posts || [], userPosts);

      // Příspěvky, které lajknul nebo komentoval
      renderPostList(data.activityPosts || [], userActivityPosts);

    } catch (err) {
      userInfo.textContent = 'Chyba při načítání detailu uživatele.';
    }
  }

  function renderPostList(posts, container) {
    if (!posts.length) {
      container.textContent = 'Žádné příspěvky.';
      return;
    }
    container.innerHTML = '';
    posts.forEach(post => {
      const card = document.createElement('div');
      card.className = 'card';

      const titleEl = document.createElement('div');
      titleEl.className = 'post-title';
      titleEl.textContent = post.title;

      const metaEl = document.createElement('div');
      metaEl.className = 'post-meta';
      metaEl.textContent = new Date(post.createdAt).toLocaleString('cs-CZ');

      const textEl = document.createElement('div');
      textEl.className = 'post-text';
      textEl.textContent = post.text;

      const likesEl = document.createElement('div');
      likesEl.className = 'post-meta';
      likesEl.textContent = `Lajků: ${post.likesCount || 0}`;

      card.appendChild(titleEl);
      card.appendChild(metaEl);
      card.appendChild(textEl);
      card.appendChild(likesEl);

      container.appendChild(card);
    });
  }
});
