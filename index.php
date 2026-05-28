<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/init.php';

if (current_user()) {
    header('Location: catalogo.php');
    exit;
}

$title = 'PÁRAMO LIBRE - Iniciar sesión';
$showNav = false;
$bodyClass = 'auth-body';
$dataPage = 'login';
require __DIR__ . '/includes/layout_header.php';
?>
  <main class="auth-container">
    <section class="auth-card">
      <div class="auth-header auth-header--login">
        <div class="logo-badge logo-badge--icon">
          <img class="site-logo" src="img/logopl.png" alt="Páramo Libre">
        </div>
        <p class="auth-tagline">Trueque de libros · San Juan del Río, Querétaro</p>
      </div>

      <form class="auth-form" id="loginForm">
        <label class="form-field">
          <span>Correo electrónico</span>
          <input type="email" name="identifier" required placeholder="ejemplo@correo.com" autocomplete="username">
        </label>
        <label class="form-field">
          <span>Contraseña</span>
          <input type="password" name="password" required placeholder="••••••••" autocomplete="current-password">
        </label>
        <button type="submit" class="btn primary-btn">Iniciar sesión</button>
      </form>

      <div class="auth-actions">
        <a href="registro.php">Crear una cuenta</a>
        <a href="recuperar.php">¿Olvidaste tu contraseña?</a>
        <a href="qr.html" id="qrLink" class="qr-pill" aria-label="Ver código QR">QR</a>
      </div>
    </section>
  </main>
<?php
require __DIR__ . '/includes/layout_footer.php';
