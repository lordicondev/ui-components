// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanAttention } from '@shared/triggers/boolean-attention.ts';

// The same trigger twice, on two attributes and for two different reasons. The magnifier
// answers the cursor arriving; the cross answers there being something to clear. Neither
// is a state the icon holds afterwards — both are the icon saying "that happened".
Element.defineTrigger('focus-attention', booleanAttention('data-focused'));
Element.defineTrigger('clearable-attention', booleanAttention('data-clearable'));

defineElement();
// #endregion

const field = document.querySelector<HTMLElement>('.field')!;
const input = document.querySelector<HTMLInputElement>('.field__input')!;
const clear = document.querySelector<HTMLButtonElement>('.field__clear')!;

/*
 * The cross is not news while you are still typing. It is an answer to a question you have
 * not finished asking, and an icon drawing itself in beside a moving caret is the one thing
 * in the field competing with what you came here to do. So it waits for the keyboard.
 */

// #region settle
/** How long the quiet has to last before the field offers to be emptied. */
const SETTLED = 500;
let settling: ReturnType<typeof setTimeout> | undefined;

/** Offer to clear, or stop offering. The icon and the stylesheet both read this. */
function offer(clearable: boolean): void {
    clearTimeout(settling);
    field.dataset.clearable = String(clearable);
}

input.addEventListener('input', () => {
    clearTimeout(settling);

    // Nothing left to clear, and no reason to wait half a second to say so.
    if (!input.value) {
        offer(false);
        return;
    }

    // Once it is there it stays: a button that hopped away on the next keystroke would be
    // gone exactly when you reached for it.
    if (field.dataset.clearable === 'true') return;

    settling = setTimeout(() => offer(true), SETTLED);
});
// #endregion

// #region focus
// The whole field, not the input: there are two things inside it that can hold focus, and
// as far as anyone looking at it is concerned the control is focused if either does. So
// `focusin`/`focusout`, which bubble, rather than the input's own `focus` and `blur`.
field.addEventListener('focusin', () => (field.dataset.focused = 'true'));

field.addEventListener('focusout', (event) => {
    // Reaching for the clear button is not leaving. Without this the field flickers grey
    // for the frame between losing the input and being handed back — `focusout` arrives
    // before `focusin`, so the way out has to know where focus is going.
    if (field.contains(event.relatedTarget as Node | null)) return;

    // Leaving settles the typing too. Whatever you were in the middle of, you have
    // stopped, and the field can say what it holds without waiting out the rest of it.
    field.dataset.focused = 'false';
    if (input.value) offer(true);
});
// #endregion

// #region clear
// Clearing is not leaving. The cursor goes back where it was, and the magnifier does not
// play again — `data-focused` never changed, and the icon is watching that, not us.
clear.addEventListener('click', () => {
    input.value = '';
    offer(false);
    input.focus();
});
// #endregion
