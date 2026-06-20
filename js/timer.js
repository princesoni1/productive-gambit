(function (global) {
  "use strict";

  let data, hooks = {}, interval, wakeLock = null, audioContext = null;
  let systemIdleDetector = null, systemIdleController = null, systemIdleActive = false;
  let lifecycleWasRunning = false, screenWasRunning = false;
  let heartbeatWall = Date.now(), heartbeatMonotonic = performance.now();
  const state = () => data.state;
  const settings = () => data.settings;

  function init(appData, callbacks) {
    data = appData;
    hooks = callbacks || {};
    const s = state();
    s.session = s.session || { focusMs: 0, timePassMs: 0 };
    // A persisted running state means the page was closed, killed, or reloaded.
    // Never turn that wall-clock gap into Focus or Time Pass time.
    if (s.running) {
      s.running = false;
      s.lastTick = null;
      s.lastActivity = Date.now();
    }
    interval = setInterval(tick, 250);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        state().lastActivity = Date.now();
        requestWakeLock();
      }
    });
    // Page Lifecycle events cover browser tab freezing and back-forward cache.
    // A frozen page resumes from a fresh timestamp, excluding the frozen gap.
    document.addEventListener("freeze", suspendForLifecycle);
    document.addEventListener("resume", resumeFromLifecycle);
    window.addEventListener("pagehide", suspendForLifecycle);
    window.addEventListener("pageshow", event => { if (event.persisted) resumeFromLifecycle(); });
    window.addEventListener("beforeunload", suspendForLifecycle);
    if (settings().systemIdleGranted) enableSystemIdle(false);
    renderAndSave();
    requestWakeLock();
  }

  function applyElapsed(timestamp) {
    const s = state();
    if (s.activeIndex === null || !s.running || !s.lastTick) return;
    const elapsed = Math.max(0, timestamp - s.lastTick);
    s.sides[s.activeIndex].remainingMs -= elapsed;
    if (s.activeIndex === 0) s.session.focusMs += elapsed;
    else s.session.timePassMs += elapsed;
    s.lastTick = timestamp;
  }

  function checkZero(i) {
    const s = state(), side = s.sides[i];
    if (side.remainingMs <= 0 && !s.alerted[i]) {
      s.alerted[i] = true;
      notify(side.name + " is at zero", side.name + " has used its full budget.");
      beep(i === 0 ? 660 : 520, 260);
      hooks.announce && hooks.announce(side.name + " has reached zero and is now in overtime.");
    }
  }

  function switchTo(index) {
    const now = Date.now(), s = state();
    if (s.running) applyElapsed(now);
    s.activeIndex = index;
    s.running = true;
    s.lastTick = now;
    s.lastActivity = now;
    resetHeartbeat();
    requestWakeLock();
    renderAndSave();
  }

  function toggleSide() { switchTo(state().activeIndex === 0 ? 1 : 0); }

  function togglePause() {
    const s = state();
    if (!settings().pauseEnabled || s.activeIndex === null) return;
    if (s.running) { applyElapsed(Date.now()); s.running = false; releaseWakeLock(); }
    else { s.lastTick = Date.now(); s.lastActivity = Date.now(); s.running = true; requestWakeLock(); }
    renderAndSave();
  }

  function registerActivity() {
    const s = state(), now = Date.now();
    if (now - (s.lastActivity || 0) > 800) s.lastActivity = now;
  }

  function tick() {
    const s = state();
    if (!s.running) return;
    const now = Date.now();
    // On platforms where monotonic time excludes system sleep, a large drift
    // from wall time reveals the suspend interval. Drop that interval.
    const monotonicNow = performance.now();
    const sleptFor = (now - heartbeatWall) - (monotonicNow - heartbeatMonotonic);
    heartbeatWall = now;
    heartbeatMonotonic = monotonicNow;
    if (sleptFor > 2000) {
      s.lastTick = now;
      s.lastActivity = now;
      hooks.announce && hooks.announce("Sleep detected. Suspended time was excluded.");
      renderAndSave();
      return;
    }
    // When system-wide detection is unavailable, local input is only meaningful
    // while this page is visible. A hidden page must not interpret missing events
    // as inactivity because the user may be working in another app or tab.
    if (settings().idleEnabled && !systemIdleActive && document.visibilityState === "visible") {
      const limit = settings().idleMinutes * 60000;
      if (s.activeIndex === 0 && now - (s.lastActivity || now) > limit) {
        // Split elapsed time at the idle boundary: work before it remains Focus,
        // while time after it is correctly attributed to Time Pass.
        const switchAt = s.lastActivity + limit;
        applyElapsed(switchAt);
        s.activeIndex = 1;
        s.lastTick = switchAt;
        applyElapsed(now);
        s.lastActivity = now;
        hooks.announce && hooks.announce("No activity detected. Switched to Time Pass.");
        renderAndSave();
        return;
      }
    }
    applyElapsed(now);
    checkZero(0); checkZero(1);
    renderAndSave();
  }

  function stopAndReset() {
    const s = state();
    if (s.running) applyElapsed(Date.now());
    s.sides.forEach(side => { side.remainingMs = side.durationMs; });
    s.activeIndex = null; s.running = false; s.lastTick = null; s.alerted = [false, false];
    s.session = { focusMs: 0, timePassMs: 0 };
    releaseWakeLock();
    renderAndSave();
  }

  function suspendTimer() {
    const s = state(), wasRunning = s.running;
    if (wasRunning) applyElapsed(Date.now());
    s.running = false;
    s.lastTick = null;
    releaseWakeLock();
    renderAndSave();
    return wasRunning;
  }

  function resumeTimer() {
    const s = state();
    if (s.activeIndex === null) return;
    s.running = true;
    s.lastTick = s.lastActivity = Date.now();
    resetHeartbeat();
    requestWakeLock();
    renderAndSave();
  }

  function suspendForLifecycle() {
    lifecycleWasRunning = suspendTimer() || lifecycleWasRunning;
  }

  function resumeFromLifecycle() {
    if (!lifecycleWasRunning) return;
    lifecycleWasRunning = false;
    resumeTimer();
  }

  function resetHeartbeat() {
    heartbeatWall = Date.now();
    heartbeatMonotonic = performance.now();
  }

  function renderAndSave() { hooks.render && hooks.render(); hooks.save && hooks.save(); }
  function hasProgress() { const s = state(); return s.running || s.session.focusMs > 0 || s.session.timePassMs > 0; }
  function snapshot() { if (state().running) applyElapsed(Date.now()); return { ...state().session }; }

  function notify(title, body) {
    if (settings().notifEnabled && "Notification" in window && Notification.permission === "granted") {
      try { new Notification(title, { body }); } catch (_) {}
    }
  }
  function beep(frequency, duration) {
    if (!settings().soundEnabled) return;
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioContext.createOscillator(), gain = audioContext.createGain();
      osc.frequency.value = frequency; gain.gain.value = .12;
      osc.connect(gain); gain.connect(audioContext.destination); osc.start();
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration / 1000);
      osc.stop(audioContext.currentTime + duration / 1000);
    } catch (_) {}
  }
  async function requestWakeLock() {
    if (!settings().wakeEnabled || !state().running || !("wakeLock" in navigator) || wakeLock) return;
    try { wakeLock = await navigator.wakeLock.request("screen"); wakeLock.addEventListener("release", () => wakeLock = null); } catch (_) {}
  }
  function releaseWakeLock() { if (wakeLock) { try { wakeLock.release(); } catch (_) {} wakeLock = null; } }

  async function enableSystemIdle(requestPermission) {
    if (!("IdleDetector" in window) || !window.isSecureContext) {
      systemIdleActive = false;
      return "unsupported";
    }
    try {
      if (requestPermission) {
        const permission = await window.IdleDetector.requestPermission();
        settings().systemIdleGranted = permission === "granted";
        hooks.save && hooks.save();
        if (permission !== "granted") return "denied";
      } else if (!settings().systemIdleGranted) return "permission-needed";

      if (systemIdleController) systemIdleController.abort();
      systemIdleController = new AbortController();
      systemIdleDetector = new window.IdleDetector();
      systemIdleDetector.addEventListener("change", () => {
        // A locked screen commonly accompanies laptop sleep. Freeze accrual at
        // lock and restart from the unlock timestamp, excluding sleep entirely.
        if (systemIdleDetector.screenState === "locked") {
          screenWasRunning = suspendTimer() || screenWasRunning;
          return;
        }
        if (systemIdleDetector.screenState === "unlocked" && screenWasRunning) {
          screenWasRunning = false;
          resumeTimer();
        }
        if (settings().idleEnabled && systemIdleDetector.userState === "idle" && state().running && state().activeIndex === 0) {
          applyElapsed(Date.now());
          switchTo(1);
          hooks.announce && hooks.announce("System inactivity detected. Switched to Time Pass.");
        } else if (systemIdleDetector.userState === "active") {
          state().lastActivity = Date.now();
        }
      });
      await systemIdleDetector.start({ threshold: Math.max(60000, settings().idleMinutes * 60000), signal: systemIdleController.signal });
      systemIdleActive = true;
      return "active";
    } catch (_) {
      systemIdleActive = false;
      settings().systemIdleGranted = false;
      hooks.save && hooks.save();
      return "denied";
    }
  }

  function systemIdleStatus() {
    if (!("IdleDetector" in window) || !window.isSecureContext) return "unsupported";
    return systemIdleActive ? "active" : settings().systemIdleGranted ? "starting" : "permission-needed";
  }

  global.FCTimer = { init, switchTo, toggleSide, togglePause, registerActivity, stopAndReset, hasProgress, snapshot, requestWakeLock, releaseWakeLock, enableSystemIdle, systemIdleStatus };
})(window);
