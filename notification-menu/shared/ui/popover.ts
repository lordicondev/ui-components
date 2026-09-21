/**
 * A panel that opens under the control that owns it.
 *
 * The browser has a popover of its own, and this module is built on it rather than beside
 * it. `popovertarget` on a button and `popover` on a panel already give the whole of the
 * hard part: the panel draws in the top layer, above everything on the page and clipped by
 * nothing; clicking away closes it; Escape closes it; the button knows it is a button for
 * that panel. None of that is reimplemented here.
 *
 *     <button type="button" popovertarget="feed">…</button>
 *     <div id="feed" popover>…</div>
 *
 * What the platform does not do is place the panel under the button — CSS anchor
 * positioning is not everywhere yet — or say in the DOM that the button is open, or animate
 * the opening. That is this module, and it is all there is to it.
 *
 * The entrance is a height that unrolls and the panel's own rows arriving into it. Anything
 * marked `data-rise` inside the panel is a row: it comes from a little above its place and
 * fades in, each one after the one before it. A demo with more to start at the same moment
 * — words to reveal, a fill to unroll — is handed each row and the delay it was given, so
 * whatever it starts lands in the same cascade rather than in one of its own.
 *
 * Leaving is not script at all. A popover closing leaves the top layer, and the way to hold
 * it there long enough to watch is `transition-behavior: allow-discrete` in the stylesheet
 * — see popover.css. Doing it here would mean fighting the browser for the right to keep an
 * element it has already taken away.
 */
import { prefersReducedMotion } from '../motion/reduced-motion.ts';

/** Between the bottom of the control and the top of the panel. */
const GAP = 8;

/** The height unrolling. Measured from the reference recording at 225ms. */
const OPEN_MS = 220;

/** A box opening, which is the curve the accordion's panel uses for the same reason. */
const OPEN_EASE = 'cubic-bezier(0.3, 0, 0.2, 1)';

/** Before the first row starts, so the panel is already on its way. */
const RISE_LEAD = 60;

/** And between one row and the next. */
const RISE_STAGGER = 40;

/** How far above its place a row starts. */
const RISE_DISTANCE = 12;

/** A row settling. Slower than its own fade, so it is readable before it has stopped. */
const RISE_MS = 360;
const RISE_EASE = 'cubic-bezier(0.25, 1, 0.5, 1)';

/** The fade is over well before the movement is, which is what the recording measures. */
const FADE_MS = 180;

export type PopoverOptions = {
    gap?: number;
    duration?: number;
    lead?: number;
    stagger?: number;
    /**
     * Called for each `[data-rise]` row as the panel opens, with the delay that row was
     * given. Anything the caller starts from here joins the same cascade.
     */
    onRise?: (row: HTMLElement, delay: number) => void;
};

/** Where a row falls in the cascade. Exported so a caller can line something else up. */
export function riseDelay(index: number, options: PopoverOptions = {}): number {
    const { lead = RISE_LEAD, stagger = RISE_STAGGER } = options;
    return lead + index * stagger;
}

/**
 * Under the control, and aligned with its left edge — but not off the side of the screen.
 *
 * A popover is positioned like a fixed element, so the control's own viewport rectangle is
 * already in the right coordinates. Flipping above the control when there is no room below
 * is deliberately not here: it is a real need and a real amount of code, and no demo has
 * wanted it yet.
 *
 * The panel's own width is only knowable once it is showing, and this runs both before and
 * after: before, so the panel is never painted where the browser would have put it, and
 * again after, when there is a width to keep inside the screen. On anything wide enough the
 * second call changes nothing.
 */
function place(anchor: HTMLElement, panel: HTMLElement, gap: number): void {
    const box = anchor.getBoundingClientRect();
    const room = document.documentElement.clientWidth;
    const width = panel.offsetWidth; // 0 while it is still hidden, which clamps to nothing

    panel.style.left = `${Math.max(gap, Math.min(box.left, room - width - gap))}px`;
    panel.style.top = `${box.bottom + gap}px`;
}

/**
 * Shuts the panel before anyone has seen it.
 *
 * `toggle` is queued as a task, so the browser has already shown the panel — at whatever
 * height its contents give it — by the time anything can react to it, and a frame of the
 * finished panel gets painted before the animation collapses it again. That is the flash.
 * `beforetoggle` runs first, while the panel is still hidden, which is the only moment a
 * height can be put on it that nobody will see it without.
 */
function collapse(panel: HTMLElement): void {
    panel.style.overflow = 'clip';
    panel.style.height = '0px';
}

/** And out again, from the nothing `collapse` left it at, to whatever it holds. */
function unroll(panel: HTMLElement, duration: number): void {
    // Measured with the collapse lifted — and put back by the animation's own first
    // keyframe before this task ends, so the full height is never painted either.
    panel.style.height = '';
    const height = panel.scrollHeight;

    const opening = panel.animate(
        { height: ['0px', `${height}px`] },
        { duration, easing: OPEN_EASE, fill: 'backwards' },
    );

    void opening.finished
        .catch(() => null)
        .then(() => {
            panel.style.overflow = '';
        });
}

// #region rise
/** Rows arrive from a little above, fading faster than they settle. */
function raise(panel: HTMLElement, options: PopoverOptions): void {
    const rows = [...panel.querySelectorAll<HTMLElement>('[data-rise]')];

    rows.forEach((row, index) => {
        const delay = riseDelay(index, options);

        row.animate(
            { opacity: [0, 1] },
            { duration: FADE_MS, delay, easing: 'ease-out', fill: 'backwards' },
        );
        row.animate(
            { transform: [`translateY(${-RISE_DISTANCE}px)`, 'translateY(0)'] },
            { duration: RISE_MS, delay, easing: RISE_EASE, fill: 'backwards' },
        );

        options.onRise?.(row, delay);
    });
}
// #endregion

/**
 * Wires every `[popovertarget]` under `root` to the panel it names.
 *
 * Called once, for a page that keeps its controls — the same shape as `tooltips()`, and for
 * the same reason: nothing here needs taking apart.
 */
export function popovers(root: ParentNode = document, options: PopoverOptions = {}): void {
    const { gap = GAP, duration = OPEN_MS } = options;

    for (const anchor of root.querySelectorAll<HTMLElement>('[popovertarget]')) {
        const panel = document.getElementById(anchor.getAttribute('popovertarget')!);
        if (!panel) continue;

        // Both of these belong on `beforetoggle` rather than on `toggle`, and for one
        // reason: it runs before the panel has been shown, so neither the place the
        // browser would have put it nor the height its contents give it is ever painted.
        panel.addEventListener('beforetoggle', (event) => {
            if ((event as ToggleEvent).newState !== 'open') return;

            place(anchor, panel, gap);
            if (!prefersReducedMotion()) collapse(panel);
        });

        panel.addEventListener('toggle', (event) => {
            const open = (event as ToggleEvent).newState === 'open';
            if (open) place(anchor, panel, gap); // again, now that it has a width

            // What the control is for is the browser's business; what state it is in is
            // ours, and an attribute is the only form of it a stylesheet or an icon can
            // read. Both are watching this one.
            anchor.setAttribute('aria-expanded', String(open));

            if (!open || prefersReducedMotion()) return;

            unroll(panel, duration);
            raise(panel, options);
        });
    }
}
