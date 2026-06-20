# Productive Gambit ♟️

**A chess-clock inspired productivity analytics tool that tracks both focused work and time spent away from work to reveal your true productivity ratio.**

Most productivity applications answer one question:

> How much did you work today?

Productive Gambit answers a more useful one:

> How much of your time was actually productive?

Inspired by the concept of a chess clock, Productive Gambit uses a dual-timer system where only one side can run at a time:

* **Focused Work** – time intentionally spent working toward a goal.
* **Time Pass** – time spent distracted, idle, procrastinating, or away from focused work.

By tracking both sides simultaneously, Productive Gambit provides a realistic view of how efficiently time is being used throughout the day.

---

## Why Productive Gambit?

Traditional timers and Pomodoro applications only measure productive time.

If your goal is to complete four hours of focused work, most tools simply tell you when you reach that target.

What they don't tell you is:

* How long it actually took.
* How much time was lost to distractions.
* How productive your day really was.
* Whether your productivity is improving over time.

### Example

Goal:

```text
Focused Work Target: 4h
```

Session Results:

```text
Focused Work: 4h 00m
Time Pass:    1h 20m

Total Time:   5h 20m

Productivity Ratio: 75%
```

Instead of simply knowing that four hours of work were completed, you gain visibility into the hidden cost of achieving those four hours.

---

# Core Features

## ⏱️ Dual-Timer Productivity System

A productivity-focused implementation of a chess clock.

### Focused Work Side

Tracks intentional work time.

### Time Pass Side

Tracks distractions, breaks, inactivity, and non-productive time.

### Switching Methods

* Click to switch sides
* Space bar shortcut
* Keyboard shortcuts (1 / 2)
* Automatic switching through idle detection

### Additional Capabilities

* Real-time countdown display
* Custom side labels
* Custom time allocations
* Overtime tracking
* Active side highlighting
* Budget remaining indicators

---

## 🎯 Session Management

Designed for both short focus sessions and full-day tracking.

Features include:

* Start and pause controls
* Session reset functionality
* Optional session review before reset
* Persistent session state
* Automatic recovery after page refresh
* HH:MM:SS precision tracking

---

## 🛡️ Intelligent Idle Detection

Productive Gambit can automatically detect inactivity and attribute time appropriately.

### Local Idle Detection

Detects inactivity within the browser window.

### System-Wide Idle Detection

Can monitor user inactivity across the operating system on supported browsers.

### Configuration Options

* Adjustable timeout duration
* 1–60 minute inactivity thresholds
* Automatic side switching
* Accurate elapsed-time attribution

This helps reduce manual tracking effort and improves productivity accuracy.

---

## 🔔 Notifications & Alerts

Stay aware of budget expiration without constantly monitoring the screen.

Features:

* Browser notifications
* Distinct audio alerts
* Side-specific notification tones
* Accessibility announcements
* Configurable sound controls

Receive alerts when:

* A timer reaches zero
* Overtime begins
* Focus budgets are exhausted

---

# Productivity Analytics Dashboard

One of the primary goals of Productive Gambit is not merely time tracking, but productivity measurement.

---

## 📊 Session Summary

Each session generates a performance summary containing:

* Focused Work Time
* Time Pass Time
* Total Elapsed Time
* Productivity Ratio
* Focus Efficiency Rating

Visual progress indicators provide immediate feedback on session quality.

---

## 📈 Weekly Analytics

Analyze the previous seven days of productivity.

Includes:

* Daily productivity breakdown
* Focus time totals
* Time Pass totals
* Most productive day
* Least productive day
* Session counts
* Average productivity score

Visual performance bars help identify trends throughout the week.

---

## 📅 Monthly Analytics

Track longer-term productivity behavior.

Metrics include:

* Monthly focus totals
* Monthly distraction totals
* Average daily focus time
* Productivity averages
* Longest focus day
* Best-performing day
* Monthly performance trends

---

## 🔥 90-Day Productivity Heatmap

A GitHub-style productivity heatmap provides a visual overview of the previous three months.

Features:

* Productivity intensity visualization
* Daily performance scoring
* Historical trend tracking
* Hoverable statistics
* Responsive design

The heatmap quickly reveals productive streaks, consistency patterns, and periods of decline.

---

## 📉 Trend Analysis

Productive Gambit compares current performance against historical baselines.

### Weekly Comparisons

* This Week vs Last Week
* Productivity change %
* Focus time change %

### Monthly Comparisons

* This Month vs Last Month
* Average daily focus improvement
* Overall productivity growth

These comparisons help quantify progress rather than relying on intuition.

---

## 💡 Productivity Insights

The application generates rule-based insights using historical productivity data.

Examples:

* Productivity improvement trends
* Consistently productive weekdays
* Average daily focus duration
* Focus efficiency patterns
* Work habit observations

All insights are generated locally without transmitting data anywhere.

---

# ⌨️ Keyboard Shortcuts

| Shortcut | Action                |
| -------- | --------------------- |
| Space    | Switch sides          |
| 1        | Activate Focused Work |
| 2        | Activate Time Pass    |
| P        | Toggle Pause          |
| R        | Reset Session         |
| S        | Open Settings         |
| Esc      | Close Dialogs         |

Designed for uninterrupted keyboard-driven workflows.

---

# ⚙️ Advanced Configuration

Productive Gambit provides extensive customization options.

### Timer Configuration

* Hours
* Minutes
* Seconds

### Side Customization

Rename timer labels to fit personal workflows.

Examples:

* Focus / Distraction
* Work / Break
* Study / Leisure
* Coding / Browsing

### Additional Controls

* Pause button visibility
* Notification controls
* Sound controls
* Wake Lock support
* System-wide idle detection

---

# 💾 Privacy & Data Storage

Productive Gambit is completely local-first.

### No Account Required

No registration.

No login.

No cloud dependency.

### Local Storage

Data is stored directly in the browser:

* Settings
* Session history
* Analytics history
* Productivity records

Your productivity data remains on your device.

---

# 🌐 Accessibility

Accessibility is a first-class consideration.

Features include:

* ARIA labels
* Screen reader support
* Live announcements
* Semantic HTML
* Full keyboard navigation

---

# Technology Stack

Built entirely using:

* HTML5
* CSS3
* Vanilla JavaScript
* LocalStorage API

No frameworks.

No backend.

No database.

No third-party analytics.

No build tools.

Simply open the application and start tracking.

---

# Future Roadmap

Potential future enhancements:

* Data export (CSV/JSON)
* Multiple productivity profiles
* Advanced charts
* Custom themes
* Goal tracking
* Historical backups
* Optional cloud synchronization

---

# License

Released under the MIT License.
