import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
defineElement();

import { prefersReducedMotion } from '@shared/motion/reduced-motion.ts';
import { revealText, settleText } from '@shared/motion/text-reveal.ts';

const field = document.querySelector<HTMLElement>('.field')!;
const input = document.querySelector<HTMLInputElement>('.field__input')!;
const toggle = document.querySelector<HTMLButtonElement>('.field__toggle')!;
const form = document.querySelector<HTMLFormElement>('.demo__form')!;
const hint = document.querySelector<HTMLElement>('.field__error')!;
const hintText = document.querySelector<HTMLElement>('.field__error-text')!;

/** The one password this demo accepts. */
const CORRECT = 'password';

/** Read from the markup, which owns the rule. */
const MIN = Number(input.getAttribute('minlength'));

/** What is wrong with the value, or null. */
function problem(): string | null {
    // Measured here rather than with checkValidity(): `tooShort` only reports a value the
    // user has edited, and this field arrives pre-filled.
    if (input.value.length < MIN) return `Must be at least ${MIN} characters`;
    if (input.value !== CORRECT) return 'That password is not the one we have on file';
    return null;
}

const SLIDE_IN = 12;
const DROP_OUT = 8;
const HINT_EASING = 'cubic-bezier(0.3, 0, 0.2, 1)';

/** Cancels the hint's own slide. The word wave inside it is separate. */
function stopHint(): void {
    for (const animation of hint.getAnimations()) animation.cancel();
}

/** True while the hint's slide or its word wave is still running. */
function arriving(): boolean {
    return hint.getAnimations().length > 0 || hintText.getAnimations({ subtree: true }).length > 0;
}

/** Shows the message. It slides in from the right and its words arrive one by one. */
function showHint(message: string): void {
    const raised = Number(hint.dataset.raised) || 0;

    if (raised > 0) {
        // Already up with the same message (a keystroke would have hidden it). Raise the
        // count so the icon nudges, unless the arrival is still playing.
        if (!arriving()) hint.dataset.raised = String(raised + 1);
        return;
    }

    hint.dataset.raised = '1'; // the icon plays its entrance on this
    stopHint();
    hintText.textContent = message; // new words; the old spans go with the old text
    hint.hidden = false;

    if (prefersReducedMotion()) return;

    hint.animate(
        { transform: [`translateX(${SLIDE_IN}px)`, 'translateX(0)'] },
        { duration: 300, easing: HINT_EASING },
    );
    revealText(hintText);
}

/** Hides the message: a drop and a fade, then `hidden`. */
async function hideHint(): Promise<void> {
    // Already hidden, or already leaving. Every keystroke calls this.
    if (hint.dataset.raised === '0') return;

    hint.dataset.raised = '0';
    stopHint();
    settleText(hintText); // a half-finished wave would fade out at half opacity

    if (prefersReducedMotion()) {
        hint.hidden = true;
        return;
    }

    const out = hint.animate(
        { transform: ['translateY(0)', `translateY(${DROP_OUT}px)`], opacity: [1, 0] },
        { duration: 200, easing: HINT_EASING, fill: 'forwards' },
    );
    // A rejection means a new message cancelled this exit.
    if (!(await out.finished.catch(() => null))) return;

    hint.hidden = true;
    out.cancel();
}

toggle.addEventListener('click', () => {
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(reveal));
    toggle.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
});

// The lock plays when focus arrives, not on every keystroke.
input.addEventListener('focus', () => (field.dataset.focused = 'true'));
input.addEventListener('blur', () => (field.dataset.focused = 'false'));

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const wrong = problem();

    field.setAttribute('aria-invalid', String(wrong !== null));
    if (wrong) showHint(wrong);
    else void hideHint();
});

// A changed value invalidates the last answer; the next Sign in asks again.
input.addEventListener('input', () => {
    field.setAttribute('aria-invalid', 'false');
    void hideHint();
});
