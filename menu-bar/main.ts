// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanMorph } from '@shared/triggers/boolean-morph.ts';
import { PressAttention } from '@shared/triggers/press-attention.ts';
import { tooltips } from '@shared/ui/tooltip.ts';

// One bar, two kinds of button, so two triggers. A tool is a state and the icon holds it;
// an action is over the moment it happens and the icon only acknowledges it.
Element.defineTrigger('selected-morph', booleanMorph('data-selected'));
Element.defineTrigger('press-attention', PressAttention);

defineElement();

// Every control here is named by the word floating over it. This is what shows it.
tooltips();
// #endregion

// #region wiring
const tools = [...document.querySelectorAll<HTMLElement>('.tool')];

/**
 * Write the group's choice onto every tool.
 *
 * A radio group already decides which one is on; what it will not do is say so in a way
 * anything else can watch, because `checked` is a property and mutations do not carry
 * properties. So the answer is copied into an attribute and the bar wakes up: two icons
 * morph past each other — the one being put down and the one being picked up — and the
 * stylesheet tints the new tool, all of it from this one line running four times.
 *
 * `change` covers a click and an arrow key alike, which is the whole keyboard story: a
 * radio group is a single tab stop and the arrows move within it.
 */
function follow(): void {
    for (const tool of tools) {
        const input = tool.querySelector<HTMLInputElement>('.tool__input')!;
        tool.dataset.selected = String(input.checked);
    }
}

document.querySelector('.menu-bar__tools')!.addEventListener('change', follow);
// #endregion
