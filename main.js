import { auth, db, firebaseApi as fb } from "./firebase.js";

// Bandera para detectar si el módulo cargó (útil para depurar en el navegador).
window.__PARAMO_LIBRE_MAIN_LOADED__ = true;

// Almacenamiento de géneros cargados desde API
let allGenres = [];
let currentGenreFilter = '';

function friendlyFirebaseError(err) {
  const code = err?.code ? String(err.code) : "";
  if (code.includes("auth/email-already-in-use")) {
    return "Ese correo ya está registrado.";
  }
  if (code.includes("auth/invalid-email")) {
    return "El correo no es válido.";
  }
  if (code.includes("auth/weak-password")) {
    return "La contraseña es muy débil (mínimo 6 caracteres).";
  }
  if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password")) {
    return "Correo o contraseña incorrectos.";
  }
  if (code.includes("permission-denied")) {
    return "Firestore bloqueó el acceso (permission-denied). Revisa las reglas o el modo de prueba.";
  }
  if (code) return `Error Firebase: ${code}`;
  return "Ocurrió un error. Revisa la consola del navegador.";
}

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

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', """)
    .replaceAll("'", "&#039;");
}

function renderCover(book, isDetail = false) {
  if (book?.coverUrl) {
    const cls = isDetail ? "cover-img detail" : "cover-img";
    return `<img class="${cls}" src="${book.coverUrl}" alt="Portada de ${escapeHtml(book.title)}" loading="lazy" />`;
  }
  return `<div class="cover-fallback">${escapeHtml(getInitials(book.title))}</div>`;
}

function getInitials(title) {
  return String(title || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
}

function getAvailabilityInfo(book, acquired = false) {
  if (acquired) return { label: "Adquirido", className: "acquired" };
  if (!book.available) return { label: "No disponible", className: "unavailable" };
  if (book.loaned) return { label: "En préstamo", className: "loaned" };
  return { label: "Disponible", className: "" };
}

async function getMyBookIds(user) {
  if (!user) return new Set();
  try {
    const snap = await fb.getDocs(fb.collection(db, "users", user.uid, "myBooks"));
    return new Set(
      snap.docs
        .map((d) => Number(d.id))
        .filter((n) => Number.isFinite(n))
    );
  } catch (err) {
    console.error(err);
    alert(friendlyFirebaseError(err));
    return new Set();
  }
}

function wireLogoutLinks() {
  const logoutLinks = document.querySelectorAll(".nav-logout");
  if (!logoutLinks?.length) return;
  logoutLinks.forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      await fb.signOut(auth);
      window.location.href = "index.html";
    });
  });
}

function isAuthPage(path) {
  return (
    path.endsWith("index.html") ||
    path.endsWith("registro.html") ||
    path.endsWith("recuperar.html") ||
    path === "/" ||
    path === ""
  );
}

async function requireAuthOrRedirect() {
  return await new Promise((resolve) => {
    const unsub = fb.onAuthStateChanged(auth, (user) => {
      unsub();
      if (!user) {
        window.location.href = "index.html";
        resolve(null);
        return;
      }
      resolve(user);
    });
  });
}

function initPage() {
  const path = window.location.pathname;
  wireLogoutLinks();

  // Redirección si ya inició sesión y abre index.
  fb.onAuthStateChanged(auth, (user) => {
    if (user && (path.endsWith("index.html") || path === "/" || path === "")) {
      window.location.href = "catalogo.html";
    }
  });

  if (!isAuthPage(path)) {
    // asegurar sesión para pantallas internas
    requireAuthOrRedirect().then((user) => {
      if (!user) return;
      route(path, user);
    });
  } else {
    route(path, null);
  }

  setupForms();
}

function route(path, user) {
  if (path.endsWith("catalogo.html")) renderCatalog(user);
  else if (path.endsWith("detalle-libro.html")) renderBookDetail(user);
  else if (path.endsWith("mis-libros.html")) renderMyBooks(user);
  else if (path.endsWith("comentarios.html")) renderComments(user);
  else if (path.endsWith("chats.html")) renderChats(user);
}

