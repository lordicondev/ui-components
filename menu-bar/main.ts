import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
defineElement();

import { tooltips } from '@shared/ui/tooltip.ts';

const tools = [...document.querySelectorAll<HTMLElement>('.tool')];

// A radio's `checked` is a property, and a MutationObserver cannot watch a property. So
// the group's choice is copied onto each label as data-selected, which the icon and the
// stylesheet read. `change` fires for a click and for an arrow key alike.
function follow(): void {
    for (const tool of tools) {
        const input = tool.querySelector<HTMLInputElement>('.tool__input')!;
        tool.dataset.selected = String(input.checked);
    }
}

document.querySelector('.menu-bar__tools')!.addEventListener('change', follow);

const lists = [...document.querySelectorAll<HTMLButtonElement>('.list')];

// A paragraph is one kind of list or none: pressing one releases the other, and pressing
// it again releases it. aria-pressed is an attribute, so the icons follow it as it is.
for (const list of lists) {
    list.addEventListener('click', () => {
        const on = list.getAttribute('aria-pressed') !== 'true';
        for (const other of lists) other.setAttribute('aria-pressed', String(other === list && on));
    });
}

// Every button's name is the span inside it; tooltips() shows it on hover and focus.
tooltips();
