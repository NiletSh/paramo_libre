/* Páramo Libre — cliente API (PHP + MySQL). Sin Firebase. */
(function () {
  async function api(path, options = {}) {
    const opts = { credentials: "same-origin", ...options };
    if (
      opts.body &&
      typeof opts.body === "object" &&
      !(opts.body instanceof FormData)
    ) {
      opts.headers = { "Content-Type": "application/json", ...opts.headers };
      opts.body = JSON.stringify(opts.body);
    }
    const res = await fetch(path, opts);
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      const snippet = text ? text.replace(/\s+/g, " ").slice(0, 220) : "";
      data = {
        ok: false,
        error:
          "Respuesta no válida del servidor (¿PHP/MySQL?). " +
          (snippet || `HTTP ${res.status}`),
      };
    }
    if (!res.ok && data.ok !== false) {
      data.ok = false;
      data.error = data.error || `Error del servidor (HTTP ${res.status})`;
    }
    if (data.ok === false && !data.error) {
      data.error = "Error desconocido";
    }
    return data;
  }

  async function requireMe() {
    const me = await api("api/me.php");
    if (!me.ok || !me.user) {
      window.location.href = "index.php";
      return null;
    }
    return me.user;
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initials(title) {
    return String(title || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("");
  }

  function coverHtml(libro) {
    if (libro.imagen) {
      return `<img class="cover-img" src="${esc(libro.imagen)}" alt="" loading="lazy">`;
    }
    return `<div class="cover-fallback">${esc(initials(libro.titulo))}</div>`;
  }

  async function chooseMeetingPoint() {
    const data = await api("api/meeting_points.php");
    if (!data.ok) {
      alert(data.error || "No se pudieron cargar los puntos de encuentro");
      return null;
    }
    if (!Array.isArray(data.puntos) || !data.puntos.length) {
      alert("No hay puntos de encuentro disponibles por ahora.");
      return null;
    }

    const lines = data.puntos
      .map((p, index) => `${index + 1}. ${String(p.nombre || "")}`)
      .join("\n");
    const answer = window.prompt(
      `Selecciona el número del punto de encuentro verificado:\n\n${lines}`,
      "1"
    );
    if (answer === null) return null;
    const selectedIndex = Number(answer) - 1;
    if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= data.puntos.length) {
      alert("Selección no válida. Intenta de nuevo con el número del punto.");
      return null;
    }
    return data.puntos[selectedIndex];
  }

  function isStrongPassword(value) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{6,30}$/.test(String(value || ""));
  }

  function lockPasswordField(input) {
    if (!input || input.dataset.passwordGuardReady === "1") return;
    input.dataset.passwordGuardReady = "1";
    ["copy", "paste", "cut", "drop"].forEach((evt) => {
      input.addEventListener(evt, (e) => {
        e.preventDefault();
      });
    });
  }

  function setupPasswordGuards(root = document) {
    root.querySelectorAll('input[data-password-strong="true"]').forEach((input) => {
      lockPasswordField(input);
    });
  }

  function groupByGenre(libros) {
    return libros.reduce((acc, libro) => {
      const key = String(libro.genero || "General");
      if (!acc[key]) acc[key] = [];
      acc[key].push(libro);
      return acc;
    }, {});
  }

  async function initCatalog() {
    const user = await requireMe();
    if (!user) return;

    const grid = document.getElementById("booksGrid");
    const searchInput = document.getElementById("searchInput");
    const genreFilter = document.getElementById("genreFilter");
    if (!grid) return;

    async function loadAndRender() {
      const q = searchInput ? searchInput.value.trim() : "";
      const genero = genreFilter ? genreFilter.value.trim() : "";
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (genero) params.set("genero", genero);
      const data = await api("api/books.php?" + params.toString());
      if (!data.ok) {
        alert(data.error || "No se pudo cargar el catálogo");
        return;
      }
      if (genreFilter && Array.isArray(data.generos)) {
        const current = genreFilter.value;
        const options = ['<option value="">Todos los géneros</option>']
          .concat(data.generos.map((g) => `<option value="${esc(g)}">${esc(g)}</option>`))
          .join("");
        genreFilter.innerHTML = options;
        genreFilter.value = current;
      }
      grid.innerHTML = "";
      if (!Array.isArray(data.libros) || !data.libros.length) {
        grid.innerHTML = '<p class="muted">No se encontraron libros para ese filtro.</p>';
        return;
      }
      const grouped = groupByGenre(data.libros);
      Object.keys(grouped)
        .sort((a, b) => a.localeCompare(b, "es"))
        .forEach((genreName) => {
          const section = document.createElement("section");
          section.className = "genre-section";
          section.innerHTML = `<h3 class="genre-title">${esc(genreName)}</h3><div class="books-grid genre-grid"></div>`;
          const genreGrid = section.querySelector(".genre-grid");
          grouped[genreName].forEach((libro) => {
            const card = document.createElement("article");
            card.className = "book-card";
            const mine = Number(libro.usuario_id) === Number(user.id);
            card.innerHTML = `
              <div class="book-cover">${coverHtml(libro)}</div>
              <div class="book-meta">
                <div class="book-title">${esc(libro.titulo)}</div>
                <div>${esc(libro.autor)} · ${esc(libro.genero)}</div>
                <div class="book-publisher">Publica: <strong>${esc(libro.publicador_nombre)}</strong></div>
                <p class="book-synopsis">${esc((libro.descripcion || "").slice(0, 120))}${(libro.descripcion || "").length > 120 ? "…" : ""}</p>
              </div>
              <div class="book-footer">
                <span class="availability ${esc(libro.estado_class)}">${esc(libro.estado_label)}</span>
                <button type="button" class="btn primary-btn btn-adquirir" data-id="${libro.id}" ${mine || libro.estado !== "disponible" ? "disabled" : ""}>
                  ${mine ? "Tu libro" : libro.estado !== "disponible" ? "No disponible" : "Adquirir"}
                </button>
              </div>
            `;
            card.addEventListener("click", (e) => {
              if (e.target.closest(".btn-adquirir")) return;
              window.location.href = "detalle-libro.php?id=" + libro.id;
            });
            const btn = card.querySelector(".btn-adquirir");
            btn?.addEventListener("click", async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (btn.disabled) return;
              // Preguntar si es préstamo o para quedarse
              const isPrestamo = window.confirm('¿Deseas el libro en préstamo? Aceptar = Préstamo, Cancelar = Para quedártelo.');
              const modo = isPrestamo ? 'prestamo' : 'no_disponible';
              const r = await api("api/acquire.php", {
                method: "POST",
                body: { libro_id: libro.id, modo },
              });
              if (!r.ok) {
                alert(r.error || "No se pudo iniciar el intercambio");
                return;
              }
              alert(r.mensaje || "Chat privado listo");
              // Abrir chat; la selección del punto se hará dentro del chat
              window.location.href = "chat.php?id=" + r.chat_id;
            });
            genreGrid.appendChild(card);
          });
          grid.appendChild(section);
        });
    }

    await loadAndRender();
    searchInput?.addEventListener("input", () => {
      clearTimeout(initCatalog._t);
      initCatalog._t = setTimeout(loadAndRender, 200);
    });
    genreFilter?.addEventListener("change", loadAndRender);
  }

  async function initDetalle() {
    const user = await requireMe();
    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    if (!id) {
      window.location.href = "catalogo.php";
      return;
    }

    const container = document.getElementById("bookDetail");
    const commentsList = document.getElementById("commentsList");
    const commentForm = document.getElementById("commentForm");
    if (!container) return;

    const data = await api("api/book.php?id=" + id);
    if (!data.ok || !data.libro) {
      alert(data.error || "Libro no encontrado");
      window.location.href = "catalogo.php";
      return;
    }
    const libro = data.libro;
    const mine = Number(libro.usuario_id) === Number(user.id);
    const canAcquire = !mine && libro.estado === "disponible";

    container.innerHTML = `
      <div class="book-detail-cover">${coverHtml(libro)}</div>
      <div class="book-detail-info">
        <h2>${esc(libro.titulo)}</h2>
        <div class="book-detail-meta">
          Autor: ${esc(libro.autor)} · Género: ${esc(libro.genero)}<br>
          Publica: <strong>${esc(libro.publicador_nombre)}</strong>
        </div>
        <p class="book-detail-synopsis">${esc(libro.descripcion || "Sin descripción.")}</p>
        <div class="book-footer">
          <span class="availability ${esc(libro.estado_class)}">${esc(libro.estado_label)}</span>
          <button type="button" class="btn primary-btn" id="btnAdquirir" ${canAcquire ? "" : "disabled"}>
            ${mine ? "Es tu publicación" : libro.estado !== "disponible" ? "No disponible" : "Adquirir (abrir chat de trueque)"}
          </button>
        </div>
      </div>
    `;

    document.getElementById("btnAdquirir")?.addEventListener("click", async () => {
      if (!canAcquire) return;
      // Preguntar si es préstamo o para quedarse
      const isPrestamo = window.confirm('¿Deseas el libro en préstamo? Aceptar = Préstamo, Cancelar = Para quedártelo.');
      const modo = isPrestamo ? 'prestamo' : 'no_disponible';
      const r = await api("api/acquire.php", {
        method: "POST",
        body: { libro_id: libro.id, modo },
      });
      if (!r.ok) {
        alert(r.error || "Error");
        return;
      }
      alert(r.mensaje || "Listo");
      window.location.href = "chat.php?id=" + r.chat_id;
    });

    async function loadComments() {
      const c = await api("api/comments.php?libro_id=" + id);
      if (!c.ok || !commentsList) return;
      commentsList.innerHTML = "";
      c.comentarios.forEach((x) => {
        const art = document.createElement("article");
        art.className = "comment-item";
        art.innerHTML = `
          <div class="comment-author">${esc(x.autor_nombre)}</div>
          <div class="comment-date">${esc(String(x.creado_en || "").slice(0, 19))}</div>
          <p class="comment-text">${esc(x.texto)}</p>
        `;
        commentsList.appendChild(art);
      });
    }

    await loadComments();

    commentForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(commentForm);
      const texto = String(fd.get("texto") || "").trim();
      if (!texto) return;
      const r = await api("api/comments.php", {
        method: "POST",
        body: { libro_id: id, texto },
      });
      if (!r.ok) {
        alert(r.error || "No se pudo publicar");
        return;
      }
      commentForm.reset();
      await loadComments();
    });
  }

  async function initPublicar() {
    const user = await requireMe();
    if (!user) return;

    const form = document.getElementById("publishForm");
    const msg = document.getElementById("publishMsg");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      const fd = new FormData(form);
      const res = await fetch("api/books.php", {
        method: "POST",
        credentials: "same-origin",
        body: fd,
      });
      const data = await res.json();
      if (!data.ok) {
        msg.textContent = data.error || "Error";
        return;
      }
      msg.textContent = data.mensaje || "Publicado";
      alert("Libro publicado correctamente");
      window.location.href = "catalogo.php";
    });
  }

  async function initMisLibros() {
    const user = await requireMe();
    if (!user) return;

    const pub = document.getElementById("publishedGrid");
    const adq = document.getElementById("acquiredGrid");
    const data = await api("api/my_books.php");
    if (!data.ok) {
      alert(data.error || "Error");
      return;
    }

    function renderList(grid, libros) {
      if (!grid) return;
      grid.innerHTML = "";
      if (!libros.length) {
        grid.innerHTML = "<p class=\"muted\">No hay libros en esta sección.</p>";
        return;
      }
      libros.forEach((libro) => {
        const card = document.createElement("article");
        card.className = "book-card";
        card.innerHTML = `
          <div class="book-cover">${coverHtml(libro)}</div>
          <div class="book-meta">
            <div class="book-title">${esc(libro.titulo)}</div>
            <div>${esc(libro.autor)} · ${esc(libro.genero)}</div>
            <div class="book-publisher">Por: ${esc(libro.publicador_nombre)}</div>
          </div>
          <div class="book-footer">
            <span class="availability ${esc(libro.estado_class)}">${esc(libro.estado_label)}</span>
            <button type="button" class="btn primary-btn">Ver</button>
          </div>
        `;
        card.querySelector("button").addEventListener("click", () => {
          window.location.href = "detalle-libro.php?id=" + libro.id;
        });
        grid.appendChild(card);
      });
    }

    renderList(pub, data.publicados || []);
    renderList(adq, data.adquiridos || []);
  }

  async function initChatsIndex() {
    const user = await requireMe();
    if (!user) return;

    const listEl = document.getElementById("privateChatsList");
    const data = await api("api/chats.php");
    if (!data.ok) {
      alert(data.error || "Error");
      return;
    }

    listEl.innerHTML = "";
    (data.privados || []).forEach((row) => {
      const a = document.createElement("a");
      a.href = "chat.php?id=" + row.id;
      a.className = "chat-list-item";
      a.textContent = "Chat con " + row.otro_nombre;
      listEl.appendChild(a);
    });
    if (!data.privados?.length) {
      listEl.innerHTML = "<p class=\"muted\">Aún no tienes chats privados. Adquiere un libro para abrir uno.</p>";
    }
  }

  async function initChatRoom() {
    const user = await requireMe();
    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    const chatId = Number(params.get("id"));
    if (!chatId) {
      window.location.href = "chats.php";
      return;
    }

    const list = document.getElementById("chatMessages");
    const form = document.getElementById("chatForm");
    const title = document.getElementById("chatTitle");
    const deliveryCard = document.getElementById("deliveryCard");
    const deliveryInfo = document.getElementById("deliveryInfo");
    const deliveryPointSelect = document.getElementById("deliveryPointSelect");
    const deliveryPointSave = document.getElementById("deliveryPointSave");
    const deliveryConfirmBtn = document.getElementById("deliveryConfirmBtn");
    const deliveryStatusText = document.getElementById("deliveryStatusText");

    if (chatId === 1) {
      title.textContent = "Sala general";
    } else {
      title.textContent = "Chat privado";
    }

    async function loadDelivery() {
      if (chatId === 1 || !deliveryCard) return;
      const data = await api("api/delivery.php?chat_id=" + chatId);
      if (!data.ok || !data.exchange) return;
      deliveryCard.hidden = false;
      const ex = data.exchange;
      const mineDelivered = ex.is_propietario ? Number(ex.entregado_propietario) === 1 : Number(ex.entregado_solicitante) === 1;
      const otherDelivered = ex.is_propietario ? Number(ex.entregado_solicitante) === 1 : Number(ex.entregado_propietario) === 1;
      if (deliveryInfo) {
        const pointText = ex.punto_entrega ? `Punto seleccionado: ${ex.punto_entrega}.` : "Aún sin punto seleccionado.";
        deliveryInfo.textContent = `Libro: ${ex.libro_titulo}. ${pointText} Puedes cambiarlo y confirmar la entrega cuando corresponda.`;
      }
      if (deliveryPointSelect && Array.isArray(data.puntos)) {
        deliveryPointSelect.innerHTML = ['<option value="">Selecciona...</option>']
          .concat(data.puntos.map((p) => `<option value="${Number(p.id)}">${esc(p.nombre)}</option>`))
          .join("");
        deliveryPointSelect.value = ex.punto_entrega_id ? String(ex.punto_entrega_id) : "";
      }
      if (deliveryStatusText) {
        const mine = mineDelivered ? "Tu entrega: confirmada" : "Tu entrega: pendiente";
        const other = otherDelivered ? "Otra persona: confirmada" : "Otra persona: pendiente";
        deliveryStatusText.textContent = `${mine} · ${other}`;
      }
      if (deliveryConfirmBtn) {
        deliveryConfirmBtn.disabled = !ex.punto_entrega || mineDelivered;
      }
      // Mostrar botón de devolver libro solo para el solicitante y cuando el intercambio esté aceptado o en préstamo
      const returnBtn = document.getElementById('returnBookBtn');
      if (returnBtn) {
        // mostrar si el usuario es solicitante y el libro está en préstamo o intercambio aceptado
        const shouldShow = !!(ex.is_solicitante && (ex.punto_entrega || ex.entregado_solicitante || ex.entregado_propietario));
        returnBtn.style.display = shouldShow ? 'inline-flex' : 'none';
      }
    }

    deliveryPointSave?.addEventListener("click", async () => {
      const pointId = Number(deliveryPointSelect?.value || 0);
      if (!pointId) {
        alert("Selecciona un punto de entrega");
        return;
      }
      const r = await api("api/delivery.php", {
        method: "POST",
        body: { chat_id: chatId, action: "set_point", punto_entrega_id: pointId },
      });
      if (!r.ok) {
        alert(r.error || "No se pudo guardar el punto");
        return;
      }
      await loadDelivery();
    });

    deliveryConfirmBtn?.addEventListener("click", async () => {
      const r = await api("api/delivery.php", {
        method: "POST",
        body: { chat_id: chatId, action: "confirm_delivery" },
      });
      if (!r.ok) {
        alert(r.error || "No se pudo confirmar la entrega");
        return;
      }
      await loadDelivery();
      await loadMessages();
    });

    document.getElementById('returnBookBtn')?.addEventListener('click', async () => {
      if (!confirm('¿Confirmas que ya devolviste el libro y quieres marcarlo como disponible?')) return;
      const r = await api('api/delivery.php', {
        method: 'POST',
        body: { chat_id: chatId, action: 'return_book' },
      });
      if (!r.ok) {
        alert(r.error || 'No se pudo marcar como disponible');
        return;
      }
      alert('Libro marcado como disponible');
      await loadDelivery();
      await loadMessages();
    });

    async function loadMessages() {
      const data = await api("api/messages.php?chat_id=" + chatId);
      if (!data.ok) {
        alert(data.error || "No se pudieron cargar mensajes");
        return;
      }
      list.innerHTML = "";
      data.mensajes.forEach((m) => {
        const art = document.createElement("article");
        art.className = "chat-message";
        const who = m.es_sistema
          ? "Sistema"
          : esc(m.autor_nombre || "Usuario");
        art.innerHTML = `
          <div class="chat-meta">
            <span class="chat-author">${who}</span>
            <span class="chat-date">${esc(String(m.creado_en || "").slice(0, 16))}</span>
          </div>
          <div class="chat-text">${esc(m.texto)}</div>
        `;
        list.appendChild(art);
      });
      list.scrollTop = list.scrollHeight;
    }

    await loadMessages();
    await loadDelivery();
    setInterval(loadMessages, 4000);
    setInterval(loadDelivery, 6000);

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const texto = String(fd.get("message") || "").trim();
      if (!texto) return;
      const r = await api("api/messages.php", {
        method: "POST",
        body: { chat_id: chatId, texto },
      });
      if (!r.ok) {
        alert(r.error || "No se envió");
        return;
      }
      form.reset();
      await loadMessages();
    });
  }

  async function initLogin() {
    const form = document.getElementById("loginForm");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = await api("api/login.php", {
        method: "POST",
        body: {
          correo: fd.get("identifier"),
          password: fd.get("password"),
        },
      });
      if (!data.ok) {
        alert(data.error || "Error al iniciar sesión");
        return;
      }
      window.location.href = "catalogo.php";
    });
  }

  async function initRegistro() {
    const form = document.getElementById("registerForm");
    const passInput = form?.querySelector('input[name="password"]');
    if (passInput) lockPasswordField(passInput);
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const password = String(fd.get("password") || "");
      if (!isStrongPassword(password)) {
        alert("La contraseña debe ser alfanumérica (6-30), con al menos una letra y un número.");
        return;
      }
      const data = await api("api/register.php", {
        method: "POST",
        body: {
          nombre: fd.get("name"),
          correo: fd.get("email"),
          password,
        },
      });
      if (!data.ok) {
        alert(data.error || "No se pudo registrar");
        return;
      }
      alert(data.mensaje || "Cuenta creada correctamente");
      window.location.href = "catalogo.php";
    });
  }

  async function initRecuperar() {
    const form = document.getElementById("recoverForm");
    const hint = document.getElementById("recoverHint");
    const resetForm = document.getElementById("recoverResetForm");
    const tokenInput = resetForm?.querySelector('input[name="token"]');
    const passInput = resetForm?.querySelector('input[name="newPassword"]');
    if (passInput) lockPasswordField(passInput);
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = await api("api/forgot.php", {
        method: "POST",
        body: { correo: fd.get("email") },
      });
      if (tokenInput) tokenInput.value = "";
      if (!data.ok) {
        hint.replaceChildren();
        const p = document.createElement("p");
        p.textContent = data.error || "Ese correo no existe.";
        hint.appendChild(p);
        if (resetForm) resetForm.hidden = true;
        return;
      }
      hint.replaceChildren();
      const url = new URL(String(data.enlace_demo || ""), window.location.href);
      const token = url.searchParams.get("token") || "";
      if (!token) {
        const p = document.createElement("p");
        p.textContent = "No se pudo preparar el cambio de contraseña. Intenta de nuevo.";
        hint.appendChild(p);
        if (resetForm) resetForm.hidden = true;
        return;
      }
      if (tokenInput) tokenInput.value = token;
      if (resetForm) resetForm.hidden = false;

      const p = document.createElement("p");
      p.textContent = "Correo encontrado. Ahora escribe tu nueva contraseña.";
      hint.appendChild(p);

      passInput?.focus();
    });

    resetForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(resetForm);
      const token = String(fd.get("token") || "").trim();
      const password = String(fd.get("newPassword") || "");
      if (!isStrongPassword(password)) {
        alert("La contraseña debe ser alfanumérica (6-30), con al menos una letra y un número.");
        return;
      }
      const data = await api("api/reset_password.php", {
        method: "POST",
        body: { token, password },
      });
      if (!data.ok) {
        alert(data.error || "Error");
        return;
      }
      alert(data.mensaje || "Contraseña actualizada");
      window.location.href = "index.php";
    });
  }

  async function initResetPassword() {
    const form = document.getElementById("resetForm");
    const passInput = form?.querySelector('input[name="newPassword"]');
    if (passInput) lockPasswordField(passInput);
    const params = new URLSearchParams(window.location.search);
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const token =
        String(fd.get("token") || "").trim() ||
        String(params.get("token") || "").trim();
      const password = String(fd.get("newPassword") || "");
      if (!isStrongPassword(password)) {
        alert("La contraseña debe ser alfanumérica (6-30), con al menos una letra y un número.");
        return;
      }
      const data = await api("api/reset_password.php", {
        method: "POST",
        body: {
          token,
          password,
        },
      });
      if (!data.ok) {
        alert(data.error || "Error");
        return;
      }
      alert(data.mensaje || "Contraseña actualizada");
      window.location.href = "index.php";
    });
  }

  const page = document.body.getAttribute("data-page");
  const boot = {
    catalogo: initCatalog,
    detalle: initDetalle,
    publicar: initPublicar,
    "mis-libros": initMisLibros,
    chats: initChatsIndex,
    chat: initChatRoom,
    login: initLogin,
    registro: initRegistro,
    recuperar: initRecuperar,
    "reset-password": initResetPassword,
  };

  const fn = boot[page];
  if (fn) {
    document.addEventListener("DOMContentLoaded", fn);
  }
  document.addEventListener("DOMContentLoaded", () => setupPasswordGuards(document));
})();
