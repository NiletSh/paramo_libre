<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/init.php';
require_web_login();

$title = 'PÁRAMO LIBRE - Chat';
$showNav = true;
$dataPage = 'chat';
require __DIR__ . '/includes/layout_header.php';
?>
  <main class="page-container">
    <p style="margin:0 0 12px"><a href="chats.php">← Volver a chats</a></p>
    <section class="chat-card">
      <div class="chat-header">
        <h2 id="chatTitle">Chat</h2>
        <p class="chat-subtitle">Los mensajes se guardan en la base de datos</p>
      </div>
      <section class="delivery-card" id="deliveryCard" hidden>
        <h3>Punto de entrega</h3>
        <p class="muted" id="deliveryInfo"></p>
        <div class="delivery-row">
          <label for="deliveryPointSelect" class="muted">Selecciona el punto:</label>
          <select id="deliveryPointSelect" class="search-select">
            <option value="">Selecciona...</option>
          </select>
          <button type="button" class="btn primary-btn" id="deliveryPointSave">Guardar punto</button>
        </div>
        <div class="delivery-row">
          <button type="button" class="btn primary-btn" id="deliveryConfirmBtn">Confirmar entrega</button>
          <span class="muted" id="deliveryStatusText"></span>
          <button type="button" class="btn" id="returnBookBtn" style="margin-left:8px; display:none">Devolver libro</button>
        </div>
      </section>
      <div class="chat-messages" id="chatMessages" aria-live="polite"></div>
      <form class="chat-form" id="chatForm">
        <input class="chat-input" type="text" name="message" maxlength="2000" placeholder="Escribe un mensaje..." autocomplete="off" required>
        <button class="btn primary-btn" type="submit">Enviar</button>
      </form>
    </section>
  </main>
<?php
require __DIR__ . '/includes/layout_footer.php';
