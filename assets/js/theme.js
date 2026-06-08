(function () {
  var root = document.documentElement;
  var light = document.getElementById("syntax-light");
  var dark = document.getElementById("syntax-dark");
  var btn = document.getElementById("theme-toggle");

  function applySyntax(pref) {
    if (!light || !dark) return;
    if (pref === "light") {
      light.media = "all";
      dark.media = "not all";
    } else if (pref === "dark") {
      light.media = "not all";
      dark.media = "all";
    } else {
      light.media = "(prefers-color-scheme: light)";
      dark.media = "(prefers-color-scheme: dark)";
    }
  }

  function setPref(pref) {
    if (pref === "auto") {
      root.removeAttribute("data-theme");
      try { localStorage.removeItem("theme"); } catch (e) {}
    } else {
      root.setAttribute("data-theme", pref);
      try { localStorage.setItem("theme", pref); } catch (e) {}
    }
    root.setAttribute("data-theme-pref", pref);
    applySyntax(pref);
  }

  applySyntax(root.getAttribute("data-theme-pref") || "auto");

  if (btn) {
    btn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme-pref") || "auto";
      var next = current === "light" ? "dark" : current === "dark" ? "auto" : "light";
      setPref(next);
    });
  }
})();