// Cargar géneros desde la API
async function loadGenres() {
  try {
    const response = await fetch('api/genres.php');
    const data = await response.json();
    
    if (data.ok && data.generos) {
      allGenres = data.generos;
      return true;
    }
  } catch (error) {
    console.error('Error cargando géneros:', error);
  }
  return false;
}

// Función para obtener el nombre del género por ID
function getGenreNameById(genreId) {
  const genre = allGenres.find(g => g.id == genreId);
  return genre ? genre.nombre : 'Sin género';
}

// Renderizar selector de géneros
function renderGenreFilter() {
  const genreSelect = document.getElementById('genreFilter');
  const genreChips = document.getElementById('genreChips');
  
  if (!genreSelect || !genreChips || allGenres.length === 0) return;
  
  // Limpiar opciones excepto la primera
  genreSelect.innerHTML = '<option value="">Todos los géneros</option>';
  
  // Agrupar géneros por categorías
  const categories = {
    'Ficción Literaria': ['Ficción', 'Novela', 'Cuento', 'Microrrelato', 'Nouvelle'],
    'Géneros de Ficción': ['Ficción Científica', 'Fantasía', 'Fantasía Oscura', 'Terror', 'Misterio', 'Policial', 'Thriller', 'Romance', 'Romance Histórico', 'Aventura', 'Western'],
    'Literatura General': ['Literatura Clásica', 'Literatura Contemporánea', 'Literatura Latinoamericana', 'Realismo Mágico'],
    'No Ficción': ['Biografía', 'Historia', 'Ensayo', 'Filosofía', 'Psicología', 'Sociología', 'Política', 'Economía'],
    'Desarrollo Personal': ['Autoayuda', 'Crecimiento Personal', 'Espiritualidad', 'Religión'],
    'Ciencias y Educación': ['Ciencia', 'Matemáticas', 'Tecnología', 'Ingeniería', 'Medicina', 'Naturaleza', 'Educativo', 'Académico'],
    'Arte y Cultura': ['Arte', 'Música', 'Cine', 'Fotografía', 'Arquitectura', 'Gastronomía'],
    'Infantil y Juvenil': ['Infantil', 'Juvenil', 'Álbum Ilustrado', 'Fantasía Infantil'],
    'Viajes y Ocio': ['Viajes', 'Deportes', 'Hobbies', 'Mascotas'],
    'Negocios': ['Negocios', 'Marketing', 'Liderazgo', 'Productividad'],
    'Otros': ['Poesía', 'Teatro', 'Cómic', 'Satira', 'Erótico', 'Viajes en el Tiempo', 'Steampunk', 'Cyberpunk', 'Histórico', 'Multigénero', 'Antología', 'Diccionario', 'Idiomas', 'Salud', 'Padres y Familia', 'Jardinería', 'Bricolaje', 'Supervivencia', 'Militar', 'True Crime', 'Periodismo', 'Cartas', 'Diarios', 'Otros']
  };

  // Géneros populares para chips rápidos
  const popularGenres = ['Ficción', 'Novela', 'Fantasía', 'Romance', 'Misterio', 'Terror', 'Ciencia', 'Historia', 'Autoayuda', 'Infantil'];
  
  // Renderizar chips de géneros populares
  genreChips.innerHTML = '';
  popularGenres.forEach(genreName => {
    const genre = allGenres.find(g => g.nombre === genreName);
    if (genre) {
      const chip = document.createElement('button');
      chip.className = 'genre-chip';
      chip.textContent = genre.nombre;
      chip.addEventListener('click', () => {
        // Remover clase active de todos los chips
        genreChips.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        genreSelect.value = genre.id;
        currentGenreFilter = genre.id;
        filterAndRender();
      });
      genreChips.appendChild(chip);
    }
  });

  // Renderizar opciones en el selector con optgroups
  let currentCategory = '';
  for (const [category, genreNames] of Object.entries(categories)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = category;
    
    genreNames.forEach(genreName => {
      const genre = allGenres.find(g => g.nombre === genreName);
      if (genre) {
        const option = document.createElement('option');
        option.value = genre.id;
        option.textContent = genre.nombre;
        optgroup.appendChild(option);
      }
    });
    
    if (optgroup.children.length > 0) {
      genreSelect.appendChild(optgroup);
    }
  }
}

