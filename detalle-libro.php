<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/init.php';
require_web_login();

$title = 'PÁRAMO LIBRE - Detalle del libro';
$showNav = true;
$dataPage = 'detalle';
require __DIR__ . '/includes/layout_header.php';
?>
  <main class="page-container">
    <article class="book-detail" id="bookDetail"></article>

    <section class="comments-page" style="margin-top: 22px;">
      <section class="comments-list" id="commentsList"></section>
      <section class="comments-form-section">
        <h2>Comentarios y recomendaciones</h2>
        <form id="commentForm" class="comment-form">
          <label class="form-field">
            <span>Tu comentario</span>
            <textarea name="texto" rows="3" required placeholder="Opina o recomienda este libro..."></textarea>
          </label>
          <button type="submit" class="btn primary-btn">Publicar</button>
        </form>
      </section>
    </section>
  </main>
<?php
require __DIR__ . '/includes/layout_footer.php';
