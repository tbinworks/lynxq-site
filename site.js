// LynxQ API site: small enhancements, no dependencies. Without JavaScript every
// screenshot is a plain link to its full-size image, and nothing is hidden.
(function () {
  "use strict";

  // The release. Empty while LynxQ API isn't published: every download button stays a
  // disabled "Coming soon". Once a release really exists, put its page here (e.g. the
  // GitHub Releases page of the published repository) and each button becomes
  // "Download for Windows". Never point it at a release that doesn't exist.
  var RELEASE_URL = "";

  if (RELEASE_URL) {
    document.querySelectorAll("[data-download]").forEach(function (el) {
      var a = document.createElement("a");
      a.className = "button primary";
      a.href = RELEASE_URL;
      a.textContent = "Download for Windows";
      el.replaceWith(a);
    });
    document.querySelectorAll("[data-download-nav]").forEach(function (a) { a.textContent = "Download"; });
  }

  // Phone menu: the button slides the section list in from the right. A section link,
  // a tap outside it, Escape, or widening the window past phone size closes it again.
  var header = document.querySelector("header.top");
  var menuBtn = header && header.querySelector(".menu-btn");
  if (menuBtn) {
    var setMenu = function (open) {
      header.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Menu");
      document.documentElement.classList.toggle("menu-open", open);
    };
    menuBtn.addEventListener("click", function () { setMenu(!header.classList.contains("is-open")); });
    header.querySelectorAll("nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("click", function (ev) {
      if (header.classList.contains("is-open") && !ev.target.closest("nav, .menu-btn")) setMenu(false);
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && header.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia("(max-width: 620px)").addEventListener("change", function (mq) { if (!mq.matches) setMenu(false); });
  }

  // Switches (Environments, Themes): each button shows its screenshot on the stage.
  document.querySelectorAll("[data-gallery]").forEach(function (gallery) {
    var img = gallery.querySelector("img[data-stage]");
    var cap = gallery.querySelector("figcaption[data-caption]");
    var stageLink = gallery.querySelector("a[data-stage-link]");
    var links = gallery.querySelectorAll("a[data-caption]:not([data-lightbox])");
    if (!img || !cap) return;
    links.forEach(function (link) {
      link.addEventListener("click", function (ev) {
        ev.preventDefault();
        img.src = link.getAttribute("href");
        img.alt = link.dataset.alt || "";
        cap.textContent = link.dataset.caption || "";
        if (stageLink) stageLink.setAttribute("href", link.getAttribute("href"));
        links.forEach(function (o) { o.classList.remove("is-current"); o.removeAttribute("aria-current"); });
        link.classList.add("is-current");
        link.setAttribute("aria-current", "true");
      });
    });
  });

  // Full-size viewer: a modal dialog. Escape closes it (the browser's own dialog
  // behaviour), Left and Right move between the page's screenshots, and focus returns
  // to the screenshot that opened it.
  if (typeof HTMLDialogElement !== "function") return;
  var shots = Array.prototype.slice.call(document.querySelectorAll("a[data-lightbox]"));
  if (!shots.length) return;

  var dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", "Screenshot, full size");
  dialog.innerHTML =
    '<div class="lb-bar">' +
      '<p class="lb-count" aria-live="polite"></p>' +
      '<div class="lb-buttons">' +
        '<button type="button" class="lb-btn lb-prev" aria-label="Previous screenshot">←</button>' +
        '<button type="button" class="lb-btn lb-next" aria-label="Next screenshot">→</button>' +
        '<button type="button" class="lb-btn lb-close" aria-label="Close">×</button>' +
      '</div>' +
    '</div>' +
    '<figure class="lb-figure"><img class="lb-img" alt=""><figcaption class="lb-cap"></figcaption></figure>';
  document.body.appendChild(dialog);

  var lbImg = dialog.querySelector(".lb-img");
  var lbCap = dialog.querySelector(".lb-cap");
  var lbCount = dialog.querySelector(".lb-count");
  var prev = dialog.querySelector(".lb-prev");
  var next = dialog.querySelector(".lb-next");
  var index = 0;
  var opener = null;

  function captionFor(link) {
    if (link.dataset.caption) return link.dataset.caption;
    var fig = link.closest("figure");
    var cap = fig && fig.querySelector("figcaption");
    return cap ? cap.textContent : "";
  }

  function show(i) {
    index = (i + shots.length) % shots.length;
    var link = shots[index];
    var thumb = link.querySelector("img");
    lbImg.src = link.getAttribute("href");
    lbImg.alt = thumb ? thumb.alt : "";
    if (thumb) { lbImg.width = thumb.getAttribute("width"); lbImg.height = thumb.getAttribute("height"); }
    lbCap.textContent = captionFor(link);
    lbCount.textContent = "Screenshot " + (index + 1) + " of " + shots.length;
  }

  shots.forEach(function (link, i) {
    link.addEventListener("click", function (ev) {
      if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.button === 1) return; // a new tab, as asked
      ev.preventDefault();
      opener = link;
      show(i);
      dialog.showModal();
      document.documentElement.classList.add("lb-open");
      dialog.querySelector(".lb-close").focus();
    });
  });

  prev.addEventListener("click", function () { show(index - 1); });
  next.addEventListener("click", function () { show(index + 1); });
  dialog.querySelector(".lb-close").addEventListener("click", function () { dialog.close(); });
  dialog.addEventListener("keydown", function (ev) {
    if (ev.key === "ArrowLeft") { ev.preventDefault(); show(index - 1); }
    else if (ev.key === "ArrowRight") { ev.preventDefault(); show(index + 1); }
  });
  // A click on the dark backdrop (outside the image and the buttons) closes it.
  dialog.addEventListener("click", function (ev) { if (ev.target === dialog) dialog.close(); });
  dialog.addEventListener("close", function () {
    document.documentElement.classList.remove("lb-open");
    if (opener) opener.focus();
  });
  if (shots.length < 2) { prev.hidden = true; next.hidden = true; }
})();
