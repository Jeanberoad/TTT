(function () {
  'use strict';

  // ── Always erase any previously stored theme immediately ──────────────
  // This prevents mobile cache from ever restoring an old manual choice.
  try { localStorage.removeItem('hotspot_theme'); } catch (e) {}
  try { sessionStorage.removeItem('hotspot_theme'); } catch (e) {}

  var THEMES = ['morning', 'noon', 'afternoon', 'night'];

  // ── Determine theme strictly from current local time ──────────────────
  function getAutoTheme() {
    var h = new Date().getHours();
    if (h >= 19 || h < 5)  return 'night';
    if (h >= 5  && h < 10) return 'morning';
    if (h >= 10 && h < 15) return 'noon';
    return 'afternoon';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.dispatchEvent(new CustomEvent('hotspot:theme', {
        detail: { theme: theme, source: 'auto' }
      }));
    } catch (e) {}
  }

  // ── Apply immediately (before DOM is painted) ─────────────────────────
  var currentTheme = getAutoTheme();
  applyTheme(currentTheme);

  // Re-apply after load to defeat any cached value that painted too early
  function reApply() {
    var fresh = getAutoTheme();
    if (document.documentElement.getAttribute('data-theme') !== fresh) {
      applyTheme(fresh);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reApply);
  } else {
    reApply();
  }

  window.addEventListener('load', reApply);

  // ── Public API (read-only; no persistence) ─────────────────────────────
  window.__hotspotTheme = {
    THEMES: THEMES.slice(),
    getAuto: getAutoTheme,
    current: function () {
      return document.documentElement.getAttribute('data-theme') || getAutoTheme();
    }
  };

  // ── Theme toggle button: disabled (no manual override) ─────────────────
  // The sun icon button is kept in the UI for visual consistency but no
  // longer changes the theme. It shows a tooltip explaining the behavior.
  function attachToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    var label = 'Thème automatique selon l\'heure';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);

    // Absorb clicks silently — no theme change, no storage
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachToggle);
  } else {
    attachToggle();
  }
})();
