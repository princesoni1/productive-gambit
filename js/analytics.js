(function (global) {
  "use strict";

  const DAY = 86400000;
  const dateKey = date => {
    const d = new Date(date);
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  };
  const ratio = item => {
    const total = (item.focusSeconds || 0) + (item.timePassSeconds || 0);
    return total ? item.focusSeconds / total : 0;
  };

  function sessionSummary(session) {
    const focusSeconds = Math.round((session.focusMs || 0) / 1000);
    const timePassSeconds = Math.round((session.timePassMs || 0) / 1000);
    const productivity = ratio({ focusSeconds, timePassSeconds });
    return { focusSeconds, timePassSeconds, totalSeconds: focusSeconds + timePassSeconds, productivity, rating: rating(productivity) };
  }

  function rating(value) {
    if (value >= .9) return "Excellent";
    if (value >= .75) return "Strong";
    if (value >= .5) return "Moderate";
    return "Needs Improvement";
  }

  function recordSession(history, session, when) {
    const summary = sessionSummary(session);
    if (!summary.totalSeconds) return false;
    const key = dateKey(when || new Date());
    const day = history[key] || { focusSeconds: 0, timePassSeconds: 0, sessions: 0 };
    day.focusSeconds += summary.focusSeconds;
    day.timePassSeconds += summary.timePassSeconds;
    day.sessions += 1;
    history[key] = day;
    return true;
  }

  function range(history, start, days) {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = dateKey(date);
      return { key, date, ...(history[key] || { focusSeconds: 0, timePassSeconds: 0, sessions: 0 }) };
    });
  }

  function summarize(days) {
    const focusSeconds = days.reduce((n, d) => n + d.focusSeconds, 0);
    const timePassSeconds = days.reduce((n, d) => n + d.timePassSeconds, 0);
    const sessions = days.reduce((n, d) => n + d.sessions, 0);
    const active = days.filter(d => d.focusSeconds + d.timePassSeconds > 0);
    const sorted = active.slice().sort((a, b) => ratio(b) - ratio(a));
    const longest = active.slice().sort((a, b) => b.focusSeconds - a.focusSeconds)[0] || null;
    return {
      days, focusSeconds, timePassSeconds, sessions,
      productivity: ratio({ focusSeconds, timePassSeconds }),
      averageDailyFocus: active.length ? focusSeconds / active.length : 0,
      most: sorted[0] || null,
      least: sorted[sorted.length - 1] || null,
      longest
    };
  }

  function week(history, offset) {
    const now = new Date();
    const mondayOffset = (now.getDay() + 6) % 7;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset + (offset || 0) * 7);
    return summarize(range(history, start, 7));
  }

  function month(history, offset) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + (offset || 0), 1);
    const count = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    const result = summarize(range(history, start, count));
    result.label = start.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    return result;
  }

  function heatmap(history) {
    const today = new Date();
    return range(history, new Date(today.getFullYear(), today.getMonth(), today.getDate() - 89), 90);
  }

  function change(current, previous) { return current - previous; }
  function trends(history) {
    const thisWeek = week(history, 0), lastWeek = week(history, -1);
    const thisMonth = month(history, 0), lastMonth = month(history, -1);
    return {
      weekProductivity: change(thisWeek.productivity, lastWeek.productivity),
      weekFocus: change(thisWeek.averageDailyFocus, lastWeek.averageDailyFocus),
      monthProductivity: change(thisMonth.productivity, lastMonth.productivity),
      monthFocus: change(thisMonth.averageDailyFocus, lastMonth.averageDailyFocus),
      thisWeek, lastWeek, thisMonth, lastMonth
    };
  }

  function insights(history) {
    const list = [], t = trends(history), current = month(history, 0);
    if (t.thisWeek.sessions && t.lastWeek.sessions) {
      list.push(t.weekProductivity >= 0 ? "Your productivity is improving compared with last week." : "Your productivity ratio is lower than last week; a smaller focused block may help rebuild momentum.");
    }
    const weekdays = Array.from({ length: 7 }, () => ({ focusSeconds: 0, timePassSeconds: 0, count: 0 }));
    Object.keys(history).forEach(key => {
      const d = history[key], i = new Date(key + "T12:00:00").getDay();
      if (d.focusSeconds + d.timePassSeconds) { weekdays[i].focusSeconds += d.focusSeconds; weekdays[i].timePassSeconds += d.timePassSeconds; weekdays[i].count++; }
    });
    const ranked = weekdays.map((d, i) => ({ ...d, i, value: ratio(d) })).filter(d => d.count).sort((a, b) => b.value - a.value);
    if (ranked.length) list.push(new Date(2024, 0, 7 + ranked[0].i).toLocaleDateString(undefined, { weekday: "long" }) + " is consistently your most productive day.");
    if (current.averageDailyFocus) list.push("You average " + (current.averageDailyFocus / 3600).toFixed(1) + " hours of focused work per active day this month.");
    if (!list.length) list.push("Complete a session to begin building your personal productivity patterns.");
    return list.slice(0, 3);
  }

  global.FCAnalytics = { dateKey, ratio, rating, sessionSummary, recordSession, week, month, heatmap, trends, insights };
})(window);
