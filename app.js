const API = 'https://api.github.com';
const POR_PAGINA = 5;

const form = document.querySelector('#form-buscar');
const input = document.querySelector('#input-usuario');
const boton = document.querySelector('#btn-buscar');
const estado = document.querySelector('#estado');
const perfil = document.querySelector('#perfil');
const titulo = document.querySelector('#titulo-repos');
const repos = document.querySelector('#repos');
const selectOrden = document.querySelector('#select-orden');
const tituloLenguajes = document.querySelector('#titulo-lenguajes');
const listaLenguajes = document.querySelector('#lenguajes');
const btnMas = document.querySelector('#btn-mas');
const pie = document.querySelector('#pie');
const spanRateLimit = document.querySelector('#ratelimit');

let usuarioActual = '';
let paginaActual = 1;

// 1. Petición genérica con traducción de errores HTTP
async function obtenerJSON(url) {
  const res = await fetch(url);

  const restantes = res.headers.get('x-ratelimit-remaining');
  if (restantes !== null) {
    spanRateLimit.textContent = restantes;
    pie.classList.remove('oculto');
  }

  if (res.status === 404) throw new Error('Usuario no encontrado');
  if (res.status === 403) {
    throw new Error('Límite de peticiones alcanzado');
  }
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

  return res.json();
}

// 2. Pintar el perfil
function mostrarPerfil(u) {
  const img = document.createElement('img');
  img.src = u.avatar_url;
  img.alt = `Avatar de ${u.login}`;

  const nombre = document.createElement('h2');
  // Si el usuario no registró un nombre, se muestra su login
  nombre.textContent = u.name ?? u.login;

  const datos = document.createElement('p');
  datos.textContent = `${u.public_repos} repositorios · ${u.followers} seguidores`;

  const enlace = document.createElement('a');
  enlace.href = u.html_url;
  enlace.target = '_blank';
  enlace.textContent = 'Ver en GitHub';

  const info = document.createElement('div');
  info.append(nombre, datos, enlace);

  perfil.replaceChildren(img, info);
  perfil.classList.remove('oculto');
}

// 3. Pintar la lista de repositorios
function mostrarRepos(lista, reemplazar = false) {
  if (reemplazar) repos.innerHTML = '';

  lista.forEach((r) => {
    const a = document.createElement('a');
    a.href = r.html_url;
    a.target = '_blank';
    a.textContent = r.name;

    const li = document.createElement('li');
    const lenguaje = r.language ?? 'sin lenguaje';

    li.append(a, ` - ${lenguaje} - ★ ${r.stargazers_count}`);
    repos.append(li);
  });

  titulo.classList.remove('oculto');
}

function contarLenguajes(lista) {
  const conteo = {};
  lista.forEach((r) => {
    const lenguaje = r.language ?? 'sin lenguaje';
    conteo[lenguaje] = (conteo[lenguaje] ?? 0) + 1;
  });
  return conteo;
}

function mostrarLenguajes(lista) {
  const conteo = contarLenguajes(lista);
  const ordenado = Object.entries(conteo).sort((a, b) => b[1] - a[1]);

  listaLenguajes.innerHTML = '';

  ordenado.forEach(([lenguaje, cantidad]) => {
    const li = document.createElement('li');
    li.textContent = `${lenguaje}: ${cantidad} repositorio${cantidad === 1 ? '' : 's'}`;
    listaLenguajes.append(li);
  });

  tituloLenguajes.classList.remove('oculto');
}

function construirURLRepos(usuario, pagina) {
  const params = new URLSearchParams({
    sort: selectOrden.value,
    per_page: POR_PAGINA,
    page: pagina,
  });
  return `${API}/users/${usuario}/repos?${params}`;
}

async function cargarMas() {
  if (!usuarioActual) return;

  paginaActual += 1;
  btnMas.disabled = true;

  try {
    const datosRepos = await obtenerJSON(construirURLRepos(usuarioActual, paginaActual));

    mostrarRepos(datosRepos, false);

    if (datosRepos.length < POR_PAGINA) {
      btnMas.classList.add('oculto');
    }
  } catch (error) {
    estado.className = 'error';
    estado.textContent = error.message;
  } finally {
    btnMas.disabled = false;
  }
}

btnMas.addEventListener('click', cargarMas);

// 4. Evento submit: dos peticiones en paralelo
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const usuario = encodeURIComponent(input.value.trim());
  if (!usuario) return;

  usuarioActual = usuario;
  paginaActual = 1;

  boton.disabled = true;
  estado.className = '';
  estado.textContent = 'Buscando...';

  try {
    const [datosUsuario, datosRepos] = await Promise.all([
      obtenerJSON(`${API}/users/${usuario}`),
      obtenerJSON(construirURLRepos(usuario, paginaActual)),
    ]);

    mostrarPerfil(datosUsuario);
    mostrarRepos(datosRepos, true);
    mostrarLenguajes(datosRepos);

    if (datosRepos.length === POR_PAGINA) {
      btnMas.classList.remove('oculto');
    } else {
      btnMas.classList.add('oculto');
    }

    estado.textContent = '';
  } catch (error) {
    perfil.classList.add('oculto');
    titulo.classList.add('oculto');
    tituloLenguajes.classList.add('oculto');
    btnMas.classList.add('oculto');
    repos.innerHTML = '';
    listaLenguajes.innerHTML = '';
    estado.className = 'error';
    estado.textContent = error.message;
  } finally {
    boton.disabled = false;
  }
});
