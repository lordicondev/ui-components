/** The icon table on each demo page shows real icons, so the element is registered here too. */
import { defineElement } from '@lordicon/element';

defineElement();

/**
 * The menu on a phone. The browser opens and closes the panel; this keeps the button's
 * aria-expanded in step, which the cross icon follows, and brings the current demo into
 * view. Widening the window past the bar closes it.
 */
const siteMenu = document.querySelector<HTMLElement>('#site-menu');
const toggle = document.querySelector<HTMLButtonElement>('.sidebar__toggle');

if (siteMenu && toggle) {
    siteMenu.addEventListener('toggle', (event) => {
        const open = (event as ToggleEvent).newState === 'open';
        toggle.setAttribute('aria-expanded', String(open));
        if (open) siteMenu.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest' });
    });

    const wide = matchMedia('(min-width: 900px)');
    wide.addEventListener('change', () => {
        if (wide.matches && siteMenu.matches(':popover-open')) siteMenu.hidePopover();
    });
}

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

        if (needed) stage.style.setProperty('--needed', `${needed}px`);
        else stage.style.removeProperty('--needed');
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

/**
 * Copy the code next to the button. A fragment that leaves lines out carries the whole
 * region in data-full, so what is pasted works.
 */
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
    button.addEventListener('click', async () => {
        const shown = button
            .closest('[data-code], .terminal')
            ?.querySelector<HTMLElement>('[data-variant]:not([hidden]), pre');
        const text = shown?.dataset.full ?? shown?.textContent;

        if (!shown || !text) return;

        // Clipboard access can be refused (insecure origin, locked-down browser).
        const original = button.textContent;
        try {
            await navigator.clipboard.writeText(text);
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
 * Card videos on the index. One plays from the start while the pointer or keyboard focus is
 * on its card, and fades back to the still when that leaves. A touch screen has no pointer
 * to follow, so there a video plays while its card crosses the middle of the screen, which
 * is one card at a time. Under reduced motion, or when the reader asks to save data, the
 * stills stay.
 */
const previews = [...document.querySelectorAll<HTMLVideoElement>('[data-preview]')];
const still = matchMedia('(prefers-reduced-motion: reduce)');
const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData;

function preview(video: HTMLVideoElement, on: boolean) {
    if (!on || still.matches) {
        delete video.dataset.playing; // the stylesheet fades it out
        video.pause();
        return;
    }

    video.currentTime = 0;
    // A pause before playback starts rejects the promise; the card has been left by then.
    video
        .play()
        .then(() => {
            if (!video.paused) video.dataset.playing = '';
        })
        .catch(() => undefined);
}

for (const video of previews) {
    const card = video.closest<HTMLElement>('.card__link')!;
    const follows = (event: PointerEvent) => event.pointerType !== 'touch';

    card.addEventListener('pointerenter', (event) => follows(event) && preview(video, true));
    card.addEventListener('pointerleave', (event) => follows(event) && preview(video, false));
    card.addEventListener('focus', () => preview(video, true));
    card.addEventListener('blur', () => preview(video, false));
}

if (previews.length && matchMedia('(hover: none)').matches && !saving) {
    const seen = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                preview(entry.target as HTMLVideoElement, entry.isIntersecting);
            }
        },
        { rootMargin: '-45% 0px' },
    );
    for (const video of previews) seen.observe(video);
}
