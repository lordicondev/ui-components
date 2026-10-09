/** The icon table on each demo page shows real icons, so the element is registered here too. */
import { defineElement } from '@lordicon/element';

defineElement();

/** The height each demo reports. Only matters when a demo outgrows the stage. */
const reported = new WeakMap<Element, number>();

addEventListener('message', (event: MessageEvent) => {
    const data = event.data as { type?: string; height?: number } | null;
    if (data?.type !== 'demo-height' || typeof data.height !== 'number') return;

    for (const frame of document.querySelectorAll<HTMLIFrameElement>('[data-stage]')) {
        if (frame.contentWindow === event.source) {
            reported.set(frame, data.height);
            sizeStage();
        }
    }
});

/**
 * Gives a frame the height it asked for when that is more than the stage already has.
 * The common case is handled in CSS, so the page does not move while a demo loads.
 */
function sizeStage() {
    for (const stage of document.querySelectorAll<HTMLElement>('[data-frame]')) {
        const frame = stage.querySelector('[data-stage]');
        const needed = frame ? (reported.get(frame) ?? 0) : 0;

        stage.style.minHeight = needed ? `${needed}px` : '';
    }
}

/** TS | JS switch, per code block. */
for (const block of document.querySelectorAll<HTMLElement>('[data-code]')) {
    const options = block.querySelectorAll<HTMLButtonElement>('[data-lang]');

    for (const option of options) {
        option.addEventListener('click', () => {
            const wanted = option.dataset.lang;

            for (const other of options) {
                other.setAttribute('aria-pressed', String(other === option));
            }

            for (const body of block.querySelectorAll<HTMLElement>('[data-variant]')) {
                body.hidden = body.dataset.variant !== wanted;
            }
        });
    }
}

/** Copy the code next to the button. */
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
    button.addEventListener('click', async () => {
        const shown = button
            .closest('[data-code], .terminal')
            ?.querySelector<HTMLElement>('[data-variant]:not([hidden]) code, code');

        if (!shown?.textContent) return;

        // Clipboard access can be refused (insecure origin, locked-down browser).
        const original = button.textContent;
        try {
            await navigator.clipboard.writeText(shown.textContent);
            button.textContent = 'Copied';
        } catch {
            button.textContent = 'Press Ctrl+C';
            getSelection()?.selectAllChildren(shown);
        }

        setTimeout(() => (button.textContent = original), 1600);
    });
}

/** Moves focus into the revealed list, so it does not fall back to the top of the page. */
for (const reveal of document.querySelectorAll<HTMLDetailsElement>('.imports')) {
    reveal.addEventListener('toggle', () => {
        if (reveal.open) reveal.querySelector<HTMLElement>('.code__head')?.focus();
    });
}

/**
 * Index filter. The markup ships unfiltered and the control takes its place from the first
 * paint; without JavaScript the stylesheet hides it and the list still works. The chosen
 * tag lives in the hash, so a filtered index is a link.
 */
const filter = document.querySelector<HTMLElement>('[data-filter]');

if (filter) {
    const chips = [...filter.querySelectorAll<HTMLButtonElement>('[data-tag]')];
    const cards = document.querySelectorAll<HTMLElement>('.card');
    const empty = document.querySelector<HTMLElement>('[data-empty]');

    /**
     * Wraps a filter change in a view transition where supported, so the cards that stay
     * slide to their new place. Skipped under reduced motion; the change runs either way.
     */
    type Transitions = Document & { startViewTransition?: (change: () => void) => unknown };
    const view = document as Transitions;

    const settle = (change: () => void) => {
        const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (still || !view.startViewTransition) change();
        else view.startViewTransition(change);
    };

    const apply = (wanted: string) => {
        for (const chip of chips) {
            chip.setAttribute('aria-pressed', String((chip.dataset.tag ?? '') === wanted));
        }

        let shown = 0;
        for (const card of cards) {
            const match = !wanted || (card.dataset.tags ?? '').split(' ').includes(wanted);
            card.hidden = !match;
            if (match) shown++;
        }

        if (empty) empty.hidden = shown > 0;
    };

    /** The tag in `#tag-<name>`, or '' when there is none or it matches no chip. */
    const fromHash = () => {
        const wanted = location.hash.startsWith('#tag-') ? location.hash.slice(5) : '';
        return chips.some((chip) => chip.dataset.tag === wanted) ? wanted : '';
    };

    for (const chip of chips) {
        chip.addEventListener('click', () => {
            const wanted = chip.dataset.tag ?? '';

            // replaceState, not location.hash: no jump, and Back leaves the page.
            history.replaceState(null, '', wanted ? `#tag-${wanted}` : location.pathname);
            settle(() => apply(wanted));
        });
    }

    addEventListener('hashchange', () => settle(() => apply(fromHash())));

    // No transition on the first pass.
    apply(fromHash());

    // Arriving with a tag in the hash: go straight to the list.
    if (fromHash()) document.getElementById('demos')?.scrollIntoView();
}
