# Páramo Libre — Trueque de libros (Web completa)

Plataforma **responsiva** para **trueque e intercambio** de libros en **San Juan del Río, Querétaro**: publicar, buscar, comentar, sala general de chat y **chat privado** al solicitar un libro.

## Stack (requisito académico)

- **Frontend:** HTML, CSS, JavaScript (`api-app.js`)
- **Backend:** PHP 8+ (`api/*.php`)
- **Base de datos:** MySQL (tablas: usuarios, libros, comentarios, chats, mensajes, intercambios)

> Las páginas **`.html` + Firebase** son versiones anteriores. La entrega funcional con MySQL usa los **`.php`** de la raíz del proyecto.

## Instalación con Docker (recomendado)

Requisitos: [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Compose).

1. En la carpeta del proyecto:
   ```bash
   docker compose up --build -d
   ```
2. Espera ~30 s la primera vez (MySQL crea tablas desde `database/schema.sql`).
3. Abre: **http://localhost:8080/index.php**

Credenciales por defecto de la base (puedes cambiarlas con un archivo `.env` copiado de `.env.example`):

| Variable | Valor por defecto |
|----------|-------------------|
| Usuario app | `paramo` |
| Contraseña app | `paramo_pass` |
| Root MySQL | `rootsecret` |
| Puerto web | `8080` |
| Puerto MySQL | `3306` |

Comandos útiles:

```bash
docker compose logs -f web
docker compose logs -f db
docker compose down          # detiene contenedores
docker compose down -v       # detiene y borra datos MySQL (volumen)
```

Si al **publicar libro** no guarda la imagen, en Windows/Mac con volumen montado puede hacer falta que la carpeta `uploads/covers` tenga permisos de escritura para el contenedor.

## Instalación local (XAMPP / Apache + PHP + MySQL)

1. Copia el proyecto a `htdocs` (o sirve la carpeta con Apache + PHP + MySQL).
2. Importa `database/schema.sql` en phpMyAdmin (crea la BD `paramo_libre`).
3. Ajusta `includes/config.php`: con XAMPP suele bastar `DB_HOST=127.0.0.1`, `DB_USER=root`, `DB_PASS=` vacía, o define variables de entorno `DB_*` como en Docker.
4. Abre `http://localhost/.../index.php`.

## Funcionalidades implementadas

| Módulo | Descripción |
|--------|-------------|
| Registro / login / logout | Sesión PHP; contraseña con `password_hash` |
| Recuperar contraseña | Token en BD + enlace demo (`recuperar.php` → `reset_password.php`) |
| Catálogo | Búsqueda por título, autor, género; muestra imagen, publicador y estado |
| Adquirir | Crea **chat privado** con el dueño y mensaje de sistema; registro en `intercambios` |
| Sala general | `chat.php?id=1` — mensajes en `mensajes` |
| Chat privado | Mensajes persistentes; lista en `chats.php` |
| Comentarios | Por libro en `detalle-libro.php` |
| Mis libros | Publicados + solicitados en trueque |
| Publicar libro | Formulario con imagen (guardada en `uploads/covers/`) |

## Estructura útil

- `api/` — endpoints JSON + sesión
- `includes/` — config, PDO, layout
- `database/schema.sql` — modelo relacional
- `uploads/covers/` — portadas subidas

## Evidencias sugeridas

- Capturas: registro, catálogo, detalle con comentarios, sala general, chat privado tras «Adquirir», «Mis libros», phpMyAdmin con tablas llenas.

## Pruebas con otras personas (usuarios reales)

### 1) Datos de demostración (catálogo con libros ya publicados)

Para que quien entre **vea libros de inmediato**, puedes cargar cuentas y títulos de prueba:

- Archivo: `database/seed_demo.sql`
- **Contraseña de todas las cuentas demo:** `Prueba2026`
- Correos: `maria.demo@paramolibre.test`, `juan.demo@paramolibre.test`, `ana.demo@paramolibre.test`

Con Docker (desde la carpeta del proyecto):

```bash
docker exec -i paramo_mysql mysql -u paramo -pparamo_pass paramo_libre < database/seed_demo.sql
```

En Windows PowerShell, si `<` no funciona:

```powershell
Get-Content database\seed_demo.sql -Raw | docker exec -i paramo_mysql mysql -u paramo -pparamo_pass paramo_libre
```

*(Si ya existían esos correos, borra esos usuarios en MySQL o cambia los correos en el SQL.)*

### 2) Compartir el enlace si están **lejos** (otra ciudad / otro internet)

`localhost` solo sirve en **tu** computadora. Para que otros entren:

1. Deja corriendo: `docker compose up -d`
2. Instala [ngrok](https://ngrok.com/), configura tu token y ejecuta: `ngrok http 8080`
3. Comparte la URL `https://....ngrok-free.app/index.php` (mientras tu PC y Docker sigan encendidos)

### 3) Guion corto para los probadores

Puedes pedirles que: **registren su cuenta** → vean **catálogo** → abran un **libro** → dejen un **comentario** → entren a **sala general** en Chats → con otro usuario prueben **Adquirir** y el **chat privado** → revisen **Mis libros**.
