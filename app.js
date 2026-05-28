const STORAGE_KEYS = {
  users: "paramoLibreUsers",
  session: "paramoLibreSession",
  comments: "paramoLibreComments",
  chatMessages: "paramoLibreChatMessages",
  resetTokens: "paramoLibreResetTokens",
};

// Datos de libros (prototipo de catálogo)
const sampleBooks = [
  {
    id: 1,
    title: "Senderos del Páramo",
    author: "Lucía Andrade",
    genre: "Naturaleza",
    coverUrl: "img/cover-1.svg",
    shortSynopsis: "Un viaje literario por los ecosistemas de páramo.",
    fullSynopsis:
      "Un recorrido profundo y reflexivo por los ecosistemas de páramo andino, explorando su biodiversidad, su importancia ecológica y las comunidades que lo habitan. A través de relatos y crónicas, la autora nos invita a cuidar y valorar estos territorios únicos.",
    available: true,
    loaned: false,
  },
  {
    id: 2,
    title: "Libres entre Nubes",
    author: "Andrés Páramo",
    genre: "Ficción",
    coverUrl: "img/cover-2.svg",
    shortSynopsis: "Historias cortas inspiradas en montañas nubladas.",
    fullSynopsis:
      "Colección de relatos que combinan realismo mágico y costumbrismo, ambientados en pequeñas comunidades de montaña. Cada historia explora la relación entre los habitantes, la niebla constante y los paisajes llenos de vida.",
    available: true,
    loaned: true,
  },
  {
    id: 3,
    title: "Guardianes del Agua",
    author: "Carolina Mera",
    genre: "Ensayo",
    coverUrl: "img/cover-3.svg",
    shortSynopsis: "Reflexiones sobre el agua y el cambio climático.",
    fullSynopsis:
      "Ensayo que analiza el papel de los páramos como fábricas naturales de agua. La autora aborda los retos del cambio climático, la expansión urbana y la minería sobre estos ecosistemas, proponiendo alternativas sustentables.",
    available: false,
    loaned: false,
  },
];

const defaultComments = [
  {
    author: "Ana",
    content: "Me encanta la temática de naturaleza y lectura responsable.",
    date: "2026-03-01",
  },
  {
    author: "Carlos",
    content: "Sería genial tener más libros sobre comunidades indígenas.",
    date: "2026-03-02",
  },
];

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getSession() {
  return readJson(STORAGE_KEYS.session, null);
}

