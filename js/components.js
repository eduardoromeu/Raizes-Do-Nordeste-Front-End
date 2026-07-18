// Carrega um componente html dentro de um container
async function loadComponent(id, path) {
  const response = await fetch(path);
  const html = await response.text();

  document.getElementById(id).innerHTML = html;
}

async function loadPage(id, page) {
  const response = await fetch(`../pages/${page}.html`);
  const html = await response.text();

  const container = document.getElementById(id);

  const temp = document.createElement("div");
  temp.innerHTML = html;

  const firstChild = temp.firstElementChild;

  if (firstChild) {
    container.replaceChildren(...firstChild.children);
  }
}

// async function loadPage(id, page) {
//   const response = await fetch(`../pages/${page}.html`);
//   const html = await response.text();

//   document.getElementById(id).innerHTML = html;
// }