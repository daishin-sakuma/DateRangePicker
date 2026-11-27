# Date Range Picker

A clean, production-grade 2-month Date Range Picker UI prototype matching the exact Figma specifications.

## Key Features

1. **Dual Month Continuous Display**:
   - Two consecutive months rendered side-by-side (`November 2026` & `December 2026`).
   - Seamless month navigation via `<` and `>` chevrons.
2. **Refined English Formatting**:
   - Weekdays header: `Su  Mo  Tu  We  Th  Fr  Sa`
   - Month headers: `November 2026`, `December 2026`
   - Input trigger display: `Nov 3 – Dec 10, 2026` (or `Nov 3, 2026` for single day selection, `Nov 3 – 4, 2026` for consecutive days in the same month).
3. **Seamless Range & Endpoint Styling**:
   - Row-level capsule pills (`#e8e7f7`) for highlighted ranges.
   - Distinct rounded endpoint styling (`#d4d4f0`) with subtle outline stroke (`#c4c0e1`).
   - **Consecutive 2-day selection**: automatically joins two adjacent cells into a single unified pill.
4. **Re-edit Interaction UX**:
   - Clicking an already selected start/end date initiates re-editing.
   - Clicking the same date again without moving the cursor confirms as a single-day selection.
   - If the cursor is moved away and then brought back to the original date, it recognizes cancellation (keeps original range).
   - Keeps the active range display intact until the second click.
   - Other-month (disabled) days are non-interactive and excluded from selection highlights.
5. **Auto-close on Second Click**:
   - Confirms selection and automatically collapses the dropdown on the second click.

## How to Run

Open directly in your default browser:
```bash
open index.html
```

Or serve locally with Python:
```bash
python3 -m http.server 8080
```
Open `http://localhost:8080` in your browser.
