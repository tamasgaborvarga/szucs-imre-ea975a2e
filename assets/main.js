/* Minimális JS: mobilmenü, képnagyító, szűrő, kattintásra betöltődő videó/térkép */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  // mobilmenü
  var tg = document.querySelector('.nav-toggle'), nav = document.getElementById('nav');
  if (tg && nav) {
    tg.addEventListener('click', function () {
      var o = nav.classList.toggle('is-open');
      tg.setAttribute('aria-expanded', o ? 'true' : 'false');
      tg.textContent = o ? 'Bezár' : 'Menü';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { tg.click(); tg.focus(); }
    });
  }

  // szűrő
  document.querySelectorAll('[data-filter-group]').forEach(function (g) {
    var target = document.querySelector(g.getAttribute('data-filter-group'));
    if (!target) return;
    var btns = g.querySelectorAll('.chip');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        target.querySelectorAll('[data-cat]').forEach(function (el) {
          var show = f === 'all' || el.getAttribute('data-cat').split(' ').indexOf(f) > -1;
          if (show) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
        });
      });
    });
  });

  // téma előválasztása a hashből (pl. irasok.html#t-inas)
  var hm = /^#t-(\w+)$/.exec(location.hash || '');
  if (hm) { var pre = document.querySelector('.chip[data-f="' + hm[1] + '"]'); if (pre) pre.click(); }

  // képnagyító
  var links = Array.prototype.slice.call(document.querySelectorAll('a.lb'));
  if (links.length && typeof HTMLDialogElement === 'function') {
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'Képnagyító');
    dlg.innerHTML =
      '<div class="lb-inner"><div class="lb-stage">' +
      '<img alt="">' +
      '<button class="lb-btn lb-close" type="button" aria-label="Bezárás">Bezár</button>' +
      '<button class="lb-btn lb-prev" type="button" aria-label="Előző kép">‹ Előző</button>' +
      '<button class="lb-btn lb-next" type="button" aria-label="Következő kép">Következő ›</button>' +
      '</div><div class="lb-cap"><span class="lb-t"></span><span class="lb-n"></span></div></div>';
    document.body.appendChild(dlg);
    var img = dlg.querySelector('img'), t = dlg.querySelector('.lb-t'), n = dlg.querySelector('.lb-n');
    var cur = 0, set = [], opener = null;
    function visible() {
      return links.filter(function (a) { var f = a.closest('figure'); return !(f && f.hasAttribute('hidden')); });
    }
    function show(i) {
      cur = (i + set.length) % set.length;
      var a = set[cur];
      img.src = a.getAttribute('href');
      var im = a.querySelector('img');
      img.alt = im ? im.alt : '';
      t.textContent = a.getAttribute('data-cap') || (im ? im.alt : '');
      n.textContent = (cur + 1) + ' / ' + set.length;
    }
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        opener = a; set = visible();
        show(set.indexOf(a));
        dlg.showModal();
        dlg.querySelector('.lb-close').focus();
      });
    });
    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.lb-prev').addEventListener('click', function () { show(cur - 1); });
    dlg.querySelector('.lb-next').addEventListener('click', function () { show(cur + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('lb-inner') || e.target.classList.contains('lb-stage')) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(cur - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { show(cur + 1); e.preventDefault(); }
    });
    dlg.addEventListener('close', function () { if (opener) opener.focus(); });
    var sx = null;
    dlg.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  // kattintásra betöltődő beágyazások (nincs külső kérés a kattintásig)
  document.querySelectorAll('.embed[data-src]').forEach(function (box) {
    var b = box.querySelector('button');
    if (!b) return;
    b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = box.getAttribute('data-src');
      f.title = box.getAttribute('data-title') || '';
      f.loading = 'lazy';
      f.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.allowFullscreen = true;
      box.innerHTML = '';
      box.appendChild(f);
    });
  });
})();
