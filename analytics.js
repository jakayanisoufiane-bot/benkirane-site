/*
 * Suivi d'audience — Cabinet Dentaire Benkirane
 * - Google Analytics 4 : pages vues + chaque clic (boutons, liens), scroll, sections vues
 * - Vercel Web Analytics : pages vues, sources, pays, appareils
 * La balise Google (gtag.js) est déjà chargée dans index.html (Google Ads).
 */
(function () {
  // ➜ Coller ici l'ID de mesure GA4 (format G-XXXXXXXXXX). Vide = GA4 désactivé.
  var GA4_ID = 'G-Y0EHKN9R9G';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (typeof window.gtag !== 'function') window.gtag = gtag;
  if (GA4_ID) window.gtag('config', GA4_ID);

  // Vercel Web Analytics
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  var vs = document.createElement('script');
  vs.defer = true; vs.src = '/_vercel/insights/script.js';
  document.head.appendChild(vs);

  function send(name, params) {
    try {
      if (GA4_ID) window.gtag('event', name, Object.assign({ send_to: GA4_ID }, params));
      window.va('event', { name: name, data: params });
    } catch (e) { /* ne jamais casser le site */ }
  }

  // Zone de la page où se trouve l'élément cliqué
  function zone(el) {
    if (el.closest('header, .site-header, nav')) return 'menu';
    if (el.closest('footer')) return 'footer';
    var s = el.closest('section[id]');
    if (s) return s.id;
    if (el.closest('.whatsapp-float, .wa-float, [class*="float"]')) return 'bouton_flottant';
    return 'autre';
  }

  // Type d'action selon le lien
  function typeOf(el) {
    var h = (el.getAttribute('href') || '');
    if (/wa\.me|whatsapp/i.test(h)) return 'whatsapp';
    if (/^tel:\+?212689473866/.test(h)) return 'appel_mobile';
    if (/^tel:/.test(h)) return 'appel_fixe';
    if (/instagram\.com/i.test(h)) return 'instagram';
    if (/facebook\.com/i.test(h)) return 'facebook';
    if (/google\.[^/]+\/maps|maps\.app|goo\.gl\/maps/i.test(h)) return 'itineraire';
    if (/^mailto:/.test(h)) return 'email';
    if (h.charAt(0) === '#') return 'navigation';
    if (el.tagName === 'BUTTON') {
      if (el.classList.contains('nav-toggle')) return 'menu_mobile';
      if (el.closest('.carousel, [class*="carousel"]')) return 'carrousel';
      return 'bouton';
    }
    return /^https?:/.test(h) && h.indexOf(location.hostname) === -1 ? 'lien_externe' : 'lien_interne';
  }

  function label(el) {
    var t = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim();
    return t.slice(0, 80) || (el.getAttribute('href') || '').slice(0, 80);
  }

  // 1. Tous les clics sur liens et boutons
  document.addEventListener('click', function (e) {
    var el = e.target.closest('a, button');
    if (!el) return;
    var type = typeOf(el);
    var params = { type_action: type, zone: zone(el), texte: label(el), lien: (el.getAttribute('href') || '').slice(0, 120) };
    send('clic_bouton', params);
    // Prises de contact = « lead » dans GA4
    if (type === 'whatsapp' || type === 'appel_mobile' || type === 'appel_fixe') {
      send('generate_lead', { methode: type, zone: params.zone });
    }
  }, true);

  // 2. Profondeur de scroll (25 / 50 / 75 / 100 %)
  var marks = [25, 50, 75, 100], seen = {};
  window.addEventListener('scroll', function () {
    var d = document.documentElement;
    var pct = Math.round((window.scrollY + window.innerHeight) / d.scrollHeight * 100);
    marks.forEach(function (m) {
      if (pct >= m && !seen[m]) { seen[m] = 1; send('scroll_profondeur', { pourcentage: m }); }
    });
  }, { passive: true });

  // 3. Sections réellement vues (au moins 40 % visibles)
  if ('IntersectionObserver' in window) {
    var done = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var id = en.target.id;
        if (en.isIntersecting && !done[id]) { done[id] = 1; send('vue_section', { section: id }); }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('section[id]').forEach(function (s) { io.observe(s); });
  }
})();
