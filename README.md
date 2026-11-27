# Date Range Picker

A clean, production-grade 2-month Date Range Picker UI prototype matching the exact Figma specifications.

🔗 **Live Demo:** [https://daishin-sakuma.github.io/DateRangePicker/](https://daishin-sakuma.github.io/DateRangePicker/)

---

## Key Features

1. **Dual Month Display**
   - Two consecutive months side by side, navigated with `<` and `>`.
   - On narrow screens the months stack vertically with both arrows on the top month.
2. **English Formatting**
   - Weekdays: `Su Mo Tu We Th Fr Sa` · Month headers: `November 2026`
   - Trigger: `Nov 3 – Dec 10, 2026`, `Nov 3 – 10, 2026`, `Nov 3, 2026`, or `Dec 30, 2026 – Jan 2, 2027`.
3. **Range Styling**
   - Row-level rounded bands for the range, outlined pills for the endpoints.
   - Two adjacent days merge into a single pill.
4. **Selection & Re-editing**
   - The range previews as the pointer moves; the second click commits and closes the dropdown.
   - Clicking an endpoint re-edits it while the other end stays fixed.
   - Clicking the same endpoint again without moving away selects just that day; moving away and back cancels the edit.
   - Closing mid-selection (outside click, `Esc`, or the trigger) restores the previous range.
5. **Keyboard & Accessibility**
   - `Enter` / `Space` / `↓` on the trigger opens the calendar and focuses a day.
   - Arrow keys move by day/week, `Home` / `End` to the week edges, `PageUp` / `PageDown` by month.
   - `Esc` closes and returns focus to the trigger. Selected days expose `aria-pressed`.

---

## Project Structure

| File | Role |
| --- | --- |
| `index.html` | Trigger button and empty panel |
| `script.js` | State, rendering, and interactions (no dependencies) |
| `style.css` | Design tokens on `:root`, BEM-style classes (`.picker__*`, `.month__*`, `.day`) with `is-*` states |

---

## How to Run Locally

Open directly in your browser:
```bash
open index.html
```

Or serve locally with Python:
```bash
python3 -m http.server 8080
```
Open `http://localhost:8080` in your browser.
