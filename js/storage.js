(function (global) {
  "use strict";

  const LEGACY_KEY = "focusClock.v1";
  const DATA_KEY = "focusClock.v2";

  const defaults = () => ({
    state: {
      sides: [
        { name: "My Time", durationMs: 14400000, remainingMs: 14400000 },
        { name: "Other Time", durationMs: 7200000, remainingMs: 7200000 }
      ],
      activeIndex: null,
      running: false,
      lastTick: null,
      lastActivity: null,
      alerted: [false, false],
      session: { focusMs: 0, timePassMs: 0 }
    },
    settings: {
      idleEnabled: true,
      idleMinutes: 3,
      systemIdleGranted: false,
      pauseEnabled: false,
      notifEnabled: false,
      soundEnabled: true,
      wakeEnabled: true,
      theme: "dark"
    },
    history: {}
  });

  function merge(base, incoming) {
    if (!incoming || typeof incoming !== "object") return base;
    Object.keys(incoming).forEach(key => {
      if (incoming[key] && typeof incoming[key] === "object" && !Array.isArray(incoming[key]) && base[key]) {
        merge(base[key], incoming[key]);
      } else {
        base[key] = incoming[key];
      }
    });
    return base;
  }

  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; }
  }

  function load() {
    const data = defaults();
    const current = readJSON(DATA_KEY);
    if (current) return merge(data, current);

    // Migration: retain every setting and live clock value from the original single-file app.
    const legacy = readJSON(LEGACY_KEY);
    if (legacy) {
      merge(data, legacy);
      save(data);
    }
    return data;
  }

  function save(data) {
    try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); } catch (_) { /* private mode / quota */ }
  }

  global.FCStorage = { load, save, DATA_KEY, LEGACY_KEY };
})(window);