// Variables para almacenar libros de la API
let apiBooks = [];

async function loadBooksFromAPI() {
  try {
    const response = await fetch('api/books.php');
    const data = await response.json();
    
    if (data.ok && data.libros) {
      // Convertir libros de la API al formato esperado
      apiBooks = data.libros.map(libro => ({
        id: libro.id,
        title: libro.titulo,
        author: libro.autor,
        genre: libro.genero,
        genreId: libro.genero_id,
        coverUrl: libro.imagen || null,
        shortSynopsis: libro.descripcion ? 
          (libro.descripcion.length > 100 ? libro.descripcion.substring(0, 100) + '...' : libro.descripcion) : 
          '',
        fullSynopsis: libro.descripcion || '',
        available: libro.estado === 'disponible',
        loaned: libro.estado === 'prestamo',
        publicadorNombre: libro.publicador_nombre
      }));
      return true;
    }
  } catch (error) {
    console.error('Error cargando libros:', error);
  }
  return false;
}

async function renderCatalog(user) {
  const grid = document.getElementById("booksGrid");
  const searchInput = document.getElementById("searchInput");
  const genreFilter = document.getElementById("genreFilter");
  const resultsCount = document.getElementById("resultsCount");
  const noResults = document.getElementById("noResults");
  
  if (!grid) return;

  // Cargar géneros y libros
  await Promise.all([loadGenres(), loadBooksFromAPI()]);
  renderGenreFilter();

  const myIds = await getMyBookIds(user);

  function filterAndRender() {
    const term = (searchInput?.value || "").toLowerCase();
    const selectedGenre = genreFilter?.value || '';
    
    // Combinar libros de la API con sample books (para demo)
    const allBooks = apiBooks.length > 0 ? apiBooks : sampleBooks;
    
    let filtered = allBooks.filter((book) => {
      const text = `${book.title} ${book.author} ${book.genre}`.toLowerCase();
      const matchesSearch = text.includes(term);
      const matchesGenre = !selectedGenre || book.genre === getGenreNameById(selectedGenre);
      return matchesSearch && matchesGenre;
    });

    // Actualizar contador
    if (resultsCount) {
      resultsCount.textContent = filtered.length;
    }

    // Mostrar/ocultar mensaje de no resultados
    if (noResults) {
      noResults.style.display = filtered.length === 0 ? 'block' : 'none';
    }

    grid.innerHTML = "";
    filtered.forEach((book) => {
      const card = document.createElement("article");
      card.className = "book-card";
      const acquired = myIds.has(book.id);
      const availability = getAvailabilityInfo(book, acquired);
      
      // Obtener nombre del género
      const genreName = book.genre;
      
      card.innerHTML = `
        <div class="book-cover">${renderCover(book)}</div>
        <div class="book-meta">
          <div class="book-title">${book.title}</div>
          <div class="book-author">${book.author}</div>
          <span class="book-genre-badge">${genreName}</span>
          <p class="book-synopsis">${book.shortSynopsis}</p>
        </div>
        <div class="book-footer">
          <span class="availability ${availability.className}">${availability.label}</span>
          <button class="btn primary-btn" ${acquired ? "disabled" : ""}>
            ${acquired ? "En Mis Libros" : "Adquirir"}
          </button>
        </div>
      `;

      const btn = card.querySelector("button");
      btn?.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (acquired) {
          window.location.href = "mis-libros.html";
          return;
        }
        const user = await requireAuthOrRedirect();
        if (!user) return;
        const ok = await addToMyBooks(user, book.id);
        if (ok) {
          myIds.add(book.id);
          filterAndRender();
        }
      });

      // Click en la tarjeta (fuera del botón) abre detalle.
      card.addEventListener("click", () => {
        window.location.href = `detalle-libro.html?id=${book.id}`;
      });

      grid.appendChild(card);
    });
  }

  filterAndRender();
  
  // Event listeners para filtros
  if (searchInput) {
    searchInput.addEventListener("input", filterAndRender);
  }
  
  if (genreFilter) {
    genreFilter.addEventListener("change", () => {
      currentGenreFilter = genreFilter.value;
      // Remover clase active de todos los chips
      document.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
      filterAndRender();
    });
  }
}

