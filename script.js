/* =================================================================
   Cabinet Benkirane — script.js
   ================================================================= */
(function () {
  "use strict";

  /* ---- Année footer ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- Menu mobile ---- */
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    header.querySelectorAll(".nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Reveal au scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Slider Avant / Après ---- */
  var baList = document.querySelectorAll(".ba");
  baList.forEach(function (ba) {
    var stage = ba.querySelector(".ba-stage");
    var before = ba.querySelector(".ba-before");
    var handle = ba.querySelector(".ba-handle");
    if (!stage || !before || !handle) return;
    var dragging = false;

    function setPos(pct) {
      pct = Math.max(0, Math.min(100, pct));
      before.style.clipPath = "inset(0 " + (100 - pct) + "% 0 0)";
      handle.style.left = pct + "%";
      handle.setAttribute("aria-valuenow", Math.round(pct));
    }
    function posFromEvent(clientX) {
      var rect = stage.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }
    function onMove(clientX) { if (dragging) setPos(posFromEvent(clientX)); }

    handle.addEventListener("pointerdown", function (e) {
      dragging = true;
      handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    handle.addEventListener("pointermove", function (e) { onMove(e.clientX); });
    handle.addEventListener("pointerup", function () { dragging = false; });
    handle.addEventListener("pointercancel", function () { dragging = false; });

    stage.addEventListener("pointerdown", function (e) {
      if (e.target === handle || handle.contains(e.target)) return;
      setPos(posFromEvent(e.clientX));
    });

    handle.addEventListener("keydown", function (e) {
      var cur = parseFloat(handle.getAttribute("aria-valuenow")) || 50;
      if (e.key === "ArrowLeft") { setPos(cur - 4); e.preventDefault(); }
      else if (e.key === "ArrowRight") { setPos(cur + 4); e.preventDefault(); }
      else if (e.key === "Home") { setPos(0); e.preventDefault(); }
      else if (e.key === "End") { setPos(100); e.preventDefault(); }
    });

    setPos(50);
  });
  /* ---- Carrousel galerie ---- */
  var carousel = document.getElementById("carousel");
  if (carousel) {
    var track = document.getElementById("carTrack");
    var viewport = document.getElementById("carViewport");
    var slides = Array.prototype.slice.call(track.children);
    var dotsWrap = document.getElementById("carDots");
    var prevBtn = document.getElementById("carPrev");
    var nextBtn = document.getElementById("carNext");
    var count = slides.length;
    var index = 0;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // points de navigation
    var dots = [];
    for (var i = 0; i < count; i++) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Aller à la photo " + (i + 1));
      (function (idx) { dot.addEventListener("click", function () { goTo(idx, true); }); })(i);
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }

    function render() {
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      dots.forEach(function (d, i) { d.classList.toggle("active", i === index); });
      slides.forEach(function (s, i) { s.setAttribute("aria-hidden", i === index ? "false" : "true"); });
    }
    function goTo(i, fromUser) {
      index = (i + count) % count;
      render();
      if (fromUser) restart();
    }
    function next(fromUser) { goTo(index + 1, fromUser); }
    function prev(fromUser) { goTo(index - 1, fromUser); }

    nextBtn.addEventListener("click", function () { next(true); });
    prevBtn.addEventListener("click", function () { prev(true); });

    // défilement automatique (pause au survol / focus, désactivé si reduced-motion)
    var timer = null;
    function start() { if (reduceMotion) return; stop(); timer = setInterval(function () { next(false); }, 5000); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", start);

    // swipe / glisser
    var startX = 0, dx = 0, dragging = false;
    viewport.addEventListener("pointerdown", function (e) {
      dragging = true; startX = e.clientX; dx = 0;
      track.classList.add("dragging");
      viewport.setPointerCapture(e.pointerId);
      stop();
    });
    viewport.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      dx = e.clientX - startX;
      track.style.transform = "translateX(calc(" + (-index * 100) + "% + " + dx + "px))";
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("dragging");
      var threshold = viewport.clientWidth * 0.18;
      if (dx > threshold) prev(false);
      else if (dx < -threshold) next(false);
      else render();
      start();
    }
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);

    // clavier (flèches gauche/droite)
    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { prev(true); e.preventDefault(); }
      else if (e.key === "ArrowRight") { next(true); e.preventDefault(); }
    });

    render();
    start();
  }
})();