function setSession(session) {
  writeJson(STORAGE_KEYS.session, session);
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

function getUsers() {
  return readJson(STORAGE_KEYS.users, []);
}

function saveUsers(users) {
  writeJson(STORAGE_KEYS.users, users);
}

function normalize(str) {
  return String(str || "").trim().toLowerCase();
}

function ensureAuthOrRedirect() {
  const session = getSession();
  if (session) return session;
  window.location.href = "index.html";
  return null;
}

function isAuthPage(path) {
  return (
    path.endsWith("index.html") ||
    path.endsWith("registro.html") ||
    path.endsWith("recuperar.html") ||
    path.endsWith("/index.html") ||
    path.endsWith("/registro.html") ||
    path.endsWith("/recuperar.html") ||
    path === "/" ||
    path === ""
  );
}

function initPage() {
  const path = window.location.pathname;

  // Proteger pantallas internas.
  if (!isAuthPage(path)) {
    ensureAuthOrRedirect();
  } else {
    // Si ya hay sesión y abre index, mandarlo al catálogo.
    if (path.endsWith("index.html") || path === "/" || path === "") {
      if (getSession()) window.location.href = "catalogo.html";
    }
  }

  wireLogoutLinks();

  if (path.endsWith("catalogo.html")) {
    renderCatalog();
  } else if (path.endsWith("detalle-libro.html")) {
    renderBookDetail();
  } else if (path.endsWith("comentarios.html")) {
    renderComments();
  } else if (path.endsWith("mis-libros.html")) {
    renderMyBooks();
  } else if (path.endsWith("chats.html")) {
    renderChats();
  } else if (path.endsWith("restablecer.html")) {
    renderPasswordReset();
  }

  setupForms();
}

// Catálogo de libros
function renderCatalog() {
  const grid = document.getElementById("booksGrid");
  const searchInput = document.getElementById("searchInput");
  if (!grid) return;

  function filterAndRender() {
    const term = (searchInput?.value || "").toLowerCase();
    const filtered = sampleBooks.filter((book) => {
      const text =
        `${book.title} ${book.author} ${book.genre}`.toLowerCase();
      return text.includes(term);
    });
    grid.innerHTML = "";

    filtered.forEach((book) => {
      const card = document.createElement("article");
      card.className = "book-card";
      const availability = getAvailabilityInfo(book);
      card.innerHTML = `
        <div class="book-cover">
          ${renderCover(book)}
        </div>
        <div class="book-meta">
          <div class="book-title">${book.title}</div>
          <div>${book.author} · ${book.genre}</div>
          <p class="book-synopsis">${book.shortSynopsis}</p>
        </div>
        <div class="book-footer">
          <span class="availability ${availability.className}">
            ${availability.label}
          </span>
          <button class="btn primary-btn" data-book-id="${book.id}">
            Adquirir
          </button>
        </div>
      `;
      card.addEventListener("click", (e) => {
        if (e.target.tagName.toLowerCase() === "button") {
          e.stopPropagation();
          addToMyBooks(book.id);
          return;
        }
        window.location.href = `detalle-libro.html?id=${book.id}`;
      });
      grid.appendChild(card);
    });
  }

  filterAndRender();
  if (searchInput) {
    searchInput.addEventListener("input", filterAndRender);
  }
}

// Detalle del libro
function renderBookDetail() {
  const container = document.getElementById("bookDetail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const book = sampleBooks.find((b) => b.id === id) || sampleBooks[0];

  const availability = getAvailabilityInfo(book);
  container.innerHTML = `
    <div class="book-detail-cover">${renderCover(book, true)}</div>
    <div class="book-detail-info">
      <h2>${book.title}</h2>
      <div class="book-detail-meta">
        Autor: ${book.author} · Género: ${book.genre}
      </div>
      <p class="book-detail-synopsis">${book.fullSynopsis}</p>
      <div class="book-footer">
        <span class="availability ${availability.className}">
          ${availability.label}
        </span>
        <button class="btn primary-btn" onclick="addToMyBooks(${book.id})">
          Adquirir
        </button>
      </div>
    </div>
  `;
}

// Comentarios
function renderComments() {
  const list = document.getElementById("commentsList");
  const form = document.getElementById("commentForm");
  if (!list) return;

  const session = ensureAuthOrRedirect();
  if (!session) return;

  let comments = readJson(STORAGE_KEYS.comments, null);
  if (!Array.isArray(comments) || comments.length === 0) {
    comments = [...defaultComments];
    writeJson(STORAGE_KEYS.comments, comments);
  }

  function paint() {
    list.innerHTML = "";
    comments.forEach((c) => {
      const item = document.createElement("article");
      item.className = "comment-item";
      item.innerHTML = `
        <div class="comment-author">${c.author}</div>
        <div class="comment-date">${c.date}</div>
        <p class="comment-text">${c.content}</p>
      `;
      list.appendChild(item);
    });
  }

  paint();

  if (form) {
    const authorInput = form.querySelector('input[name="author"]');
    if (authorInput && session?.name) authorInput.value = session.name;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const author = formData.get("author");
      const content = formData.get("content");
      if (!author || !content) return;
      const today = new Date().toISOString().slice(0, 10);
      comments = [
        { author: String(author), content: String(content), date: today },
        ...comments,
      ];
      writeJson(STORAGE_KEYS.comments, comments);
      form.reset();
      paint();
    });
  }
}

function myBooksKeyFor(email) {
  return `paramoLibreMyBooks:${normalize(email)}`;
}

