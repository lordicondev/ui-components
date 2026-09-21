// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanAttention } from '@shared/triggers/boolean-attention.ts';
import { raisedAttention } from '@shared/triggers/raised-attention.ts';
import { booleanMorph } from '@shared/triggers/boolean-morph.ts';

// Register before defineElement(): it calls customElements.define() last, and the moment
// the element is defined, any <lord-icon trigger="..."> already in the page upgrades —
// an unregistered name throws.
Element.defineTrigger('pressed-morph', booleanMorph('aria-pressed'));
Element.defineTrigger('focus-attention', booleanAttention('data-focused'));
Element.defineTrigger('raised-attention', raisedAttention('data-raised'));

defineElement();
// #endregion

import '@shared/types/lordicon.d.ts';
import { prefersReducedMotion } from '@shared/motion/reduced-motion.ts';
import { revealText, settleText } from '@shared/motion/text-reveal.ts';

const field = document.querySelector<HTMLElement>('.field')!;
const input = document.querySelector<HTMLInputElement>('.field__input')!;
const toggle = document.querySelector<HTMLButtonElement>('.field__toggle')!;
const form = document.querySelector<HTMLFormElement>('.demo__form')!;
const hint = document.querySelector<HTMLElement>('.field__error')!;
const hintText = document.querySelector<HTMLElement>('.field__error-text')!;

// #region validate
/** The one password this demo accepts. Everything else is a story about being wrong. */
const CORRECT = 'password';

/** The markup still owns the rule; we only read it off the attribute. */
const MIN = Number(input.getAttribute('minlength'));

/** What is wrong with the value, or null if nothing is. */
function problem(): string | null {
    // Measured here rather than through checkValidity(): `tooShort` only fires for a value
    // the user has edited, so a field that arrives pre-filled and short passes it.
    if (input.value.length < MIN) return `Must be at least ${MIN} characters`;
    if (input.value !== CORRECT) return 'That password is not the one we have on file';
    return null;
}
// #endregion

const SLIDE_IN = 12;
const DROP_OUT = 8;
const HINT_EASING = 'cubic-bezier(0.3, 0, 0.2, 1)';

/** The hint's own travel. The word wave lives on the spans inside it, untouched by this. */
function stopHint(): void {
    for (const animation of hint.getAnimations()) animation.cancel();
}

/** Still coming in — its own slide, or the wave of words inside it. */
function arriving(): boolean {
    return hint.getAnimations().length > 0 || hintText.getAnimations({ subtree: true }).length > 0;
}

// #region hint-in
/** Arrives from the right, its icon playing and its words landing one after another. */
function showHint(message: string): void {
    const raised = Number(hint.dataset.raised) || 0;

    if (raised > 0) {
        // Already up, and nothing has changed since — a keystroke would have taken it
        // away — so this is the same message again: the icon nudges, the hint stays put.
        // Still arriving is answer enough on its own; a nudge on top of it only stutters.
        if (!arriving()) hint.dataset.raised = String(raised + 1);
        return;
    }

    hint.dataset.raised = '1'; // the icon takes its cue from the count
    stopHint();
    hintText.textContent = message; // new words; the old spans leave with the old text
    hint.hidden = false;

    if (prefersReducedMotion()) return;

    hint.animate(
        { transform: [`translateX(${SLIDE_IN}px)`, 'translateX(0)'] },
        { duration: 300, easing: HINT_EASING },
    );
    revealText(hintText);
}
// #endregion

// #region hint-out
/** Drops away, fading, and takes itself out of the page once it has gone. */
async function hideHint(): Promise<void> {
    // Already gone, or already going: every keystroke asks again, and restarting the
    // exit on each one would leave it running on the spot.
    if (hint.dataset.raised === '0') return;

    hint.dataset.raised = '0';
    stopHint();
    settleText(hintText); // a half-finished wave would fade out at half ink

    if (prefersReducedMotion()) {
        hint.hidden = true;
        return;
    }

    const out = hint.animate(
        { transform: ['translateY(0)', `translateY(${DROP_OUT}px)`], opacity: [1, 0] },
        { duration: 200, easing: HINT_EASING, fill: 'forwards' },
    );
    // A rejection means a new message cancelled this one on its way out.
    if (!(await out.finished.catch(() => null))) return;

    hint.hidden = true;
    out.cancel();
}
// #endregion

// #region wiring
toggle.addEventListener('click', () => {
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(reveal));
    toggle.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
});

// The lock answers the input, not the form: arriving is the event, typing is not.
input.addEventListener('focus', () => (field.dataset.focused = 'true'));
input.addEventListener('blur', () => (field.dataset.focused = 'false'));

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const wrong = problem();

    field.setAttribute('aria-invalid', String(wrong !== null));
    if (wrong) showHint(wrong);
    else void hideHint();
});

// An answer about a value since changed is no answer: the next Sign in asks again.
input.addEventListener('input', () => {
    field.setAttribute('aria-invalid', 'false');
    void hideHint();
});
// #endregion
