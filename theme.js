(function () {
  'use strict';

  var THEMES = ['morning', 'noon', 'afternoon', 'night'];

  function clampTheme(t) {
    return THEMES.indexOf(t) !== -1 ? t : null;
  }

  function getAutoTheme() {
    var h = new Date().getHours();
    if (h >= 19 || h < 5) return 'night';
    if (h >= 5 && h < 10) return 'morning';
    if (h >= 10 && h < 15) return 'noon';
    return 'afternoon';
  }

  function emitThemeChanged(theme, source) {
    try {
      window.dispatchEvent(new CustomEvent('hotspot:theme', { detail: { theme: theme, source: source || 'unknown' } }));
    } catch (e) {}
  }

  function applyTheme(theme, source) {
    document.documentElement.setAttribute('data-theme', theme);
    emitThemeChanged(theme, source);
  }

  function getQueryTheme() {
    try {
      var q = new URLSearchParams(window.location.search);
      return clampTheme(q.get('theme'));
    } catch (e) {
      return null;
    }
  }

  function getStoredTheme() {
    try {
      return clampTheme(localStorage.getItem('hotspot_theme'));
    } catch (e) {
      return null;
    }
  }

  function storeTheme(theme) {
    try { localStorage.setItem('hotspot_theme', theme); } catch (e) {}
  }

  function clearStoredTheme() {
    try { localStorage.removeItem('hotspot_theme'); } catch (e) {}
  }

  // Initial theme
  var qTheme = getQueryTheme();
  var stored = getStoredTheme();
  var initial = qTheme || stored || getAutoTheme();
  applyTheme(initial, qTheme ? 'query' : (stored ? 'storage' : 'auto'));

  // Expose helper (optional)
  window.__hotspotTheme = {
    THEMES: THEMES.slice(),
    apply: function (t, persist) {
      var tt = clampTheme(t) || getAutoTheme();
      applyTheme(tt, 'api');
      if (persist) storeTheme(tt);
    },
    auto: function () {
      clearStoredTheme();
      applyTheme(getAutoTheme(), 'auto');
    }
  };

  function setBtnLabels(btn, theme, mode) {
    // mode: "manual" or "auto"
    var label = (mode === 'auto')
      ? 'Thème automatique (cliquer pour changer)'
      : ('Thème: ' + theme + ' (cliquer pour changer)');
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  }

  // Manual toggle (sun icon)
  function attachToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') || getAutoTheme();
      var idx = THEMES.indexOf(cur);
      var next = THEMES[(idx + 1) % THEMES.length];
      applyTheme(next, 'manual');
      storeTheme(next);
      setBtnLabels(btn, next, 'manual');
    });

    // Double click -> return to automatic
    btn.addEventListener('dblclick', function () {
      clearStoredTheme();
      var auto = getAutoTheme();
      applyTheme(auto, 'auto');
      setBtnLabels(btn, auto, 'auto');
    });

    // init label
    var curTheme = document.documentElement.getAttribute('data-theme') || initial;
    setBtnLabels(btn, curTheme, stored ? 'manual' : 'auto');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachToggle);
  } else {
    attachToggle();
  }
})();