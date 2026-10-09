// #region setup
import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
defineElement();
// #endregion

import { pager } from '@shared/ui/pager.ts';

type Kind = 'info' | 'success' | 'warning' | 'error';

const CONTENT: Record<Kind, { icon: string; title: string; message: string }> = {
    info: {
        icon: 'info-circle',
        title: 'Scheduled maintenance',
        message: 'Online banking will be unavailable Sunday 2–4 AM ET for scheduled maintenance.',
    },
    success: {
        icon: 'check-circle',
        title: 'Transfer complete',
        message: '$1,250.00 was successfully sent to Alex Morgan.',
    },
    warning: {
        icon: 'warning-triangle',
        title: 'Low balance',
        message:
            'Your checking account is below $100. Consider transferring funds to avoid overdraft.',
    },
    error: {
        icon: 'cross-circle',
        title: 'Payment declined',
        message: 'Your card ending in 4242 was declined. Check your details and try again.',
    },
};

/** What the button queues, in order. */
const QUEUE: Kind[] = ['error', 'warning', 'success', 'info'];

const template = document.querySelector<HTMLTemplateElement>('#alert-template')!;
const queue = document.querySelector<HTMLElement>('[data-list="queue"]')!;
const add = document.querySelector<HTMLButtonElement>('[data-add]')!;

// #region build
/** One alert from the template, for the deck. The gallery's cards are in the markup. */
function build(kind: Kind): HTMLElement {
    const { icon, title, message } = CONTENT[kind];
    const alert = template.content.cloneNode(true) as DocumentFragment;
    const card = alert.querySelector<HTMLElement>('.alert')!;

    card.dataset.kind = kind;
    card.querySelector('.alert__icon')!.setAttribute('src', `icons/${icon}.json`);
    card.querySelector('.alert__title')!.textContent = title;
    card.querySelector('.alert__message')!.textContent = message;

    return card;
}
// #endregion

/** The cards in the deck, not counting one on its way out. */
function standing(): HTMLElement[] {
    return ([...queue.children] as HTMLElement[]).filter(
        (card) => !card.hasAttribute('data-leaving'),
    );
}

// #region dismiss
/** Writes each card's depth: the newest is 0 and in front, the rest recede behind it. */
function restack(): void {
    const cards = standing();

    cards.forEach((card, at) => {
        card.style.setProperty('--depth', String(cards.length - 1 - at));
        card.style.zIndex = String(at);
    });
}

/** Marks the card as leaving, lets the stylesheet animate it out, then removes it. */
async function dismiss(card: HTMLElement): Promise<void> {
    card.dataset.leaving = '';

    // Restack now, so the deck closes up while the card is still on its way out.
    settle();

    // The leaving transitions only exist once a frame has passed with the attribute set.
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(card.getAnimations().map((leaving) => leaving.finished));

    card.remove();
    settle();
}
// #endregion

// #region queue
/** The first kind not already in the deck, so dismissing one brings that kind back. */
function next(): Kind | undefined {
    const up = new Set(standing().map((card) => card.dataset.kind));
    return QUEUE.find((kind) => !up.has(kind));
}

function enqueue(): void {
    const kind = next();
    if (!kind) return;
    const card = build(kind);

    card.querySelector('.alert__close')!.addEventListener('click', () => void dismiss(card));

    queue.append(card);
    settle();
}

/** After any change: who sits where, and whether there is room for one more. */
function settle(): void {
    restack();
    add.disabled = !next();
}
// #endregion

add.addEventListener('click', enqueue);

pager();
settle();
