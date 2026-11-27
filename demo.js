const form = document.querySelector('.settings');
const code = form.querySelector('.code code');
const copyButton = form.querySelector('[data-copy]');

const readSettings = () => {
  const { elements } = form;
  const accent = elements.accent.value;
  return {
    accentColor: accent === 'custom' ? elements.customColor.value : accent || null,
    openOnHover: elements.openOnHover.value === 'true',
    closeOnLeave: elements.closeOnLeave.checked,
    autoClose: elements.autoClose.checked,
    months: Number(elements.months.value),
    weekStartsOn: Number(elements.weekStartsOn.value),
    radius: Number(elements.radius.value),
    theme: elements.theme.value,
    showIcon: elements.showIcon.checked
  };
};

// Only options that differ from the defaults, ready to paste into an app.
const toSnippet = (settings) => {
  const lines = Object.entries(settings)
    .filter(([key, value]) => value !== createDateRangePicker.defaults[key])
    .map(([key, value]) => `  ${key}: ${typeof value === 'string' ? `'${value}'` : value}`);
  return lines.length
    ? `createDateRangePicker(element, {\n${lines.join(',\n')}\n});`
    : 'createDateRangePicker(element);';
};

const applySettings = () => {
  const settings = readSettings();
  const { radius } = form.elements;
  form.elements.radiusValue.value = radius.value === radius.max ? 'Full' : `${radius.value}px`;
  // The demo page follows the picker's theme so the preview matches.
  document.documentElement.style.colorScheme = settings.theme === 'auto' ? '' : settings.theme;
  code.textContent = toSnippet(settings);
  return settings;
};

const picker = createDateRangePicker(document.getElementById('picker'), {
  range: { start: new Date(2026, 10, 3), end: new Date(2026, 11, 10) },
  ...applySettings()
});
picker.open();

form.addEventListener('input', (e) => {
  if (e.target.name === 'customColor') form.elements.accent.value = 'custom';
  picker.setOptions(applySettings());
});

// The reset event fires before the fields change, so apply the defaults on the next tick.
form.addEventListener('reset', () => setTimeout(() => picker.setOptions(applySettings())));

let copiedTimer = null;

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(code.textContent);
  } catch {
    getSelection().selectAllChildren(code); // Fall back to letting the user copy the selection.
    return;
  }
  clearTimeout(copiedTimer);
  copyButton.classList.add('is-copied');
  copyButton.ariaLabel = 'Copied';
  copiedTimer = setTimeout(() => {
    copyButton.classList.remove('is-copied');
    copyButton.ariaLabel = 'Copy code';
  }, 1500);
});

// Keep the calendar open while adjusting settings so changes are visible right away.
form.addEventListener('click', (e) => e.stopPropagation());
