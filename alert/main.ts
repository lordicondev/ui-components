// #region setup
import { defineElement, Element } from '@lordicon/element';
import { AfterEnter } from '@shared/triggers/after-enter.ts';

Element.defineTrigger('after-enter', AfterEnter);

defineElement();
// #endregion

import '@shared/types/lordicon.d.ts';

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

const list = document.querySelector<HTMLUListElement>('#alerts')!;
const template = document.querySelector<HTMLTemplateElement>('#alert-template')!;

// #region wiring
function add(kind: Kind) {
    const { icon, title, message } = CONTENT[kind];
    const alert = template.content.cloneNode(true) as DocumentFragment;

    const card = alert.querySelector<HTMLElement>('.alert')!;
    card.dataset.kind = kind;

    alert.querySelector('.alert__icon')!.setAttribute('src', `icons/${icon}.json`);
    alert.querySelector('.alert__title')!.textContent = title;
    alert.querySelector('.alert__message')!.textContent = message;

    card.querySelector('.alert__close')!.addEventListener('click', () => card.remove());

    list.prepend(alert);
}
// #endregion

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-add]')) {
    button.addEventListener('click', () => add(button.dataset.add as Kind));
}

// Start with one of each, so the page is not empty on arrival.
for (const kind of ['error', 'warning', 'success', 'info'] as Kind[]) add(kind);
