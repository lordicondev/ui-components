import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
defineElement();

import { fields } from '@shared/ui/field.ts';

const nav = document.querySelector<HTMLElement>('.nav')!;
const items = [...nav.querySelectorAll<HTMLAnchorElement>('.nav__item')];

// One listener for the list. The clicked link is in the event.
nav.addEventListener('click', (event) => {
    const chosen = (event.target as Element).closest<HTMLAnchorElement>('.nav__item');
    if (!chosen) return;

    // Real links with no pages behind them.
    event.preventDefault();

    // aria-current is not a boolean: the other links do not carry it at all.
    for (const item of items) {
        if (item === chosen) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
    }
});

// The search field is the search bar demo's; fields() writes its two attributes.
fields();
