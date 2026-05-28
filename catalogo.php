<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/init.php';
require_web_login();

$title = 'PÁRAMO LIBRE - Catálogo';
$showNav = true;
$dataPage = 'catalogo';
require __DIR__ . '/includes/layout_header.php';
?>
  <main class="page-container">
    <section class="search-section">
      <div class="search-controls">
        <input type="search" id="searchInput" class="search-input" placeholder="Buscar por título, autor, género, descripción o publicador...">
        <select id="genreFilter" class="search-select" aria-label="Filtrar por género">
          <option value="">Todos los géneros</option>
        </select>
      </div>
    </section>
    <section class="books-grid" id="booksGrid"></section>
  </main>
<?php
require __DIR__ . '/includes/layout_footer.php';
