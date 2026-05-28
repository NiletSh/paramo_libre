<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/init.php';
require_web_login();

$title = 'PÁRAMO LIBRE - Chats';
$showNav = true;
$dataPage = 'chats';
require __DIR__ . '/includes/layout_header.php';
?>
  <main class="page-container">
    <section class="placeholder-section" style="text-align:left">
      <h2 style="margin-top:0">Sala general</h2>
      <p class="muted">Todos los lectores pueden escribir aquí.</p>
      <a class="btn primary-btn" href="chat.php?id=1" style="display:inline-flex; margin-top:8px">Entrar a la sala general</a>
    </section>

    <section class="placeholder-section" style="text-align:left; margin-top:18px">
      <h2>Chats privados (trueque)</h2>
      <p class="muted">Se abren automáticamente al pulsar «Adquirir» en un libro de otro usuario.</p>
      <div id="privateChatsList" style="margin-top:12px"></div>
    </section>
  </main>
<?php
require __DIR__ . '/includes/layout_footer.php';
