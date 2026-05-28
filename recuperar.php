<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/init.php';

$title = 'PÁRAMO LIBRE - Recuperar contraseña';
$showNav = false;
$bodyClass = 'auth-body';
$dataPage = 'recuperar';
require __DIR__ . '/includes/layout_header.php';
?>
  <main class="auth-container">
    <section class="auth-card">
      <div class="auth-header">
        <div class="logo-badge">
          <img class="site-logo" src="img/logopl.png" alt="Logo PARAMO LIBRE">
        </div>
        <h1>Recuperar contraseña</h1>
        <p class="auth-subtitle">Ingresa tu correo para restablecerla</p>
      </div>

      <!-- PASO 1: Email validation -->
      <form class="auth-form" id="recoverForm">
        <label class="form-field">
          <span>Correo electrónico</span>
          <input type="email" name="email" required placeholder="ejemplo@correo.com">
        </label>
        <button type="submit" class="btn primary-btn">Validar correo</button>
      </form>

      <!-- Message after validation -->
      <div id="recoverMessage" class="recover-message"></div>

      <!-- PASO 2/3: New password fields (shown only if email exists) -->
      <form class="auth-form" id="recoverResetForm" hidden>
        <input type="hidden" name="token" value="">
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
        <label class="form-field">
          <span>Confirmar contraseña</span>
          <input
            type="password"
            name="confirmPassword"
            required
            minlength="6"
            maxlength="30"
            autocomplete="new-password"
            inputmode="latin"
            pattern="[A-Za-z0-9]{6,30}"
            placeholder="Confirma tu contraseña"
          >
        </label>
        <p class="muted password-hint">Debe incluir letras y números. No se permite copiar/pegar.</p>
        <button type="submit" class="btn primary-btn">Guardar nueva contraseña</button>
      </form>

      <div class="auth-links">
        <a href="index.php" class="btn btn-secondary">← Regresar al Login</a>
      </div>
    </section>
  </main>
<?php
require __DIR__ . '/includes/layout_footer.php';
