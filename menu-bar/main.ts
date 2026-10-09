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

// Every button's name is the span inside it; tooltips() shows it on hover and focus.
tooltips();
