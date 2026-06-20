(function (global) {
  "use strict";

  let data;
  const $ = id => document.getElementById(id);
  const formatClock = ms => {
    const negative = ms < 0, seconds = Math.floor(Math.abs(Math.round(ms / 1000)));
    const pad = n => String(n).padStart(2, "0");
    return (negative ? "+" : "") + pad(Math.floor(seconds / 3600)) + ":" + pad(Math.floor(seconds % 3600 / 60)) + ":" + pad(seconds % 60);
  };
  const formatDuration = seconds => {
    seconds = Math.max(0, Math.round(seconds || 0));
    const h = Math.floor(seconds / 3600), m = Math.floor(seconds % 3600 / 60), s = seconds % 60;
    if (h) return h + "h " + m + "m";
    if (m) return m + "m " + s + "s";
    return s + "s";
  };
  const percent = value => Math.round((value || 0) * 100) + "%";
  const dayName = day => day ? day.date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "—";

  function init(appData) { data = appData; }

  function renderClock() {
    const s = data.state;
    s.sides.forEach((side, i) => {
      const suffix = i ? "B" : "A", active = s.activeIndex === i;
      $("label" + suffix).textContent = side.name;
      $("time" + suffix).textContent = formatClock(side.remainingMs);
      $("budget" + suffix).textContent = "of " + formatClock(side.durationMs).replace(/^00:/, "");
      $("panel" + suffix).classList.toggle("active", active);
      $("panel" + suffix).classList.toggle("running", active && s.running);
      $("panel" + suffix).classList.toggle("over", side.remainingMs <= 0);
      $("panel" + suffix).setAttribute("aria-pressed", String(active));
    });
    $("plungerBtn").classList.toggle("is-running", s.running);
    $("hintText").textContent = s.activeIndex === null ? "tap a side to begin" : s.running ? "tap here or press space to switch sides" : "paused · press p to resume";
    $("pauseBtn").classList.toggle("hidden", !data.settings.pauseEnabled);
    $("pauseBtn").setAttribute("aria-label", s.running ? "Pause" : "Resume");
    $("pauseBtnIcon").innerHTML = s.running ? '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>' : '<path d="M8 5v14l11-7z"/>';
    document.title = s.activeIndex === null ? "Focus Clock" : formatClock(s.sides[s.activeIndex].remainingMs) + " · " + s.sides[s.activeIndex].name + " — Focus Clock";
  }

  function open(id) { $(id).classList.add("open"); }
  function close(id) { $(id).classList.remove("open"); }
  function announce(message) { $("liveRegion").textContent = message; }

  function showSummary(returnToReset) {
    const summary = FCAnalytics.sessionSummary(FCTimer.snapshot());
    $("summaryFocus").textContent = formatDuration(summary.focusSeconds);
    $("summaryPass").textContent = formatDuration(summary.timePassSeconds);
    $("summaryTotal").textContent = formatDuration(summary.totalSeconds);
    $("summaryRatio").textContent = percent(summary.productivity);
    $("summaryRating").textContent = summary.totalSeconds ? summary.rating : "No activity yet";
    $("summaryBar").style.width = percent(summary.productivity);
    $("summaryDoneBtn").dataset.reset = returnToReset ? "true" : "false";
    open("summaryBackdrop");
  }

  function showResetPrompt() { open("resetBackdrop"); }

  function metric(label, value) { return '<div class="metric"><span>' + label + '</span><strong>' + value + '</strong></div>'; }
  function reportSummary(report, monthly) {
    return metric("Focused Work", formatDuration(report.focusSeconds)) + metric("Time Pass", formatDuration(report.timePassSeconds)) +
      metric("Average Productivity", percent(report.productivity)) + metric("Sessions", report.sessions) +
      (monthly ? metric("Average Daily Focus", formatDuration(report.averageDailyFocus)) + metric("Longest Focus Day", dayName(report.longest)) : "") +
      metric("Most Productive", dayName(report.most)) + metric("Least Productive", dayName(report.least));
  }

  function bars(days, monthly) {
    return '<div class="bar-chart ' + (monthly ? "monthly" : "") + '">' + days.map(day => {
      const value = FCAnalytics.ratio(day), label = monthly ? day.date.getDate() : day.date.toLocaleDateString(undefined, { weekday: "short" });
      return '<div class="bar-item" title="' + day.key + ': ' + percent(value) + '"><div class="bar-track"><i style="height:' + Math.max(day.sessions ? value * 100 : 2, 2) + '%"></i></div><small>' + label + '</small></div>';
    }).join("") + "</div>";
  }

  function renderDashboard(tab) {
    tab = tab || "weekly";
    document.querySelectorAll(".report-tab").forEach(button => button.classList.toggle("active", button.dataset.tab === tab));
    const body = $("reportBody");
    if (tab === "weekly") {
      const report = FCAnalytics.week(data.history, 0);
      body.innerHTML = '<h3>This Week</h3><div class="metric-grid">' + reportSummary(report, false) + '</div><h4>Seven-day productivity</h4>' + bars(report.days, false);
    } else if (tab === "monthly") {
      const report = FCAnalytics.month(data.history, 0);
      body.innerHTML = '<h3>' + report.label + '</h3><div class="metric-grid">' + reportSummary(report, true) + '</div><h4>Monthly Productivity Trend</h4>' + bars(report.days, true);
    } else if (tab === "heatmap") {
      const days = FCAnalytics.heatmap(data.history);
      body.innerHTML = '<h3>Last 90 Days</h3><div class="heatmap">' + days.map(day => {
        const value = FCAnalytics.ratio(day), level = day.sessions ? Math.min(4, Math.ceil(value * 4)) : 0;
        return '<i class="heat level-' + level + '" tabindex="0"><span><b>' + day.date.toLocaleDateString() + '</b>Focus: ' + formatDuration(day.focusSeconds) + '<br>Time Pass: ' + formatDuration(day.timePassSeconds) + '<br>Productivity: ' + percent(value) + '</span></i>';
      }).join("") + '</div><div class="legend">Less <i class="level-0"></i><i class="level-1"></i><i class="level-2"></i><i class="level-3"></i><i class="level-4"></i> More</div>';
    } else {
      const t = FCAnalytics.trends(data.history), signedPct = n => (n >= 0 ? "+" : "") + Math.round(n * 100) + "%", signedTime = n => (n >= 0 ? "+" : "−") + formatDuration(Math.abs(n));
      body.innerHTML = '<h3>Trend Analysis</h3><div class="trend-card"><h4>This Week vs Last Week</h4>' + metric("Average Productivity", percent(t.lastWeek.productivity) + " → " + percent(t.thisWeek.productivity)) + metric("Productivity Change", signedPct(t.weekProductivity)) + metric("Average Focus Change", signedTime(t.weekFocus)) + '</div><div class="trend-card"><h4>This Month vs Last Month</h4>' + metric("Productivity Improvement", signedPct(t.monthProductivity)) + metric("Focus Time Improvement", signedTime(t.monthFocus)) + '</div><h4>Productivity Insights</h4><ul class="insights">' + FCAnalytics.insights(data.history).map(text => "<li>" + text + "</li>").join("") + "</ul>";
    }
  }

  function openDashboard() { renderDashboard("weekly"); open("dashboardBackdrop"); }

  function openSettings() {
    data.state.sides.forEach((side, i) => { const x = i ? "B" : "A", seconds = Math.floor(side.durationMs / 1000); $("name" + x).value = side.name; $("h" + x).value = Math.floor(seconds / 3600); $("m" + x).value = Math.floor(seconds % 3600 / 60); $("s" + x).value = seconds % 60; });
    ["idleEnabled", "pauseEnabled", "notifEnabled", "soundEnabled", "wakeEnabled"].forEach(key => $(key).checked = data.settings[key]);
    $("idleMinutes").value = data.settings.idleMinutes;
    updateNotificationStatus(); updateIdleStatus(); open("settingsBackdrop");
  }
  function readDuration(x) { return ((parseInt($("h" + x).value, 10) || 0) * 3600 + (parseInt($("m" + x).value, 10) || 0) * 60 + (parseInt($("s" + x).value, 10) || 0)) * 1000; }
  function updateNotificationStatus() { $("notifStatus").textContent = !("Notification" in window) ? "Notifications are not supported here." : Notification.permission === "granted" ? "Permission granted." : Notification.permission === "denied" ? "Permission blocked in browser settings." : "Permission not yet requested."; }
  function updateIdleStatus(status) {
    status = status || FCTimer.systemIdleStatus();
    const messages = {
      active: "System-wide detection is active, including while you work in other apps.",
      starting: "System-wide detection is starting.",
      denied: "Permission was not granted. Local detection will be used while this page is visible.",
      "permission-needed": "Grant permission to detect inactivity across apps.",
      unsupported: "System-wide detection is unavailable here. On GitHub Pages, use a Chromium-based browser; hidden-tab time will not be treated as idle."
    };
    $("idleStatus").textContent = messages[status] || messages.unsupported;
    $("idlePermBtn").disabled = status === "active" || status === "unsupported";
  }

  global.FCUI = { init, renderClock, open, close, announce, showSummary, showResetPrompt, openDashboard, renderDashboard, openSettings, readDuration, updateNotificationStatus, updateIdleStatus, formatDuration };
})(window);
