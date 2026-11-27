/**
 * Date Range Picker — two-month calendar with range preview, endpoint re-editing
 * and keyboard navigation.
 */
(() => {
  const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const AUTO_CLOSE_MS = 250;

  const picker = document.querySelector('.picker');
  const trigger = picker.querySelector('.picker__trigger');
  const valueText = picker.querySelector('.picker__value');
  const panel = picker.querySelector('.picker__panel');

  // ---------------------------------------------------------------------------
  // Dates
  // ---------------------------------------------------------------------------

  const pad = (n) => String(n).padStart(2, '0');

  // "YYYY-MM-DD" keys sort chronologically, so ranges can be compared as strings.
  const toKey = (d) => (d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '');

  const fromKey = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const isSameDay = (a, b) => !!a && !!b && toKey(a) === toKey(b);

  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

  // Keeps the day of month, clamped to the target month's length.
  const addMonths = (d, n) => {
    const lastDay = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
    return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), lastDay));
  };

  const monthIndex = (d) => d.getFullYear() * 12 + d.getMonth();
  const monthStart = (index) => new Date(Math.floor(index / 12), index % 12, 1);

  const orderedRange = (a, b) => (toKey(a) <= toKey(b) ? { start: a, end: b } : { start: b, end: a });

  // Two consecutive days on the same calendar row render as one merged pill.
  const isConnected = ({ start, end }) =>
    !!start && !!end && isSameDay(addDays(start, 1), end) && start.getDay() !== 6 && start.getMonth() === end.getMonth();

  // ---------------------------------------------------------------------------
  // Formatting
  // ---------------------------------------------------------------------------

  const format = (d, options) => d.toLocaleDateString('en-US', options);
  const monthDay = (d) => format(d, { month: 'short', day: 'numeric' });

  // "Nov 3, 2026" · "Nov 3 – 10, 2026" · "Nov 3 – Dec 10, 2026" · "Nov 3, 2026 – Jan 10, 2027"
  const formatRange = ({ start, end }) => {
    if (!start) return 'Select date range';
    const year = start.getFullYear();
    if (!end) return `${monthDay(start)}, ${year} –`;
    if (isSameDay(start, end)) return `${monthDay(start)}, ${year}`;
    if (end.getFullYear() !== year) return `${monthDay(start)}, ${year} – ${monthDay(end)}, ${end.getFullYear()}`;
    if (end.getMonth() === start.getMonth()) return `${monthDay(start)} – ${end.getDate()}, ${year}`;
    return `${monthDay(start)} – ${monthDay(end)}, ${year}`;
  };

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const IDLE = {
    selecting: false,
    anchor: null,       // Fixed end of the range; the other end follows the pointer.
    editOrigin: null,   // Endpoint being re-edited, or null for a new range.
    savedRange: null,   // Restored when the selection is cancelled.
    pointerMoved: false,
    hoverDate: null
  };

  const state = {
    ...IDLE,
    isOpen: true,
    viewMonth: monthIndex(new Date(2026, 10, 1)), // Left-hand month.
    range: { start: new Date(2026, 10, 3), end: new Date(2026, 11, 10) },
    focusDate: null // Day that receives the single Tab stop.
  };

  let closeTimer = null;

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  const h = (tag, className, props = {}) => Object.assign(document.createElement(tag), { className, ...props });

  const NAV = {
    [-1]: { label: 'Previous month', points: '15 18 9 12 15 6' },
    [1]: { label: 'Next month', points: '9 18 15 12 9 6' }
  };

  const createNavButton = (step) => {
    const { label, points } = NAV[step];
    const button = h('button', 'month__nav', {
      type: 'button',
      title: label,
      ariaLabel: label,
      innerHTML: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="${points}"></polyline></svg>`
    });
    button.dataset.step = step;
    return button;
  };

  const createDay = (date, month, column) => {
    const label = h('span', 'day__label', { textContent: date.getDate() });

    if (date.getMonth() !== month) {
      const day = h('div', 'day day--outside', { ariaHidden: 'true' });
      day.append(label);
      return day;
    }

    const day = h('button', 'day', {
      type: 'button',
      tabIndex: -1,
      ariaLabel: format(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    });
    day.dataset.date = toKey(date);
    day.classList.toggle('day--edge-start', column === 0 || date.getDate() === 1);
    day.classList.toggle('day--edge-end', column === 6 || addDays(date, 1).getMonth() !== month);
    day.append(label);
    return day;
  };

  const createMonth = (index) => {
    const first = monthStart(index);
    const offset = first.getDay();
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const slots = offset + daysInMonth > 35 ? 42 : 35;

    const header = h('div', 'month__header');
    header.append(
      createNavButton(-1),
      h('h2', 'month__title', { textContent: format(first, { month: 'long', year: 'numeric' }) }),
      createNavButton(1)
    );

    const weekdays = h('div', 'month__weekdays');
    weekdays.append(...WEEKDAYS.map((name) => h('span', 'month__weekday', { textContent: name })));

    const days = h('div', 'month__days');
    days.append(...Array.from({ length: slots }, (_, i) =>
      createDay(addDays(first, i - offset), first.getMonth(), i % 7)
    ));

    const month = h('section', 'month');
    month.append(header, weekdays, days);
    return month;
  };

  const dayButtons = () => panel.querySelectorAll('.day[data-date]');

  // Hovering the endpoint being re-edited keeps the saved range on screen.
  const previewRange = (date) =>
    isSameDay(date, state.editOrigin) ? state.savedRange : orderedRange(state.anchor, date);

  const paintRange = () => {
    const range = state.selecting && state.hoverDate ? previewRange(state.hoverDate) : state.range;
    const startKey = toKey(range.start);
    const endKey = toKey(range.end) || startKey;
    const single = startKey === endKey;
    const connected = isConnected(range);
    const editable = !state.selecting && state.range.end ? [toKey(state.range.start), toKey(state.range.end)] : [];

    for (const day of dayButtons()) {
      const key = day.dataset.date;
      const isStart = key === startKey;
      const isEnd = key === endKey;
      day.classList.toggle('is-single', single && isStart);
      day.classList.toggle('is-start', !single && isStart);
      day.classList.toggle('is-end', !single && isEnd);
      day.classList.toggle('is-between', key > startKey && key < endKey);
      day.classList.toggle('is-connected', connected && (isStart || isEnd));
      day.classList.toggle('is-editable', editable.includes(key));
      day.ariaPressed = String(!!startKey && key >= startKey && key <= endKey);
    }
  };

  const isVisible = (d) => !!d && [0, 1].includes(monthIndex(d) - state.viewMonth);

  // Roving tabindex: only one day is reachable with Tab; arrow keys move within the grid.
  const updateTabStop = () => {
    const target = [state.focusDate, state.range.start].find(isVisible) ?? monthStart(state.viewMonth);
    const key = toKey(target);
    for (const day of dayButtons()) day.tabIndex = day.dataset.date === key ? 0 : -1;
  };

  const render = () => {
    panel.replaceChildren(createMonth(state.viewMonth), createMonth(state.viewMonth + 1));
    paintRange();
    updateTabStop();
  };

  const updateValue = () => {
    const text = formatRange(state.range);
    valueText.textContent = text;
    trigger.ariaLabel = `Date range: ${text}`;
  };

  const showMonth = (index) => {
    state.viewMonth = index;
    render();
  };

  // ---------------------------------------------------------------------------
  // Open / close
  // ---------------------------------------------------------------------------

  const setOpen = (isOpen) => {
    clearTimeout(closeTimer);
    state.isOpen = isOpen;
    panel.classList.toggle('is-open', isOpen);
    trigger.ariaExpanded = String(isOpen);
  };

  const open = (focusCalendar = false) => {
    setOpen(true);
    if (state.range.start) state.viewMonth = monthIndex(state.range.start);
    state.focusDate = null;
    render();
    if (focusCalendar) panel.querySelector('.day[tabindex="0"]')?.focus();
  };

  const close = () => {
    setOpen(false);
    if (state.selecting) commit(state.savedRange);
    if (panel.contains(document.activeElement)) trigger.focus();
  };

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  const beginSelection = (anchor, editOrigin = null) => {
    clearTimeout(closeTimer);
    Object.assign(state, {
      selecting: true,
      anchor,
      editOrigin,
      savedRange: state.range,
      pointerMoved: false,
      hoverDate: editOrigin
    });
  };

  const commit = (range) => {
    Object.assign(state, IDLE, { range });
    paintRange();
    updateValue();
  };

  const selectDate = (date) => {
    if (state.selecting) {
      // Clicking the edited endpoint again without moving away selects just that day.
      const single = isSameDay(date, state.editOrigin) && !state.pointerMoved;
      commit(single ? { start: date, end: date } : previewRange(date));
      closeTimer = setTimeout(close, AUTO_CLOSE_MS);
      return;
    }

    const { start, end } = state.range;
    if (end && isSameDay(date, start)) {
      beginSelection(end, date);
    } else if (end && isSameDay(date, end)) {
      beginSelection(start, date);
    } else {
      beginSelection(date);
      state.range = { start: date, end: null };
      updateValue();
    }
    paintRange();
  };

  const previewTo = (date) => {
    if (!state.selecting || isSameDay(date, state.hoverDate)) return;
    if (state.editOrigin && !isSameDay(date, state.editOrigin)) state.pointerMoved = true;
    state.hoverDate = date;
    paintRange();
  };

  const moveFocus = (date) => {
    state.focusDate = date;
    if (isVisible(date)) {
      updateTabStop();
    } else {
      const offset = monthIndex(date) - state.viewMonth;
      showMonth(state.viewMonth + (offset < 0 ? offset : offset - 1));
    }
    panel.querySelector(`[data-date="${toKey(date)}"]`)?.focus();
  };

  const navigate = (button) => {
    const { step } = button.dataset;
    const hadFocus = button === document.activeElement;
    state.focusDate = null;
    showMonth(state.viewMonth + Number(step));

    // The re-render replaced the button; hand focus to the visible one with the same step.
    if (hadFocus) {
      [...panel.querySelectorAll(`.month__nav[data-step="${step}"]`)]
        .find((b) => b.checkVisibility({ visibilityProperty: true }))
        ?.focus();
    }
  };

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  const KEY_MOVES = {
    ArrowLeft: (d) => addDays(d, -1),
    ArrowRight: (d) => addDays(d, 1),
    ArrowUp: (d) => addDays(d, -7),
    ArrowDown: (d) => addDays(d, 7),
    Home: (d) => addDays(d, -d.getDay()),
    End: (d) => addDays(d, 6 - d.getDay()),
    PageUp: (d) => addMonths(d, -1),
    PageDown: (d) => addMonths(d, 1)
  };

  const dayFrom = (e) => e.target.closest('.day[data-date]');

  panel.addEventListener('click', (e) => {
    const nav = e.target.closest('.month__nav');
    const day = dayFrom(e);
    if (nav) navigate(nav);
    else if (day) selectDate(fromKey(day.dataset.date));
  });

  panel.addEventListener('mouseover', (e) => {
    const day = dayFrom(e);
    if (day) previewTo(fromKey(day.dataset.date));
  });

  panel.addEventListener('mouseleave', () => {
    if (!state.selecting) return;
    state.hoverDate = state.editOrigin;
    paintRange();
  });

  panel.addEventListener('focusin', (e) => {
    const day = dayFrom(e);
    if (!day) return;
    const date = fromKey(day.dataset.date);
    state.focusDate = date;
    updateTabStop();
    previewTo(date);
  });

  panel.addEventListener('keydown', (e) => {
    const day = dayFrom(e);
    const move = KEY_MOVES[e.key];
    if (!day || !move) return;
    e.preventDefault();
    moveFocus(move(fromKey(day.dataset.date)));
  });

  // detail === 0 means the click came from the keyboard, so focus moves into the calendar.
  trigger.addEventListener('click', (e) => (state.isOpen ? close() : open(e.detail === 0)));

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && !state.isOpen) {
      e.preventDefault();
      open(true);
    }
  });

  // composedPath() still contains nodes that a re-render removed during this click.
  document.addEventListener('click', (e) => {
    if (state.isOpen && !e.composedPath().includes(picker)) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isOpen) {
      e.preventDefault();
      close();
    }
  });

  render();
  updateValue();
})();
