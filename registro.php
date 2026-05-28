<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/init.php';

if (current_user()) {
    header('Location: catalogo.php');
    exit;
}

$title = 'PÁRAMO LIBRE - Registro';
$showNav = false;
$bodyClass = 'auth-body';
$dataPage = 'registro';
require __DIR__ . '/includes/layout_header.php';
?>
  <main class="auth-container">
    <section class="auth-card">
      <div class="auth-header">
        <div class="logo-badge">
          <img class="site-logo" src="img/logopl.png" alt="Logo PARAMO LIBRE">
        </div>
        <h1>Crear cuenta</h1>
        <p class="auth-subtitle">Únete al intercambio de libros</p>
      </div>

      <form class="auth-form" id="registerForm">
        <label class="form-field">
          <span>Nombre</span>
          <input type="text" name="name" required placeholder="Tu nombre">
        </label>
        <label class="form-field">
          <span>Correo electrónico</span>
          <input type="email" name="email" required placeholder="ejemplo@correo.com">
        </label>
        <label class="form-field">
          <span>Contraseña</span>
          <input
            type="password"
            name="password"
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
        <button type="submit" class="btn primary-btn">Registrarse</button>
      </form>

      <div class="auth-links">
        <a href="index.php">¿Ya tienes cuenta? Inicia sesión</a>
      </div>
    </section>
  </main>
<?php
require __DIR__ . '/includes/layout_footer.php';
