<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/init.php';

$token = isset($_GET['token']) ? (string) $_GET['token'] : '';

$title = 'PÁRAMO LIBRE - Nueva contraseña';
$showNav = false;
$bodyClass = 'auth-body';
$dataPage = 'reset-password';
require __DIR__ . '/includes/layout_header.php';
?>
  <main class="auth-container">
    <section class="auth-card">
      <div class="auth-header">
        <div class="logo-badge">
          <img class="site-logo" src="img/logopl.png" alt="Logo PARAMO LIBRE">
        </div>
        <h1>Nueva contraseña</h1>
        <p class="auth-subtitle">Elige una contraseña de al menos 6 caracteres</p>
      </div>

      <form class="auth-form" id="resetForm">
        <input type="hidden" name="token" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>">
        <label class="form-field">
          <span>Nueva contraseña</span>
          <input
            type="password"
            name="newPassword"
            required
            minlength="6"
            maxlength="30"
            autocomplete="new-password"
            inputmode="latin"
            pattern="[A-Za-z0-9]{6,30}"
            data-password-strong="true"
            placeholder="6-30, letras y números"
          >
        </label>
        <p class="muted password-hint">Debe incluir letras y números. No se permite copiar/pegar.</p>
        <button type="submit" class="btn primary-btn">Guardar</button>
      </form>

      <div class="auth-links">
        <a href="index.php">Volver al inicio de sesión</a>
      </div>
    </section>
  </main>
<?php
require __DIR__ . '/includes/layout_footer.php';
