# Buscador de perfiles GitHub

Aplicación web (HTML + CSS + JavaScript puro, sin frameworks) que consume la **API REST de GitHub** para buscar usuarios y listar sus repositorios.

## Sitio publicado (GitHub Pages)

🔗 **https://l00s3rr.github.io/buscador-perfiles-github/**

Repositorio: https://github.com/L00S3RR/buscador-perfiles-github

## Qué hace la aplicación

1. **Busca un usuario** por su nombre de usuario usando `GET /users/{usuario}` y muestra su avatar, nombre, número de repositorios y seguidores.
2. **Lista sus repositorios** con `GET /users/{usuario}/repos`, usando `URLSearchParams` para construir la URL con los parámetros `sort`, `per_page` y `page`.
3. **Ordena** los repositorios por `updated`, `created` o `full_name` mediante un menú desplegable (parámetro `sort`).
4. **Resume los lenguajes más usados**, contando cuántos repositorios hay de cada lenguaje.
5. **Carga más resultados** con un botón "Cargar más" que usa el parámetro `page` (paginación de 5 en 5) y añade los resultados sin borrar los anteriores. El botón se oculta cuando la API devuelve menos de 5 elementos.
6. **Muestra las peticiones restantes** leyendo la cabecera `x-ratelimit-remaining` en el pie de página.

## Endpoints usados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/users/{usuario}` | GET | Datos del perfil |
| `/users/{usuario}/repos` | GET | Lista de repositorios (`sort`, `per_page`, `page`) |

## Manejo de errores

- `404` → "Usuario no encontrado"
- `403` → "Límite de peticiones alcanzado" (rate limit)

Sin autenticar, la API permite **60 peticiones por hora**. Al llegar a 0, responde `403` hasta que se reinicia el contador (cabecera `x-ratelimit-reset`).

## Cómo ejecutarla localmente

No requiere build ni servidor: basta abrir `index.html` en el navegador. Opcionalmente, servir la carpeta con cualquier servidor estático (por ejemplo `npx serve`).

## Estructura

```
index.html   # Interfaz (formulario, perfil, lista, botón, pie)
app.js       # Lógica: fetch, pintado, orden, lenguajes y paginación
```

## Seguridad: por qué nunca un token en el código

**Nunca** se debe incluir un token de acceso (Personal Access Token) dentro del código de un repositorio público:

- El código de un repositorio público es visible para **cualquiera** (basta abrir el archivo en GitHub).
- Quien vea el token podría **usarlo con tu cuenta**: leer, modificar o borrar tus repositorios, y acceder a tus datos.
- GitHub cuenta commits en busca de tokens; exponerlos pone en riesgo tu cuenta y puede obligar a revocarlos.
- Los secretos deben vivir **fuera del código**: en variables de entorno, archivos `.env` ignorados por `.gitignore`, o el asistente de credenciales de Git. Este proyecto usa la API **sin autenticar**, por lo que no necesita ningún token.
