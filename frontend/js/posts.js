document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById('postsContainer');
  const newPostForm = document.getElementById('newPostForm');

  async function loadPosts() {
    postsContainer.innerHTML = 'Načítám příspěvky...';
    try {
      const res = await authFetch(`${API_BASE}/posts`);
      if (!res.ok) {
        postsContainer.textContent = 'Nepodařilo se načíst příspěvky.';
        return;
      }
      const posts = await res.json();
      renderPosts(posts);
    } catch (err) {
      postsContainer.textContent = 'Chyba připojení k serveru.';
    }
  }

  function renderPosts(posts) {
    if (!posts.length) {
      postsContainer.textContent = 'Zatím žádné příspěvky.';
      return;
    }

    postsContainer.innerHTML = '';
    posts.forEach(post => {
      const card = document.createElement('div');
      card.className = 'card';

      const header = document.createElement('div');
      header.className = 'post-header';

      const img = document.createElement('img');
      img.className = 'post-user-photo';
      img.src = post.authorPhotoPath || 'https://via.placeholder.com/40';
      img.alt = 'Foto uživatele';

      const metaDiv = document.createElement('div');
      const nameEl = document.createElement('div');
      nameEl.textContent = `${post.authorFirstName} ${post.authorLastName}`;
      const metaEl = document.createElement('div');
      metaEl.className = 'post-meta';
      metaEl.textContent = new Date(post.createdAt).toLocaleString('cs-CZ');

      metaDiv.appendChild(nameEl);
      metaDiv.appendChild(metaEl);

      header.appendChild(img);
      header.appendChild(metaDiv);

      const titleEl = document.createElement('div');
      titleEl.className = 'post-title';
      titleEl.textContent = post.title;

      const textEl = document.createElement('div');
      textEl.className = 'post-text';
      textEl.textContent = post.text;

      card.appendChild(header);
      card.appendChild(titleEl);
      card.appendChild(textEl);

      if (post.imagePath) {
        const postImg = document.createElement('img');
        postImg.className = 'post-image';
        postImg.src = post.imagePath;
        card.appendChild(postImg);
      }

      // Akce: like, počet lajků, komentáře
      const actions = document.createElement('div');
      actions.className = 'post-actions';

      const likeBtn = document.createElement('button');
      likeBtn.textContent = 'Like';
      likeBtn.addEventListener('click', () => toggleLike(post.id));

      const likesCount = document.createElement('span');
      likesCount.textContent = `Lajků: ${post.likesCount || 0}`;
      likesCount.style.cursor = 'pointer';

      const likesList = document.createElement('div');
      likesList.className = 'likes-list';
      likesList.style.display = 'none';

      likesCount.addEventListener('click', async () => {
        if (likesList.style.display === 'none') {
          await loadLikes(post.id, likesList);
          likesList.style.display = 'block';
        } else {
          likesList.style.display = 'none';
        }
      });

      actions.appendChild(likeBtn);
      actions.appendChild(likesCount);

      card.appendChild(actions);
      card.appendChild(likesList);

      // Komentáře
      const commentsDiv = document.createElement('div');
      commentsDiv.className = 'comments';

      const commentsList = document.createElement('div');
      commentsList.className = 'comments-list';

      const commentForm = document.createElement('form');
      commentForm.className = 'comment-form';

      const commentInput = document.createElement('input');
      commentInput.type = 'text';
      commentInput.placeholder = 'Napiš komentář...';
      commentInput.required = true;

      const commentBtn = document.createElement('button');
      commentBtn.type = 'submit';
      commentBtn.textContent = 'Odeslat';

      commentForm.appendChild(commentInput);
      commentForm.appendChild(commentBtn);

      commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addComment(post.id, commentInput.value);
        commentInput.value = '';
        await loadComments(post.id, commentsList);
      });

      commentsDiv.appendChild(commentsList);
      commentsDiv.appendChild(commentForm);

      card.appendChild(commentsDiv);

      postsContainer.appendChild(card);

      // Načtení komentářů
      loadComments(post.id, commentsList);
    });
  }

  async function toggleLike(postId) {
    try {
      // Zkusíme přidat like, když failne 409/400, můžeme případně smazat
      const res = await authFetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST'
      });

      if (!res.ok) {
        // Zkusíme smazat like
        await authFetch(`${API_BASE}/posts/${postId}/like`, {
          method: 'DELETE'
        });
      }

      await loadPosts();
    } catch (err) {
      alert('Nepodařilo se změnit like.');
    }
  }

  async function loadLikes(postId, container) {
    container.textContent = 'Načítám lajky...';
    try {
      const res = await authFetch(`${API_BASE}/posts/${postId}/likes`);
      if (!res.ok) {
        container.textContent = 'Nepodařilo se načíst lajky.';
        return;
      }
      const likes = await res.json();
      if (!likes.length) {
        container.textContent = 'Zatím žádné lajky.';
        return;
      }
      container.innerHTML = likes.map(l => {
        const date = new Date(l.createdAt).toLocaleString('cs-CZ');
        return `${l.firstName} ${l.lastName} – ${date}`;
      }).join('<br>');
    } catch (err) {
      container.textContent = 'Chyba při načítání lajků.';
    }
  }

  async function loadComments(postId, container) {
    container.textContent = 'Načítám komentáře...';
    try {
      const res = await authFetch(`${API_BASE}/posts/${postId}/comments`);
      if (!res.ok) {
        container.textContent = 'Nepodařilo se načíst komentáře.';
        return;
      }
      const comments = await res.json();
      if (!comments.length) {
        container.textContent = 'Zatím žádné komentáře.';
        return;
      }
      container.innerHTML = '';
      comments.forEach(c => {
        const div = document.createElement('div');
        div.className = 'comment';
        const meta = document.createElement('div');
        meta.className = 'comment-meta';
        meta.textContent = `${c.authorFirstName} ${c.authorLastName} – ${new Date(c.createdAt).toLocaleString('cs-CZ')}`;
        const text = document.createElement('div');
        text.textContent = c.text;
        div.appendChild(meta);
        div.appendChild(text);
        container.appendChild(div);
      });
    } catch (err) {
      container.textContent = 'Chyba při načítání komentářů.';
    }
  }

  async function addComment(postId, text) {
    try {
      const res = await authFetch(`${API_BASE}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!res.ok) {
        alert('Nepodařilo se přidat komentář.');
      }
    } catch (err) {
      alert('Chyba při přidávání komentáře.');
    }
  }

  if (newPostForm) {
    newPostForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('postTitle').value.trim();
      const text = document.getElementById('postText').value.trim();
      const imageInput = document.getElementById('postImage');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('text', text);
      if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
      }

      try {
        const res = await authFetch(`${API_BASE}/posts`, {
          method: 'POST',
          body: formData
        });
        if (!res.ok) {
          alert('Nepodařilo se vytvořit příspěvek.');
          return;
        }
        newPostForm.reset();
        await loadPosts();
      } catch (err) {
        alert('Chyba při vytváření příspěvku.');
      }
    });
  }

  loadPosts();
});