async function renderBookDetail(user) {
  const container = document.getElementById("bookDetail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const book = sampleBooks.find((b) => b.id === id) || sampleBooks[0];
  const myIds = await getMyBookIds(user);
  const acquired = myIds.has(book.id);
  const availability = getAvailabilityInfo(book, acquired);

  container.innerHTML = `
    <div class="book-detail-cover">${renderCover(book, true)}</div>
    <div class="book-detail-info">
      <h2>${book.title}</h2>
      <div class="book-detail-meta">Autor: ${book.author} · Género: ${book.genre}</div>
      <p class="book-detail-synopsis">${book.fullSynopsis}</p>
      <div class="book-footer">
        <span class="availability ${availability.className}">${availability.label}</span>
        <button class="btn primary-btn" id="acquireBtn" ${acquired ? "disabled" : ""}>
          ${acquired ? "En Mis Libros" : "Adquirir"}
        </button>
      </div>
    </div>
  `;

  const btn = document.getElementById("acquireBtn");
  btn?.addEventListener("click", async () => {
    if (acquired) {
      window.location.href = "mis-libros.html";
      return;
    }
    const user = await requireAuthOrRedirect();
    if (!user) return;
    const ok = await addToMyBooks(user, book.id);
    if (ok) window.location.reload();
  });
}

async function addToMyBooks(user, bookId) {
  const book = sampleBooks.find((b) => b.id === bookId);
  if (!book) return;
  if (!book.available) {
    alert("Este libro no está disponible por ahora.");
    return;
  }

  try {
    const ref = fb.doc(db, "users", user.uid, "myBooks", String(bookId));
    await fb.setDoc(ref, { bookId, createdAt: fb.serverTimestamp() }, { merge: true });
    alert("Libro agregado a 'Mis libros'.");
    return true;
  } catch (err) {
    console.error(err);
    alert(friendlyFirebaseError(err));
    return false;
  }
}

async function renderMyBooks(user) {
  const grid = document.getElementById("myBooksGrid");
  if (!grid) return;
  if (!user) return;

  const ref = fb.collection(db, "users", user.uid, "myBooks");
  fb.onSnapshot(
    ref,
    (snap) => {
      const ids = snap.docs.map((d) => Number(d.id)).filter((n) => Number.isFinite(n));
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
        const availability = getAvailabilityInfo(book, true);
        card.innerHTML = `
          <div class="book-cover">${renderCover(book)}</div>
          <div class="book-meta">
            <div class="book-title">${book.title}</div>
            <div class="book-author">${book.author}</div>
            <span class="book-genre-badge">${book.genre}</span>
            <p class="book-synopsis">${book.shortSynopsis}</p>
          </div>
          <div class="book-footer">
            <span class="availability ${availability.className}">${availability.label}</span>
            <button class="btn primary-btn">Ver detalle</button>
          </div>
        `;
        card.querySelector("button")?.addEventListener("click", () => {
          window.location.href = `detalle-libro.html?id=${book.id}`;
        });
        grid.appendChild(card);
      });
    },
    (err) => {
      console.error(err);
      alert(friendlyFirebaseError(err));
    }
  );
}

