<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/init.php';
require_web_login();

$title = 'PÁRAMO LIBRE - Publicar libro';
$showNav = true;
$dataPage = 'publicar';
require __DIR__ . '/includes/layout_header.php';
?>
  <main class="page-container">
    <section class="publish-section">
      <div class="publish-header">
        <div class="publish-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
            <path d="M12 6v6"></path>
            <path d="M9 9h6"></path>
          </svg>
        </div>
        <h2>Publicar libro para trueque</h2>
        <p class="publish-subtitle">Completa la información de tu libro para que otros usuarios puedan encontrarlo y solicitarte un intercambio.</p>
      </div>

      <form id="publishForm" class="publish-form" enctype="multipart/form-data">
        <div class="form-row">
          <label class="form-field">
            <span class="field-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
              </svg>
              Título del libro *
            </span>
            <input type="text" name="titulo" required placeholder="Ej: Cien años de soledad">
          </label>
        </div>

        <div class="form-row">
          <label class="form-field">
            <span class="field-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Autor *
            </span>
            <input type="text" name="autor" required placeholder="Ej: Gabriel García Márquez">
          </label>
        </div>

        <div class="form-row">
          <label class="form-field">
            <span class="field-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              Género literario *
            </span>
            <select name="genero_id" id="generoSelect" required>
              <option value="">Selecciona un género...</option>
            </select>
            <span class="field-hint">Elige el género que mejor describa tu libro</span>
          </label>
        </div>

        <div class="form-row">
          <label class="form-field">
            <span class="field-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Descripción
            </span>
            <textarea name="descripcion" rows="4" placeholder="Describe el estado del ejemplar, idioma, edición, detalles relevantes..."></textarea>
            <span class="field-hint">Opcional: agrega detalles sobre el estado físico del libro</span>
          </label>
        </div>

        <div class="form-row double">
          <label class="form-field">
            <span class="field-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Estado del libro
            </span>
            <select name="estado" class="estado-select">
              <option value="disponible" selected>✓ Disponible para intercambio</option>
              <option value="prestamo">⏳ En préstamo temporal</option>
              <option value="no_disponible">✕ No disponible</option>
            </select>
          </label>

          <label class="form-field">
            <span class="field-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              Imagen de portada
            </span>
            <div class="image-upload-wrapper">
              <input type="file" name="imagen" id="imagenInput" accept="image/*" class="image-input">
              <label for="imagenInput" class="image-upload-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Seleccionar imagen</span>
              </label>
              <span class="image-filename" id="imageFilename">Ningún archivo seleccionado</span>
            </div>
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn primary-btn submit-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Publicar libro
          </button>
        </div>

        <p id="publishMsg" class="publish-message"></p>
      </form>
    </section>
  </main>

  <script src="sw-register.js"></script>
  <script type="module">
    // Cargar géneros desde la API
    async function loadGenres() {
      try {
        const response = await fetch('api/genres.php');
        const data = await response.json();
        
        if (data.ok && data.generos) {
          const select = document.getElementById('generoSelect');
          data.generos.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.nombre;
            select.appendChild(option);
          });
        }
      } catch (error) {
        console.error('Error cargando géneros:', error);
      }
    }

    // Mostrar nombre del archivo seleccionado
    document.getElementById('imagenInput')?.addEventListener('change', function(e) {
      const filename = e.target.files[0]?.name || 'Ningún archivo seleccionado';
      document.getElementById('imageFilename').textContent = filename;
    });

    // Manejar envío del formulario
    document.getElementById('publishForm')?.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const submitBtn = this.querySelector('.submit-btn');
      const messageEl = document.getElementById('publishMsg');
      
      // Deshabilitar botón
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Publicando...';
      
      try {
        const response = await fetch('api/book.php', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.ok) {
          messageEl.className = 'publish-message success';
          messageEl.textContent = '¡Libro publicado exitosamente!';
          this.reset();
          document.getElementById('imageFilename').textContent = 'Ningún archivo seleccionado';
          
          setTimeout(() => {
            window.location.href = 'catalogo.html';
          }, 2000);
        } else {
          messageEl.className = 'publish-message error';
          messageEl.textContent = result.error || 'Error al publicar el libro';
        }
      } catch (error) {
        messageEl.className = 'publish-message error';
        messageEl.textContent = 'Error de conexión. Inténtalo de nuevo.';
        console.error('Error:', error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Publicar libro
        `;
      }
    });

    loadGenres();
  </script>
<?php
require __DIR__ . '/includes/layout_footer.php';