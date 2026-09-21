// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanMorph } from '@shared/triggers/boolean-morph.ts';

Element.defineTrigger('expanded-morph', booleanMorph('aria-expanded'));

defineElement();
// #endregion

import '@shared/types/lordicon.d.ts';
import { prefersReducedMotion } from '@shared/motion/reduced-motion.ts';
import { concealText, revealText } from '@shared/motion/text-reveal.ts';

// #region panel
const panels = new WeakMap<HTMLElement, Animation>();

/** `height` has no transition to `auto`, so the box is measured and moved by hand. */
async function setPanel(panel: HTMLElement, open: boolean): Promise<void> {
    // Measured before cancelling and before unhiding, so it is honest either way: a
    // closed panel is zero, and one caught mid-flight is wherever it had got to.
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
    // A rejection means a later click cancelled this one, and now owns the panel.
    if (!(await height.finished.catch(() => null))) return;
    panel.hidden = !open; // hide first: never a frame back at full height
    height.cancel(); // then hand the height back to the stylesheet
}
// #endregion

// #region wiring
for (const trigger of document.querySelectorAll<HTMLButtonElement>('.item__trigger')) {
    const panel = document.getElementById(trigger.getAttribute('aria-controls')!)!;
    const text = panel.querySelector('p')!;

    trigger.addEventListener('click', () => {
        const open = trigger.getAttribute('aria-expanded') !== 'true';

        trigger.setAttribute('aria-expanded', String(open));

        // Arriving and leaving are not the same movement: the words fade in where they
        // are, and the whole paragraph slides out under the closing panel.
        if (open) revealText(text);
        else concealText(text);

        // Second, because the paragraph has to be back in place first: scrollHeight
        // counts a transformed child, so a leftover slide would inflate the target.
        void setPanel(panel, open);
    });
}
// #endregion
