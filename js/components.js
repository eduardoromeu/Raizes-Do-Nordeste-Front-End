async function loadComponent(id, path) {
  const response = await fetch(path);
  const html = await response.text();

  document.getElementById(id).innerHTML = html;
}