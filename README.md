# Productive Gambit ♟️

A local-first productivity tracker inspired by a chess clock.

Unlike traditional focus timers that only measure productive time, Productive Gambit tracks **both focused work and time spent away from work**, giving you a more accurate picture of how efficiently you use your time.

The application runs entirely in the browser using HTML, CSS, and vanilla JavaScript. No account, backend, or third-party services are required.

---

## Why?

Most productivity tools answer one question:

> How much work did you complete?

Productive Gambit answers another:

> How much of your available time was actually productive?

By tracking both productive and non-productive time, you can measure efficiency instead of simply accumulating focus hours.

Example session:

```text
Focused Work: 4h 00m
Time Pass:    1h 20m

Total Time:   5h 20m
Productivity: 75%
```

Instead of knowing only that you completed four hours of work, you also see how much time it actually required.

---

# Features

## Dual-Timer Productivity Tracking

A chess-clock style timer where only one side runs at a time.

* Focused Work timer
* Time Pass timer
* One-click switching
* Spacebar and keyboard shortcuts
* Automatic idle detection
* Custom timer labels
* Custom time allocations
* Overtime tracking
* Active side highlighting

---

## Session Management

* Start, pause, and reset sessions
* Automatic session recovery after refresh
* Persistent timer state
* HH:MM:SS precision
* Optional session review before reset

---

## Idle Detection

Automatically attributes inactive time to the appropriate timer.

* Browser inactivity detection
* Optional system-wide idle detection (supported browsers)
* Configurable timeout (1–60 minutes)
* Automatic timer switching

---

## Notifications

* Browser notifications
* Audio alerts
* Overtime notifications
* Focus budget expiration alerts
* Accessibility announcements

---

# Analytics

## Session Summary

Each completed session includes:

* Focus time
* Time Pass
* Total elapsed time
* Productivity ratio
* Focus efficiency rating

---

## Weekly Analytics

* Daily productivity
* Focus totals
* Time Pass totals
* Session count
* Best and worst days
* Average productivity

---

## Monthly Analytics

* Monthly focus totals
* Monthly distraction totals
* Average daily focus
* Productivity averages
* Long-term trends

---

## 90-Day Heatmap

A GitHub-style heatmap visualizes daily productivity over the previous three months.

* Productivity intensity
* Historical trends
* Hoverable daily statistics
* Responsive layout

---

## Trend Analysis

Compare current performance with previous periods.

* This week vs last week
* This month vs last month
* Focus time changes
* Productivity improvements

---

## Productivity Insights

Generates simple local insights from historical data, including:

* Productivity trends
* Most productive weekdays
* Average focus duration
* Focus efficiency patterns
* Consistency observations

All analytics are calculated locally.

---

# Keyboard Shortcuts

| Key   | Action        |
| ----- | ------------- |
| Space | Switch timers |
| 1     | Focused Work  |
| 2     | Time Pass     |
| P     | Pause         |
| R     | Reset session |
| S     | Open settings |
| Esc   | Close dialogs |

---

# Customization

Configure:

* Timer durations
* Side names
* Notification settings
* Sound effects
* Wake Lock support
* Idle detection
* Pause controls

Example timer labels:

* Focus / Distraction
* Work / Break
* Study / Leisure
* Coding / Browsing

---

# Privacy

Productive Gambit is completely local-first.

* No accounts
* No login
* No backend
* No analytics
* No cloud dependency

All settings, session history, and productivity data are stored locally in your browser.

---

# Accessibility

* Full keyboard navigation
* Semantic HTML
* ARIA labels
* Screen reader support
* Live announcements

---

# Technology Stack

* HTML5
* CSS3
* Vanilla JavaScript
* LocalStorage API

No frameworks. No build tools. No dependencies.

---

# Roadmap

Planned features include:

* CSV/JSON export
* Multiple productivity profiles
* Additional charts
* Custom themes
* Goal tracking
* Backup and restore
* Optional cloud sync

---

# License

Released under the MIT License.
