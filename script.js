/**
 * Date Range Picker
 * Fully English UI & Complete Figma Specification
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // Constants (English)
  // ==========================================
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const MONTH_NAMES_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // ==========================================
  // State Management
  // ==========================================
  const state = {
    // Left month on display (November 2026)
    leftYear: 2026,
    leftMonth: 10, // 0-indexed (10 = November)

    // Initial range selection: Nov 3 – Dec 10, 2026
    startDate: new Date(2026, 10, 3),
    endDate: new Date(2026, 11, 10),

    // Hover date for preview
    hoverDate: null,

    // Selecting state
    isSelecting: false,

    // Edit mode: null | 'start' | 'end' | 'new'
    editMode: null,

    // Edit origin tracking for click without cursor movement
    editOriginDate: null,
    originalStart: null,
    originalEnd: null,
    cursorMoved: false,

    // Open dropdown initially
    isOpen: true
  };

  // ==========================================
  // DOM Elements
  // ==========================================
  const inputTrigger = document.getElementById('input-trigger');
  const inputText = document.getElementById('input-text');
  const dropdown = document.getElementById('calendar-dropdown');
  const dualWrapper = document.getElementById('calendar-dual-wrapper');

  // ==========================================
  // Utility Functions
  // ==========================================
  const formatDateKey = (d) => {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Standard English Date Formatting
  const formatEnglishDate = (d, withYear = true) => {
    if (!d) return '';
    const m = MONTH_NAMES_SHORT[d.getMonth()];
    const day = d.getDate();
    return withYear ? `${m} ${day}, ${d.getFullYear()}` : `${m} ${day}`;
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isBefore = (d1, d2) => {
    const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
    const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
    return t1 < t2;
  };

  const isBetween = (target, start, end) => {
    if (!target || !start || !end) return false;
    const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    const min = Math.min(s, e);
    const max = Math.max(s, e);
    return t >= min && t <= max;
  };

  // Check if two dates are adjacent on the same row (no gap)
  const isAdjacentDays = (d1, d2) => {
    if (!d1 || !d2) return false;
    const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
    const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
    return (t2 - t1 === 86400000) && (d1.getDay() !== 6);
  };

  // ==========================================
  // Dropdown Open/Close
  // ==========================================
  const openDropdown = () => {
    state.isOpen = true;
    dropdown.classList.add('open');
    inputTrigger.classList.add('active');
    inputTrigger.setAttribute('aria-expanded', 'true');
    renderCalendars();
  };

  const closeDropdown = () => {
    state.isOpen = false;
    dropdown.classList.remove('open');
    inputTrigger.classList.remove('active');
    inputTrigger.setAttribute('aria-expanded', 'false');
    
    if (state.isSelecting) {
      state.isSelecting = false;
      state.editMode = null;
      state.editOriginDate = null;
      state.cursorMoved = false;
      state.hoverDate = null;
      renderCalendars();
    }
  };

  const toggleDropdown = () => {
    if (state.isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  // ==========================================
  // Calendar Rendering
  // ==========================================
  const renderCalendars = () => {
    dualWrapper.innerHTML = '';

    const monthsData = [
      { year: state.leftYear, month: state.leftMonth, isLeft: true },
      {
        year: state.leftMonth === 11 ? state.leftYear + 1 : state.leftYear,
        month: state.leftMonth === 11 ? 0 : state.leftMonth + 1,
        isLeft: false
      }
    ];

    monthsData.forEach((mData) => {
      const monthCol = document.createElement('div');
      monthCol.className = 'month-container';

      // Header row (< Month Year >)
      const headerRow = document.createElement('div');
      headerRow.className = 'month-header-row';

      if (mData.isLeft) {
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'calendar-nav-btn';
        prevBtn.title = 'Previous month';
        prevBtn.setAttribute('aria-label', 'Previous month');
        prevBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        `;
        prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          navigateMonth(-1);
        });
        headerRow.appendChild(prevBtn);
      } else {
        const spacer = document.createElement('div');
        spacer.className = 'nav-spacer';
        headerRow.appendChild(spacer);
      }

      const title = document.createElement('div');
      title.className = 'month-title';
      title.textContent = `${MONTH_NAMES[mData.month]} ${mData.year}`;
      headerRow.appendChild(title);

      if (!mData.isLeft) {
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'calendar-nav-btn';
        nextBtn.title = 'Next month';
        nextBtn.setAttribute('aria-label', 'Next month');
        nextBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        `;
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          navigateMonth(1);
        });
        headerRow.appendChild(nextBtn);
      } else {
        const spacer = document.createElement('div');
        spacer.className = 'nav-spacer';
        headerRow.appendChild(spacer);
      }

      monthCol.appendChild(headerRow);

      // Weekday Header (Su Mo Tu We Th Fr Sa)
      const weekGrid = document.createElement('div');
      weekGrid.className = 'weekdays-grid';
      WEEKDAYS.forEach(day => {
        const dEl = document.createElement('div');
        dEl.className = 'weekday-cell';
        dEl.textContent = day;
        weekGrid.appendChild(dEl);
      });
      monthCol.appendChild(weekGrid);

      // Days Grid
      const daysGrid = document.createElement('div');
      daysGrid.className = 'days-grid';

      const cells = getMonthGridCells(mData.year, mData.month);

      cells.forEach(cell => {
        const cellEl = createDayCellElement(cell);
        daysGrid.appendChild(cellEl);
      });

      monthCol.appendChild(daysGrid);
      dualWrapper.appendChild(monthCol);
    });

    updateHighlightClasses();
  };

  // Generate 35 or 42 slots per month grid
  const getMonthGridCells = (year, month) => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0(Sun) - 6(Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    // Trailing days of previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      cells.push({
        date: prevDate,
        dayNum: d,
        isCurrentMonth: false,
        isMonthStart: false,
        isMonthEnd: false,
        colIndex: (firstDayIndex - 1 - i) % 7
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(year, month, d);
      cells.push({
        date: curDate,
        dayNum: d,
        isCurrentMonth: true,
        isMonthStart: d === 1,
        isMonthEnd: d === daysInMonth,
        colIndex: (firstDayIndex + d - 1) % 7
      });
    }

    // Leading days of next month
    const totalSlots = cells.length > 35 ? 42 : 35;
    const nextDaysNeeded = totalSlots - cells.length;
    for (let d = 1; d <= nextDaysNeeded; d++) {
      const nextDate = new Date(year, month + 1, d);
      cells.push({
        date: nextDate,
        dayNum: d,
        isCurrentMonth: false,
        isMonthStart: false,
        isMonthEnd: false,
        colIndex: (cells.length) % 7
      });
    }

    return cells;
  };

  // Create single day cell element
  const createDayCellElement = (cell) => {
    const el = document.createElement('div');
    el.className = 'day-cell';
    el.dataset.date = formatDateKey(cell.date);
    el.dataset.currentMonth = cell.isCurrentMonth ? 'true' : 'false';

    if (!cell.isCurrentMonth) {
      el.classList.add('other-month');
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('tabindex', '-1');
    }

    if (cell.colIndex === 0) el.classList.add('col-first');
    if (cell.colIndex === 6) el.classList.add('col-last');
    if (cell.isMonthStart) el.classList.add('month-start-boundary');
    if (cell.isMonthEnd) el.classList.add('month-end-boundary');

    const inner = document.createElement('div');
    inner.className = 'day-inner';
    inner.textContent = cell.dayNum;
    el.appendChild(inner);

    // Only attach click/hover to current month days
    if (cell.isCurrentMonth) {
      el.addEventListener('mouseenter', () => handleCellHover(cell.date));
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        handleCellClick(cell.date);
      });
    }

    return el;
  };

  // ==========================================
  // Interaction Control
  // ==========================================
  const handleCellClick = (clickedDate) => {
    // State 1: Idle
    if (!state.isSelecting) {
      if (state.startDate && state.endDate) {
        // Re-edit start date
        if (isSameDay(clickedDate, state.startDate)) {
          state.isSelecting = true;
          state.editMode = 'start';
          state.editOriginDate = clickedDate;
          state.originalStart = state.startDate;
          state.originalEnd = state.endDate;
          state.cursorMoved = false;
          state.hoverDate = clickedDate;
          updateHighlightClasses();
          return;
        }

        // Re-edit end date
        if (isSameDay(clickedDate, state.endDate)) {
          state.isSelecting = true;
          state.editMode = 'end';
          state.editOriginDate = clickedDate;
          state.originalStart = state.startDate;
          state.originalEnd = state.endDate;
          state.cursorMoved = false;
          state.hoverDate = clickedDate;
          updateHighlightClasses();
          return;
        }
      }

      // Start new selection
      state.startDate = clickedDate;
      state.endDate = null;
      state.hoverDate = null;
      state.isSelecting = true;
      state.editMode = 'new';
      state.editOriginDate = null;
      state.cursorMoved = false;

      updateHighlightClasses();
      updateInputDisplay();
    }
    // State 2: Second click (Commit)
    else {
      if (state.editMode === 'start') {
        if (isSameDay(clickedDate, state.editOriginDate)) {
          if (!state.cursorMoved) {
            // Clicked without moving cursor -> Single date selection
            state.startDate = clickedDate;
            state.endDate = clickedDate;
          } else {
            // Moved cursor and returned -> Cancel edit, keep original range
            state.startDate = state.originalStart;
            state.endDate = state.originalEnd;
          }
        } else if (isSameDay(clickedDate, state.originalEnd)) {
          state.startDate = clickedDate;
          state.endDate = clickedDate;
        } else {
          let newStart = clickedDate;
          let finalEnd = state.originalEnd;

          if (isBefore(finalEnd, newStart)) {
            newStart = state.originalEnd;
            finalEnd = clickedDate;
          }

          state.startDate = newStart;
          state.endDate = finalEnd;
        }
      } else if (state.editMode === 'end') {
        if (isSameDay(clickedDate, state.editOriginDate)) {
          if (!state.cursorMoved) {
            // Clicked without moving cursor -> Single date selection
            state.startDate = clickedDate;
            state.endDate = clickedDate;
          } else {
            // Moved cursor and returned -> Cancel edit, keep original range
            state.startDate = state.originalStart;
            state.endDate = state.originalEnd;
          }
        } else if (isSameDay(clickedDate, state.originalStart)) {
          state.startDate = clickedDate;
          state.endDate = clickedDate;
        } else {
          let finalStart = state.originalStart;
          let newEnd = clickedDate;

          if (isBefore(newEnd, finalStart)) {
            finalStart = clickedDate;
            newEnd = state.originalStart;
          }

          state.startDate = finalStart;
          state.endDate = newEnd;
        }
      } else {
        // New range commit
        if (isSameDay(clickedDate, state.startDate)) {
          state.endDate = clickedDate;
        } else {
          let finalStart = state.startDate;
          let finalEnd = clickedDate;

          if (isBefore(clickedDate, state.startDate)) {
            finalStart = clickedDate;
            finalEnd = state.startDate;
          }

          state.startDate = finalStart;
          state.endDate = finalEnd;
        }
      }

      state.isSelecting = false;
      state.editMode = null;
      state.editOriginDate = null;
      state.cursorMoved = false;
      state.hoverDate = null;

      updateHighlightClasses();
      updateInputDisplay();

      // Smooth auto-close
      setTimeout(() => {
        closeDropdown();
      }, 250);
    }
  };

  const handleCellHover = (date) => {
    if (!state.isSelecting) return;

    if (state.editOriginDate && !isSameDay(date, state.editOriginDate)) {
      state.cursorMoved = true;
    }

    state.hoverDate = date;
    updateHighlightClasses();
  };

  // Update Highlight Classes
  const updateHighlightClasses = () => {
    const allCells = dualWrapper.querySelectorAll('.day-cell');
    
    let activeStart = state.startDate;
    let activeEnd = state.endDate;

    if (state.isSelecting && state.hoverDate) {
      if (state.editMode === 'start') {
        if (isSameDay(state.hoverDate, state.editOriginDate)) {
          // Keep range display until commit
          activeStart = state.originalStart;
          activeEnd = state.originalEnd;
        } else if (isSameDay(state.hoverDate, state.originalEnd)) {
          activeStart = state.hoverDate;
          activeEnd = state.hoverDate;
        } else if (state.originalEnd && isBefore(state.originalEnd, state.hoverDate)) {
          activeStart = state.originalEnd;
          activeEnd = state.hoverDate;
        } else {
          activeStart = state.hoverDate;
          activeEnd = state.originalEnd;
        }
      } else if (state.editMode === 'end') {
        if (isSameDay(state.hoverDate, state.editOriginDate)) {
          // Keep range display until commit
          activeStart = state.originalStart;
          activeEnd = state.originalEnd;
        } else if (isSameDay(state.hoverDate, state.originalStart)) {
          activeStart = state.hoverDate;
          activeEnd = state.hoverDate;
        } else if (state.originalStart && isBefore(state.hoverDate, state.originalStart)) {
          activeStart = state.hoverDate;
          activeEnd = state.originalStart;
        } else {
          activeStart = state.originalStart;
          activeEnd = state.hoverDate;
        }
      } else {
        if (isSameDay(state.hoverDate, state.startDate)) {
          activeStart = state.startDate;
          activeEnd = state.startDate;
        } else if (isBefore(state.hoverDate, state.startDate)) {
          activeStart = state.hoverDate;
          activeEnd = state.startDate;
        } else {
          activeStart = state.startDate;
          activeEnd = state.hoverDate;
        }
      }
    }

    // Check if exactly 2 consecutive days on the same row
    const isAdjacent = isAdjacentDays(activeStart, activeEnd);

    allCells.forEach(cell => {
      const cellDateKey = cell.dataset.date;
      const isCurrentMonth = cell.dataset.currentMonth === 'true';
      if (!cellDateKey) return;
      
      const parts = cellDateKey.split('-');
      const cellDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));

      cell.classList.remove(
        'in-range',
        'range-start',
        'range-end',
        'range-single',
        'range-hover-end',
        'editable-endpoint',
        'connected-start',
        'connected-end'
      );

      // Do not highlight disabled/other-month days
      if (!isCurrentMonth) return;
      if (!activeStart) return;

      const isStart = isSameDay(cellDate, activeStart);
      const isEnd = activeEnd && isSameDay(cellDate, activeEnd);

      if (isStart && !activeEnd) {
        cell.classList.add('range-single');
      } else if (isStart && isEnd) {
        cell.classList.add('range-single');
      } else if (isStart) {
        cell.classList.add('range-start');
        if (isAdjacent) {
          cell.classList.add('connected-start');
        }
      } else if (isEnd) {
        cell.classList.add('range-end');
        if (isAdjacent) {
          cell.classList.add('connected-end');
        }
      } else if (activeEnd && isBetween(cellDate, activeStart, activeEnd)) {
        cell.classList.add('in-range');
      }

      if (!state.isSelecting && state.startDate && state.endDate) {
        if (isSameDay(cellDate, state.startDate) || isSameDay(cellDate, state.endDate)) {
          cell.classList.add('editable-endpoint');
        }
      }

      if (state.isSelecting && state.hoverDate && isSameDay(cellDate, state.hoverDate)) {
        if (state.editMode === 'end' || state.editMode === 'new') {
          cell.classList.add('range-hover-end');
          if (isAdjacent) {
            cell.classList.add('connected-end');
          }
        }
      }
    });
  };

  const navigateMonth = (step) => {
    state.leftMonth += step;
    if (state.leftMonth < 0) {
      state.leftMonth = 11;
      state.leftYear -= 1;
    } else if (state.leftMonth > 11) {
      state.leftMonth = 0;
      state.leftYear += 1;
    }
    renderCalendars();
  };

  // English Input Form Formatting
  const updateInputDisplay = () => {
    if (state.startDate && state.endDate) {
      // Single day
      if (isSameDay(state.startDate, state.endDate)) {
        inputText.textContent = formatEnglishDate(state.startDate, true);
      }
      // Same month & same year: e.g. "Nov 3 – 10, 2026"
      else if (
        state.startDate.getFullYear() === state.endDate.getFullYear() &&
        state.startDate.getMonth() === state.endDate.getMonth()
      ) {
        const m = MONTH_NAMES_SHORT[state.startDate.getMonth()];
        const y = state.startDate.getFullYear();
        inputText.textContent = `${m} ${state.startDate.getDate()} – ${state.endDate.getDate()}, ${y}`;
      }
      // Same year, different month: e.g. "Nov 3 – Dec 10, 2026"
      else if (state.startDate.getFullYear() === state.endDate.getFullYear()) {
        const s = formatEnglishDate(state.startDate, false);
        const e = formatEnglishDate(state.endDate, false);
        inputText.textContent = `${s} – ${e}, ${state.startDate.getFullYear()}`;
      }
      // Different year: e.g. "Nov 3, 2026 – Jan 10, 2027"
      else {
        const s = formatEnglishDate(state.startDate, true);
        const e = formatEnglishDate(state.endDate, true);
        inputText.textContent = `${s} – ${e}`;
      }
    } else if (state.startDate) {
      inputText.textContent = `${formatEnglishDate(state.startDate, true)} –`;
    } else {
      inputText.textContent = 'Select date range';
    }
  };

  // ==========================================
  // Event Listeners
  // ==========================================
  inputTrigger.addEventListener('click', toggleDropdown);

  inputTrigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown();
    } else if (e.key === 'Escape' && state.isOpen) {
      e.preventDefault();
      closeDropdown();
    }
  });

  document.addEventListener('click', (e) => {
    if (!state.isOpen) return;
    const isInsideInput = inputTrigger.contains(e.target);
    const isInsideDropdown = dropdown.contains(e.target);

    if (!isInsideInput && !isInsideDropdown) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isOpen) {
      closeDropdown();
    }
  });

  // Initial Render
  renderCalendars();
  updateInputDisplay();
});
