// #region setup
import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
defineElement();
// #endregion

// #region wiring
const button = document.querySelector<HTMLButtonElement>('.bookmark')!;
const toast = document.querySelector<HTMLElement>('.toast')!;

/** How long the toast stays after saving. */
const SHOWN_MS = 2000;

let hiding: ReturnType<typeof setTimeout> | undefined;

// Saving shows the toast and starts its timer again; unsaving hides it at once.
button.addEventListener('click', () => {
    const saved = button.getAttribute('aria-pressed') !== 'true';

    button.setAttribute('aria-pressed', String(saved)); // the bookmark follows on its own
    toast.dataset.shown = String(saved);

    clearTimeout(hiding);
    if (saved) hiding = setTimeout(() => (toast.dataset.shown = 'false'), SHOWN_MS);
});
// #endregion
