(function () {
  if (window.location.pathname.indexOf('00_map') !== -1) return;
  var a = document.createElement('a');
  a.href = 'index.html';
  a.className = 'map-fab';
  a.textContent = 'サイトマップ';
  var container = document.querySelector('.page-wrapper') || document.body;
  container.insertBefore(a, container.firstChild);
})();
