// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanAttention } from '@shared/triggers/boolean-attention.ts';
import { HoverFocus } from '@shared/triggers/hover-focus.ts';

// Ten icons and two kinds of answer. Everything in the list answers being reached — by a
// pointer or by the keyboard — and the field keeps the pair of triggers it was built with,
// because a field is not somewhere you hover, it is somewhere you are.
Element.defineTrigger('hover-focus', HoverFocus);
Element.defineTrigger('focus-attention', booleanAttention('data-focused'));
Element.defineTrigger('clearable-attention', booleanAttention('data-clearable'));

defineElement();
// #endregion

import { fields } from '@shared/ui/field.ts';

// #region navigate
const nav = document.querySelector<HTMLElement>('.nav')!;
const items = [...nav.querySelectorAll<HTMLAnchorElement>('.nav__item')];

// One listener for the whole list rather than one per link: which link was pressed is
// already in the event, and a list that grows a destination needs no second thought here.
nav.addEventListener('click', (event) => {
    const chosen = (event.target as Element).closest<HTMLAnchorElement>('.nav__item');
    if (!chosen) return;

    // These are real links and there is no page behind them, which is the one thing this
    // demo cannot be honest about. Everything else follows from the attribute below.
    event.preventDefault();

    for (const item of items) {
        // Removed rather than set to "false". `aria-current` is not a boolean: the links
        // that are not the current page simply do not carry it, and the stylesheet reads
        // the same attribute the screen reader does.
        if (item === chosen) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
    }
});
// #endregion

/*
 * The field is the search bar demo's, and now literally so: `fields()` writes the two
 * attributes its icons are watching — the settle timer that waits for the keyboard, and the
 * guard that does not call reaching for the clear button a departure. The reasoning behind
 * all of it is written up over there rather than repeated here.
 */
fields();
