// #region setup
import { defineElement, Element } from '@lordicon/element';
import { ArrivalHover } from '@shared/triggers/arrival-hover.ts';

Element.defineTrigger('arrival-hover', ArrivalHover);

defineElement();
// #endregion

import '@shared/types/lordicon.d.ts';
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

/** Top to bottom, the order the design lays them out in. */
const GALLERY: Kind[] = ['info', 'success', 'warning', 'error'];

/** What the button queues, and in which order. The quiet grey one closes the set. */
const QUEUE: Kind[] = ['error', 'warning', 'success', 'info'];

const template = document.querySelector<HTMLTemplateElement>('#alert-template')!;
const gallery = document.querySelector<HTMLElement>('[data-list="gallery"]')!;
const queue = document.querySelector<HTMLElement>('[data-list="queue"]')!;
const add = document.querySelector<HTMLButtonElement>('[data-add]')!;

// #region build
/** One alert, filled in. Both pages are made of these. */
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

/** The cards that still count. One on its way out has already given up its place. */
function standing(): HTMLElement[] {
    return ([...queue.children] as HTMLElement[]).filter(
        (card) => !card.hasAttribute('data-leaving'),
    );
}

/** How far back each card sits. The newest is in front; the rest recede behind it. */
function restack(): void {
    const cards = standing();

    cards.forEach((card, at) => {
        card.style.setProperty('--depth', String(cards.length - 1 - at));
        card.style.zIndex = String(at);
    });
}

/** Out the way it came in, and only gone once it has finished going. */
async function dismiss(card: HTMLElement): Promise<void> {
    card.dataset.leaving = '';

    // Before it has gone, not after: the deck closes up while the card is still flying
    // out, rather than standing still until it has finished.
    settle();

    // The transitions do not exist until a frame has passed with the attribute set.
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(card.getAnimations().map((leaving) => leaving.finished));

    card.remove();
    settle();
}

// #region queue
/** The first kind not already up, so dismissing brings that kind back, not a duplicate. */
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

/** After anything changes: who sits where, and whether there is room for one more. */
function settle(): void {
    restack();
    add.disabled = !next();
}
// #endregion

add.addEventListener('click', enqueue);

// The first page is a picture of every kind at once. Its close buttons answer the pointer
// and nothing else — dismissing is what the second page is for, where it frees a slot.
for (const kind of GALLERY) {
    const card = build(kind);
    card.querySelector('.alert__close')!.setAttribute('tabindex', '-1');
    gallery.append(card);
}

pager();
settle();