function renderComments(user) {
  const list = document.getElementById("commentsList");
  const form = document.getElementById("commentForm");
  if (!list || !form || !user) return;

  const commentsRef = fb.collection(db, "comments");
  const q = fb.query(commentsRef, fb.orderBy("createdAt", "desc"), fb.limit(50));

  fb.onSnapshot(q, (snap) => {
    list.innerHTML = "";
    snap.docs.forEach((d) => {
      const c = d.data();
      const item = document.createElement("article");
      item.className = "comment-item";
      const date =
        c.createdAt?.toDate?.()?.toISOString?.().slice(0, 10) ||
        c.date ||
        "";
      item.innerHTML = `
        <div class="comment-author">${escapeHtml(c.author || "Usuario")}</div>
        <div class="comment-date">${escapeHtml(date)}</div>
        <p class="comment-text">${escapeHtml(c.content || "")}</p>
      `;
      list.appendChild(item);
    });
  });

  const authorInput = form.querySelector('input[name="author"]');
  if (authorInput) authorInput.value = user.displayName || "";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const author = String(data.get("author") || "").trim();
    const content = String(data.get("content") || "").trim();
    if (!author || !content) return;

    try {
      await fb.addDoc(commentsRef, {
        author,
        content,
        uid: user.uid,
        createdAt: fb.serverTimestamp(),
      });

      form.reset();
      if (authorInput) authorInput.value = user.displayName || author;
    } catch (err) {
      console.error(err);
      alert(friendlyFirebaseError(err));
    }
  });
}

function renderChats(user) {
  const list = document.getElementById("chatMessages");
  const form = document.getElementById("chatForm");
  if (!list || !form || !user) return;

  const msgsRef = fb.collection(db, "chatMessages");
  const q = fb.query(msgsRef, fb.orderBy("createdAt", "asc"), fb.limit(200));

  fb.onSnapshot(q, (snap) => {
    list.innerHTML = "";
    if (snap.empty) {
      const empty = document.createElement("div");
      empty.className = "chat-empty";
      empty.textContent = "Aún no hay mensajes. Sé la primera persona en escribir.";
      list.appendChild(empty);
      return;
    }

    snap.docs.forEach((d) => {
      const m = d.data();
      const item = document.createElement("article");
      item.className = "chat-message";
      const date =
        m.createdAt?.toDate?.()?.toISOString?.().slice(0, 16).replace("T", " ") ||
        "";
      item.innerHTML = `
        <div class="chat-meta">
          <span class="chat-author">${escapeHtml(m.author || "Usuario")}</span>
          <span class="chat-date">${escapeHtml(date)}</span>
        </div>
        <div class="chat-text">${escapeHtml(m.content || "")}</div>
      `;
      list.appendChild(item);
    });
    list.scrollTop = list.scrollHeight;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const content = String(data.get("message") || "").trim();
    if (!content) return;

    try {
      await fb.addDoc(msgsRef, {
        author: user.displayName || "Usuario",
        content,
        uid: user.uid,
        createdAt: fb.serverTimestamp(),
      });
      form.reset();
    } catch (err) {
      console.error(err);
      alert(friendlyFirebaseError(err));
    }
  });
}

function setupForms() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(loginForm);
      const email = String(data.get("identifier") || "").trim();
      const password = String(data.get("password") || "");
      try {
        await fb.signInWithEmailAndPassword(auth, email, password);
        window.location.href = "catalogo.html";
      } catch (err) {
        console.error(err);
        alert(friendlyFirebaseError(err));
      }
    });
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(registerForm);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const password = String(data.get("password") || "");

      try {
        const cred = await fb.createUserWithEmailAndPassword(auth, email, password);
        await fb.updateProfile(cred.user, { displayName: name });
        // perfil en Firestore (evidencia de BD)
        await fb.setDoc(
          fb.doc(db, "users", cred.user.uid),
          { name, email, createdAt: fb.serverTimestamp() },
          { merge: true }
        );
        alert("Registro exitoso. Ya puedes usar la app.");
        window.location.href = "catalogo.html";
      } catch (err) {
        console.error(err);
        alert(friendlyFirebaseError(err));
      }
    });
  }

  const recoverForm = document.getElementById("recoverForm");
  if (recoverForm) {
    recoverForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(recoverForm);
      const email = String(data.get("email") || "").trim();
      try {
        await fb.sendPasswordResetEmail(auth, email);
        alert("Listo. Revisa tu correo para restablecer tu contraseña.");
        window.location.href = "index.html";
      } catch (err) {
        console.error(err);
        alert(friendlyFirebaseError(err));
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initPage);