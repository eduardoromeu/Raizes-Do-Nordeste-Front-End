// Carrega um componente html dentro de um container
async function loadComponent(id, path) {
  const response = await fetch(path);
  const html = await response.text();

  const temp = document.createElement("div");
  temp.innerHTML = html;

  const template = temp.querySelector("template");

  const target = document.getElementById(id);

  try {
    if (!template) {
      throw new Error(
        `Template do componente ${path} não encontrado`
      );
    }
  } catch (error) {
    console.error(error);
    return template;
  }

  target.replaceChildren(template.content.cloneNode(true));
  return target.childNodes;
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
  document.title = pageTitle;
  page = (page.endsWith(".html")) ? page : `./pages/${page}.html`;
  const loadedPage = await loadComponent(id, page);
  if (!loadedPage) {
    document.title = "404 - Página não encontrada";
    loadComponent(id, "./pages/notfound.html");
  }
}