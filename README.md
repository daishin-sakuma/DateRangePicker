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
   - The range previews as the pointer moves; the second click commits it (and optionally closes the dropdown).
   - Clicking an endpoint re-edits it while the other end stays fixed.
   - Clicking the same endpoint again without moving away selects just that day; moving away and back cancels the edit.
   - Closing mid-selection (outside click, `Esc`, or the trigger) restores the previous range.
5. **Customizable** — light/dark theme, key color, open on hover, close on mouse leave, auto-close, 1 or 2 months, week start, and corner radius (see [Usage](#usage)); the demo page has a settings panel to try them live.
6. **Keyboard & Accessibility**
   - `Enter` / `Space` / `↓` on the trigger opens the calendar and focuses a day.
   - Arrow keys move by day/week, `Home` / `End` to the week edges, `PageUp` / `PageDown` by month.
   - `Esc` closes and returns focus to the trigger. Selected days expose `aria-pressed`.

---

## Usage

```html
<link rel="stylesheet" href="date-range-picker.css">
<div id="picker"></div>
<script src="date-range-picker.js"></script>
<script>
  const picker = createDateRangePicker(document.getElementById('picker'), {
    range: { start: new Date(2026, 10, 3), end: new Date(2026, 11, 10) },
    accentColor: '#2563eb',
    onChange: (range) => console.log(range)
  });

  picker.setOptions({ months: 1, weekStartsOn: 1 });
</script>
```

| Option | Default | Description |
| --- | --- | --- |
| `range` | `{ start: null, end: null }` | Initial range |
| `accentColor` | `null` | Any CSS color for the selection; `null` keeps it monochrome |
| `openOnHover` | `false` | Open the dropdown when the mouse moves onto the trigger |
| `closeOnLeave` | `false` | Close the dropdown when the mouse leaves the trigger and calendar |
| `autoClose` | `false` | Close the dropdown once a range is committed |
| `months` | `2` | Months shown side by side (`1` or `2`) |
| `weekStartsOn` | `0` | `0` = Sunday, `1` = Monday |
| `radius` | `8` | Corner radius in px; `20` or more makes days fully round |
| `showIcon` | `true` | Show the calendar icon at the left of the trigger |
| `theme` | `'auto'` | `'auto'` follows the OS light/dark setting; `'light'` or `'dark'` pins it |
| `onChange` | `() => {}` | Called with `{ start, end }` when a range is committed |

The returned object exposes `open()`, `close()`, `getRange()`, and `setOptions(options)`. `createDateRangePicker.defaults` holds the default options.

The demo's settings panel shows the matching `createDateRangePicker(...)` call (non-default options only) with a **Copy** button, so a configuration tried there can be pasted straight into an app.

---

## Project Structure

| File | Role |
| --- | --- |
| `date-range-picker.js` | The component: state, rendering, and interactions (no dependencies) |
| `date-range-picker.css` | Component styles; tokens are scoped to `.picker`, selection colors derive from `--accent` |
| `index.html`, `demo.js`, `demo.css` | Demo page with a settings panel driving `setOptions()` |

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
