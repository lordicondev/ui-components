import { defineElement, Element } from '@lordicon/element';
import { booleanMorph } from '@shared/triggers/boolean-morph.ts';
import { PressAttention } from '@shared/triggers/press-attention.ts';

// Triggers have to be registered before defineElement().
// A tool is a state, so its icon morphs. An action is over at once, so its icon plays once.
Element.defineTrigger('selected-morph', booleanMorph('data-selected'));
Element.defineTrigger('press-attention', PressAttention);

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
