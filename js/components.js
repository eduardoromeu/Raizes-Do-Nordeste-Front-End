// Carrega um componente html dentro de um container
async function loadComponent(id, path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      console.error(`Falha ao carregar ${path}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const temp = document.createElement("div");
    temp.innerHTML = html;

    const template = temp.querySelector("template");
    if (!template) {
      console.error(`Template do componente ${path} não encontrado`);
      return null;
    }

    const target = document.getElementById(id);
    if (!target) {
      console.error(`Elemento com id "${id}" não encontrado para renderizar ${path}`);
      return null;
    }

    const cloned = template.content.cloneNode(true);
    target.replaceChildren(cloned);
    return target.childNodes;

  } catch (error) {
    console.error(`Erro ao carregar componente ${path}:`, error);
    return null;
  }
}

// Substitui um elemento por um componente html
async function replaceComponent(id, path) {
  try {
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
        `Elemento com id "${id}" não encontrado para renderizar ${path}`
      );
    }

    const fragment = template.content.cloneNode(true);

    target.replaceWith(...fragment.childNodes);

  } catch (error) {
    console.error(`Erro ao carregar componente ${path}:`, error);
    return null;
  }
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