<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/init.php';
require_web_login();

$title = 'PÁRAMO LIBRE - Mis libros';
$showNav = true;
$dataPage = 'mis-libros';
require __DIR__ . '/includes/layout_header.php';
?>
  <main class="page-container">
    <h2 style="margin-top:0">Publicados por ti</h2>
    <p class="muted">Libros que ofreces en el trueque.</p>
    <section class="books-grid" id="publishedGrid"></section>

    <h2 style="margin-top:28px">Intercambios solicitados</h2>
    <p class="muted">Libros por los que iniciaste un trueque (desde «Adquirir»).</p>
    <section class="books-grid" id="acquiredGrid"></section>
  </main>
<?php
require __DIR__ . '/includes/layout_footer.php';
