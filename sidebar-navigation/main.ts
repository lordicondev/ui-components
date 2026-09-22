import { defineElement, Element } from '@lordicon/element';
import { booleanAttention } from '@shared/triggers/boolean-attention.ts';
import { HoverFocus } from '@shared/triggers/hover-focus.ts';

// Triggers have to be registered before defineElement().
// The list icons play on hover or focus. The search field's icons play on its own attributes.
Element.defineTrigger('hover-focus', HoverFocus);
Element.defineTrigger('focus-attention', booleanAttention('data-focused'));
Element.defineTrigger('clearable-attention', booleanAttention('data-clearable'));

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
