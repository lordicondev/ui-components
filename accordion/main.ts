import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
defineElement();

import { prefersReducedMotion } from '@shared/motion/reduced-motion.ts';
import { concealText, revealText } from '@shared/motion/text-reveal.ts';

const panels = new WeakMap<HTMLElement, Animation>();

/** `height` cannot transition to `auto`, so the panel is measured and animated by hand. */
async function setPanel(panel: HTMLElement, open: boolean): Promise<void> {
    // Measured before cancelling, so a panel caught mid-animation starts from where it is.
    const from = panel.getBoundingClientRect().height;
    panels.get(panel)?.cancel();

    if (prefersReducedMotion()) {
        panel.hidden = !open;
        return;
    }

    if (open) panel.hidden = false;
    const height = panel.animate(
        { height: [`${from}px`, open ? `${panel.scrollHeight}px` : '0px'] },
        { duration: 300, easing: 'cubic-bezier(0.3, 0, 0.2, 1)', fill: 'forwards' },
    );
    panels.set(panel, height);
    // A rejection means a later click cancelled this animation and owns the panel now.
    if (!(await height.finished.catch(() => null))) return;
    panel.hidden = !open; // hide first, so there is never a frame back at full height
    height.cancel(); // then hand the height back to the stylesheet
}

for (const trigger of document.querySelectorAll<HTMLButtonElement>('.item__trigger')) {
    const panel = document.getElementById(trigger.getAttribute('aria-controls')!)!;
    const text = panel.querySelector('p')!;

    trigger.addEventListener('click', () => {
        const open = trigger.getAttribute('aria-expanded') !== 'true';

        trigger.setAttribute('aria-expanded', String(open));

        // Opening fades the words in where they are; closing slides the paragraph down
        // under the shrinking panel.
        if (open) revealText(text);
        else concealText(text);

        // After the text: revealText() cancels a leftover slide, and scrollHeight would
        // count the transformed paragraph otherwise.
        void setPanel(panel, open);
    });
}
