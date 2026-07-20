// Carrega um componente html dentro de um container
async function loadComponent(id, path) {
  const response = await fetch(path);
  const html = await response.text();

  const temp = document.createElement("div");
  temp.innerHTML = html;

  const template = temp.querySelector("template");

  const target = document.getElementById(id);

  target.replaceChildren(template.content.cloneNode(true));
}

// Substitui um elemento por um componente html
async function replaceComponent(id, path) {
  const response = await fetch(path);
  const html = await response.text();

  const temp = document.createElement("div");
  temp.innerHTML = html;

  const template = temp.querySelector("template");

  if (!template) {
    throw new Error(
      `Nenhum <template> encontrado em ${path}`
    );
  }

  const target = document.getElementById(id);

  if (!target) {
    throw new Error(
      `Elemento com id "${id}" não encontrado`
    );
  }

  const fragment = template.content.cloneNode(true);

  target.replaceWith(...fragment.childNodes);
}

// Carrega uma página em um elemento html
async function loadPage(id, page, pageTitle) {
  page = (page.includes(".html")) ? page : `../pages/${page}.html`;
  replaceComponent(id, page);
  document.title = pageTitle;
}