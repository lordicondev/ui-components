// #region setup
import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon does.
defineElement();
// #endregion

// #region expanded
// The browser opens and closes the panel. The button's aria-expanded is kept in step, and
// the chevron follows it.
const panel = document.querySelector<HTMLElement>('#resources')!;
const trigger = document.querySelector<HTMLElement>('[popovertarget="resources"]')!;

panel.addEventListener('toggle', (event) => {
    trigger.setAttribute('aria-expanded', String(event.newState === 'open'));
});
// #endregion
