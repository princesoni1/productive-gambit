(function () {
  "use strict";

  const data = FCStorage.load(), $ = id => document.getElementById(id);
  FCUI.init(data);
  FCTimer.init(data, { render: FCUI.renderClock, save: () => FCStorage.save(data), announce: FCUI.announce });

  function finishSession() { FCAnalytics.recordSession(data.history, FCTimer.snapshot()); FCTimer.stopAndReset(); FCStorage.save(data); }
  function requestReset() { FCTimer.hasProgress() ? FCUI.showResetPrompt() : FCTimer.stopAndReset(); }

  $("panelA").addEventListener("click", () => FCTimer.switchTo(0, "side"));
  $("panelB").addEventListener("click", () => FCTimer.switchTo(1, "side"));
  $("plungerBtn").addEventListener("click", FCTimer.toggleSide);
  $("pauseBtn").addEventListener("click", FCTimer.togglePause);
  $("resetBtn").addEventListener("click", requestReset);
  $("analyticsBtn").addEventListener("click", () => FCUI.showSummary(false));
  $("settingsBtn").addEventListener("click", FCUI.openSettings);
  $("idlePermBtn").addEventListener("click", async () => FCUI.updateIdleStatus(await FCTimer.enableSystemIdle(true)));
  $("resetCancelBtn").addEventListener("click", () => FCUI.close("resetBackdrop"));
  $("resetNowBtn").addEventListener("click", () => { FCUI.close("resetBackdrop"); finishSession(); });
  $("resetSummaryBtn").addEventListener("click", () => { FCUI.close("resetBackdrop"); FCUI.showSummary(true); });
  $("summaryDoneBtn").addEventListener("click", e => { FCUI.close("summaryBackdrop"); if (e.currentTarget.dataset.reset === "true") finishSession(); });
  $("summaryReportsBtn").addEventListener("click", () => { FCUI.close("summaryBackdrop"); FCUI.openDashboard(); });
  $("closeDashboardBtn").addEventListener("click", () => FCUI.close("dashboardBackdrop"));
  $("cancelBtn").addEventListener("click", () => FCUI.close("settingsBackdrop"));
  document.querySelectorAll(".report-tab").forEach(button => button.addEventListener("click", () => FCUI.renderDashboard(button.dataset.tab)));

  $("saveBtn").addEventListener("click", () => {
    const durations = [FCUI.readDuration("A"), FCUI.readDuration("B")];
    if (!durations[0] && !durations[1]) return alert("At least one side needs a duration above zero.");
    if (FCTimer.hasProgress() && !confirm("Applying these settings completes and records the current session. Continue?")) return;
    if (FCTimer.hasProgress()) FCAnalytics.recordSession(data.history, FCTimer.snapshot());
    FCTimer.stopAndReset();
    data.state.sides.forEach((side, i) => { const x = i ? "B" : "A"; side.name = $("name" + x).value.trim() || (i ? "Other Time" : "My Time"); side.durationMs = side.remainingMs = durations[i]; });
    ["idleEnabled", "pauseEnabled", "notifEnabled", "soundEnabled", "wakeEnabled"].forEach(key => data.settings[key] = $(key).checked);
    data.settings.idleMinutes = Math.max(1, Math.min(60, parseInt($("idleMinutes").value, 10) || 3));
    FCStorage.save(data); FCUI.renderClock(); FCUI.close("settingsBackdrop"); FCTimer.requestWakeLock(); FCTimer.enableSystemIdle(false);
  });
  $("notifPermBtn").addEventListener("click", () => { if ("Notification" in window) Notification.requestPermission().then(FCUI.updateNotificationStatus); });

  document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.addEventListener("click", event => { if (event.target === backdrop && !["resetBackdrop", "summaryBackdrop"].includes(backdrop.id)) FCUI.close(backdrop.id); }));
  document.addEventListener("keydown", event => {
    if (document.querySelector(".modal-backdrop.open")) { if (event.key === "Escape") document.querySelectorAll(".modal-backdrop.open").forEach(x => x.classList.remove("open")); return; }
    if (event.code === "Space") { event.preventDefault(); FCTimer.toggleSide(); }
    else if (event.key === "1") FCTimer.switchTo(0);
    else if (event.key === "2") FCTimer.switchTo(1);
    else if (event.key.toLowerCase() === "r") requestReset();
    else if (event.key.toLowerCase() === "s") FCUI.openSettings();
    else if (event.key.toLowerCase() === "p") FCTimer.togglePause();
  });
  ["mousemove", "mousedown", "keydown", "touchstart", "wheel", "scroll"].forEach(name => document.addEventListener(name, FCTimer.registerActivity, { passive: true }));
})();
