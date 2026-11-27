const picker = createDateRangePicker(document.getElementById('picker'), {
  range: { start: new Date(2026, 10, 3), end: new Date(2026, 11, 10) }
});
picker.open();

const form = document.querySelector('.settings');

const readSettings = () => {
  const accent = form.elements.accent.value;
  return {
    accentColor: accent === 'custom' ? form.elements.customColor.value : accent || null,
    autoClose: form.elements.autoClose.checked,
    months: Number(form.elements.months.value),
    weekStartsOn: Number(form.elements.weekStartsOn.value),
    radius: Number(form.elements.radius.value)
  };
};

form.addEventListener('input', (e) => {
  if (e.target.name === 'customColor') form.elements.accent.value = 'custom';
  form.elements.radiusValue.value = `${form.elements.radius.value}px`;
  picker.setOptions(readSettings());
});

// Keep the calendar open while adjusting settings so changes are visible right away.
form.addEventListener('click', (e) => e.stopPropagation());
