(function () {
  var burger = document.getElementById('burger');
  var overlay = document.querySelector('.burger-overlay');
  if (!burger || !overlay) return;

  burger.addEventListener('click', function () {
    overlay.classList.toggle('open');
  });

  overlay.querySelectorAll('.burger-link').forEach(function (link) {
    link.addEventListener('click', function () {
      overlay.classList.remove('open');
    });
  });
})();