function getMyBooksIds() {
  const session = getSession();
  if (!session?.email) return [];
  return readJson(myBooksKeyFor(session.email), []);
}

function saveMyBooksIds(ids) {
  const session = getSession();
  if (!session?.email) return;
  writeJson(myBooksKeyFor(session.email), ids);
}

function addToMyBooks(bookId) {
  const session = ensureAuthOrRedirect();
  if (!session) return;

  const book = sampleBooks.find((b) => b.id === bookId);
  if (!book) return;
  if (!book.available) {
    alert("Este libro no está disponible por ahora.");
    return;
  }

  const ids = getMyBooksIds();
  if (!ids.includes(bookId)) {
    ids.push(bookId);
    saveMyBooksIds(ids);
    alert("Libro agregado a 'Mis libros'.");
  } else {
    alert("Este libro ya está en 'Mis libros'.");
  }
}

function getAvailabilityInfo(book) {
  if (!book.available) {
    return { label: "No disponible", className: "unavailable" };
  }
  if (book.loaned) {
    return { label: "En préstamo", className: "loaned" };
  }
  return { label: "Disponible", className: "" };
}

function renderMyBooks() {
  const grid = document.getElementById("myBooksGrid");
  if (!grid) return;

  const session = ensureAuthOrRedirect();
  if (!session) return;

  const ids = getMyBooksIds();
  const books = sampleBooks.filter((b) => ids.includes(b.id));

  if (books.length === 0) {
    grid.innerHTML =
      "<p>Aún no has adquirido ningún libro. Ve al catálogo para comenzar.</p>";
    return;
  }

  grid.innerHTML = "";
  books.forEach((book) => {
    const card = document.createElement("article");
    card.className = "book-card";
    card.innerHTML = `
      <div class="book-cover">
        ${renderCover(book)}
      </div>
      <div class="book-meta">
        <div class="book-title">${book.title}</div>
        <div>${book.author} · ${book.genre}</div>
        <p class="book-synopsis">${book.shortSynopsis}</p>
      </div>
      <div class="book-footer">
        <button class="btn primary-btn" onclick="window.location.href='detalle-libro.html?id=${book.id}'">
          Ver detalle
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function wireLogoutLinks() {
  const logoutLinks = document.querySelectorAll(".nav-logout");
  if (!logoutLinks?.length) return;
  logoutLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      clearSession();
      window.location.href = "index.html";
    });
  });
}

// Formularios de autenticación (persistencia local para prototipo funcional)
function setupForms() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(loginForm);
      const identifier = normalize(data.get("identifier"));
      const password = String(data.get("password") || "");
      const users = getUsers();

      const user = users.find((u) => {
        return (
          normalize(u.email) === identifier ||
          normalize(u.name) === identifier ||
          normalize(u.username) === identifier
        );
      });

      if (!user || user.password !== password) {
        alert("Usuario/correo o contraseña incorrectos.");
        return;
      }

      setSession({ email: user.email, name: user.name });
      window.location.href = "catalogo.html";
    });
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(registerForm);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const password = String(data.get("password") || "");

      const users = getUsers();
      if (users.some((u) => normalize(u.email) === normalize(email))) {
        alert("Ese correo ya está registrado. Inicia sesión.");
        return;
      }

      const username = email.split("@")[0] || name.split(" ")[0] || "usuario";
      users.push({ name, email, username, password, createdAt: Date.now() });
      saveUsers(users);

      alert("Registro exitoso. Ahora puedes iniciar sesión.");
      window.location.href = "index.html";
    });
  }

  const recoverForm = document.getElementById("recoverForm");
  if (recoverForm) {
    recoverForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(recoverForm);
      const email = String(data.get("email") || "").trim();

      const users = getUsers();
      const exists = users.some((u) => normalize(u.email) === normalize(email));
      if (!exists) {
        alert("No encontramos una cuenta con ese correo.");
        return;
      }

      const token = generateToken();
      const tokens = readJson(STORAGE_KEYS.resetTokens, {});
      tokens[normalize(email)] = {
        token,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000, // 30 min
      };
      writeJson(STORAGE_KEYS.resetTokens, tokens);

      const link = `${window.location.origin}${window.location.pathname.replace(/[^/]+$/, "")}restablecer.html?email=${encodeURIComponent(
        email
      )}&token=${encodeURIComponent(token)}`;

      // Prototipo: no se envía un correo real sin backend/servicio SMTP.
      // Aun así, el flujo es real: enlace + token + expiración.
      navigator.clipboard?.writeText(link).catch(() => {});
      alert(
        "Se generó un enlace de restablecimiento (prototipo).\n\nSe copió al portapapeles si el navegador lo permite:\n" +
          link
      );
      window.location.href = `restablecer.html?email=${encodeURIComponent(email)}&token=${encodeURIComponent(
        token
      )}`;
    });
  }
}

function generateToken() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 24; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function renderPasswordReset() {
  const form = document.getElementById("resetForm");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const email = String(params.get("email") || "").trim();
  const token = String(params.get("token") || "").trim();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const newPassword = String(data.get("newPassword") || "");

    const tokens = readJson(STORAGE_KEYS.resetTokens, {});
    const entry = tokens[normalize(email)];
    if (!entry || entry.token !== token) {
      alert("El enlace/token no es válido.");
      return;
    }
    if (Date.now() > Number(entry.expiresAt || 0)) {
      alert("El enlace expiró. Vuelve a solicitar uno nuevo.");
      return;
    }

    const users = getUsers();
    const idx = users.findIndex((u) => normalize(u.email) === normalize(email));
    if (idx === -1) {
      alert("No encontramos una cuenta con ese correo.");
      return;
    }

    users[idx] = { ...users[idx], password: newPassword, updatedAt: Date.now() };
    saveUsers(users);

    // invalidar token
    delete tokens[normalize(email)];
    writeJson(STORAGE_KEYS.resetTokens, tokens);

    alert("Contraseña actualizada. Ahora puedes iniciar sesión.");
    window.location.href = "index.html";
  });
}

function renderChats() {
  const list = document.getElementById("chatMessages");
  const form = document.getElementById("chatForm");
  if (!list || !form) return;

  const session = ensureAuthOrRedirect();
  if (!session) return;

  let messages = readJson(STORAGE_KEYS.chatMessages, []);
  if (!Array.isArray(messages)) messages = [];

  function paint() {
    list.innerHTML = "";
    if (messages.length === 0) {
      const empty = document.createElement("div");
      empty.className = "chat-empty";
      empty.textContent = "Aún no hay mensajes. Sé la primera persona en escribir.";
      list.appendChild(empty);
      return;
    }

    messages.slice(-200).forEach((m) => {
      const item = document.createElement("article");
      item.className = "chat-message";
      item.innerHTML = `
        <div class="chat-meta">
          <span class="chat-author">${m.author}</span>
          <span class="chat-date">${m.date}</span>
        </div>
        <div class="chat-text">${escapeHtml(m.content)}</div>
      `;
      list.appendChild(item);
    });

    list.scrollTop = list.scrollHeight;
  }

  paint();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const content = String(data.get("message") || "").trim();
    if (!content) return;
    const now = new Date();
    const date = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    messages.push({ author: session.name || "Usuario", content, date });
    writeJson(STORAGE_KEYS.chatMessages, messages);
    form.reset();
    paint();
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCover(book, isDetail = false) {
  if (book?.coverUrl) {
    const cls = isDetail ? "cover-img detail" : "cover-img";
    return `<img class="${cls}" src="${book.coverUrl}" alt="Portada de ${escapeHtml(book.title)}" loading="lazy" />`;
  }
  // Fallback: iniciales
  return `<div class="cover-fallback">${escapeHtml(getInitials(book.title))}</div>`;
}

function getInitials(title) {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
}

document.addEventListener("DOMContentLoaded", initPage);

