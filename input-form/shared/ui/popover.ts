/**
 * A panel that opens beside the control that owns it, built on the browser's popover:
 *
 *     <button type="button" popovertarget="feed">…</button>
 *     <div id="feed" popover>…</div>
 *
 * The browser draws the panel in the top layer, closes it on Escape and on a click away,
 * and links button and panel for assistive tech. This module adds what it does not do:
 *
 * - places the panel against the button, opening up or down depending on the room
 * - writes `aria-expanded` on the button and `data-direction` on the panel
 * - animates the opening: the panel's height unrolls and its `[data-rise]` rows fade in
 *   one after another, starting from the end nearest the button
 * - closes the whole chain of panels when a `[data-choose]` row is clicked, and raises a
 *   `popover-choose` event carrying the row
 *
 * Closing is not animated here. A closing popover leaves the top layer, and the only way to
 * hold it there is `transition-behavior: allow-discrete` in popover.css.
 */
import { prefersReducedMotion } from '../motion/reduced-motion.ts';
import { revealText } from '../motion/text-reveal.ts';

/** Between the control and the panel's near edge. */
const GAP = 8;

/** The height unrolling. */
const OPEN_MS = 220;
const OPEN_EASE = 'cubic-bezier(0.3, 0, 0.2, 1)';

/** Before the first row starts, and between one row and the next. */
const RISE_LEAD = 60;
const RISE_STAGGER = 40;

/** How far beyond its place a row starts. */
const RISE_DISTANCE = 12;

/** A row settling into place. Its fade is shorter, so it is readable before it stops. */
const RISE_MS = 360;
const RISE_EASE = 'cubic-bezier(0.25, 1, 0.5, 1)';
const FADE_MS = 180;

/** A label arriving word by word, when a `reveal` selector is given. */
const REVEAL_MS = 260;
const REVEAL_FADE = 0.45;

export type PopoverDirection = 'up' | 'down';

/** What a `popover-choose` event carries. */
export type PopoverChoice = { item: HTMLElement };

export type PopoverOptions = {
    gap?: number;
    /** Which way the panel opens. `auto` picks the side with more room. */
    direction?: PopoverDirection | 'auto';
    duration?: number;
    lead?: number;
    stagger?: number;
    /** Called for each rising row with the delay it was given, to start more in step. */
    onRise?: (row: HTMLElement, delay: number) => void;
    /** A selector inside each rising row whose text arrives word by word. */
    reveal?: string;
};

const wired = new WeakSet<HTMLElement>();

/**
 * Which way there is room to open. Decided from the control's rectangle alone, because the
 * panel is still hidden and has no height yet. A tie opens downwards. A panel opened from
 * inside another panel follows that one.
 */
function roomFor(anchor: HTMLElement, gap: number): PopoverDirection {
    const outer = anchor.closest<HTMLElement>('[data-direction]');
    if (outer) return outer.dataset.direction as PopoverDirection;

    const box = anchor.getBoundingClientRect();
    const below = document.documentElement.clientHeight - box.bottom - gap;

    return below >= box.top - gap ? 'down' : 'up';
}

/**
 * Puts the panel against the control. A popover is positioned like a fixed element, so
 * the control's viewport rectangle is already in the right coordinates. The panel is
 * pinned by the edge it grows away from, so the height animation moves the far edge only.
 *
 * `data-side="inline"` on the panel puts it beside the control instead, for a submenu.
 * It clears the panel the control sits in, not the control itself.
 *
 * Runs before the panel shows, so the browser's own position is never painted, and again
 * after, when the panel has a width to keep on screen.
 */
function place(anchor: HTMLElement, panel: HTMLElement, gap: number, to: PopoverDirection): void {
    const box = anchor.getBoundingClientRect();
    const wide = document.documentElement.clientWidth;
    const tall = document.documentElement.clientHeight;
    const width = panel.offsetWidth; // 0 while hidden
    const beside = panel.dataset.side === 'inline';

    // Both edges are written every time; an inline `top` from an earlier opening would
    // otherwise fight a `bottom` set now.
    panel.style.top = to === 'down' ? `${beside ? box.top : box.bottom + gap}px` : 'auto';
    panel.style.bottom = to === 'up' ? `${tall - (beside ? box.bottom : box.top - gap)}px` : 'auto';

    if (!beside) {
        panel.style.left = `${Math.max(gap, Math.min(box.left, wide - width - gap))}px`;
        return;
    }

    const from = anchor.closest<HTMLElement>('[popover]')?.getBoundingClientRect() ?? box;
    const after = from.right + gap;

    panel.style.left = `${after + width <= wide - gap ? after : Math.max(gap, from.left - gap - width)}px`;
}

/**
 * Collapses the panel before it is painted. `toggle` fires after the panel is already
 * showing at full height, so a frame of it would flash; `beforetoggle` runs while it is
 * still hidden.
 */
function collapse(panel: HTMLElement): void {
    panel.style.overflow = 'clip';
    panel.style.height = '0px';
}

/**
 * Animates the height from collapsed to full. Both ends are measured, not assumed: with
 * `box-sizing: border-box`, `height: 0` still renders as padding plus border, and animating
 * from 0 would spend the first part of the curve below that floor with nothing moving.
 * `offsetHeight` rather than `scrollHeight` at the far end, because it includes the border.
 */
function unroll(panel: HTMLElement, duration: number): void {
    const from = panel.offsetHeight;

    panel.style.height = '';
    const to = panel.offsetHeight;

    const opening = panel.animate(
        { height: [`${from}px`, `${to}px`] },
        { duration, easing: OPEN_EASE, fill: 'backwards' },
    );

    void opening.finished
        .catch(() => null)
        .then(() => {
            panel.style.overflow = '';
        });
}

/** The outermost panel in a chain of nested ones. */
function outermost(panel: HTMLElement): HTMLElement {
    let found = panel;
    let above = found.parentElement?.closest<HTMLElement>('[popover]');

    while (above) {
        found = above;
        above = found.parentElement?.closest<HTMLElement>('[popover]');
    }

    return found;
}

/**
 * A `[data-choose]` row was clicked: raise `popover-choose` and close the whole chain.
 * Rows without the attribute, such as one that opens a submenu, do not close anything.
 */
function choose(panel: HTMLElement, item: HTMLElement): void {
    const detail: PopoverChoice = { item };

    panel.dispatchEvent(new CustomEvent('popover-choose', { bubbles: true, detail }));
    outermost(panel).hidePopover();
}

/** The panel's own `[data-rise]` rows, not those of a submenu nested inside it. */
function own(panel: HTMLElement): HTMLElement[] {
    return [...panel.querySelectorAll<HTMLElement>('[data-rise]')].filter((row) => {
        const inner = row.closest('[popover]');
        return inner === panel || !panel.contains(inner);
    });
}

/**
 * Fades the rows in from a little beyond their place, one after another. An upward panel
 * takes its rows in reverse, so the row nearest the control always arrives first.
 */
function raise(panel: HTMLElement, to: PopoverDirection, options: PopoverOptions): void {
    const { lead = RISE_LEAD, stagger = RISE_STAGGER } = options;
    const rows = own(panel);
    const cascade = to === 'up' ? rows.reverse() : rows;
    const from = to === 'up' ? RISE_DISTANCE : -RISE_DISTANCE;

    cascade.forEach((row, index) => {
        const delay = lead + index * stagger;

        row.animate(
            { opacity: [0, 1] },
            { duration: FADE_MS, delay, easing: 'ease-out', fill: 'backwards' },
        );
        row.animate(
            { transform: [`translateY(${from}px)`, 'translateY(0)'] },
            { duration: RISE_MS, delay, easing: RISE_EASE, fill: 'backwards' },
        );
        const label = options.reveal && row.querySelector<HTMLElement>(options.reveal);
        if (label) revealText(label, { duration: REVEAL_MS, fadeShare: REVEAL_FADE, delay });

        options.onRise?.(row, delay);
    });
}

/** Wires every `[popovertarget]` under `root` to the panel it names. Called once. */
export function popovers(root: ParentNode = document, options: PopoverOptions = {}): void {
    const { gap = GAP, duration = OPEN_MS, direction = 'auto' } = options;

    for (const anchor of root.querySelectorAll<HTMLElement>('[popovertarget]')) {
        const panel = document.getElementById(anchor.getAttribute('popovertarget') ?? '');
        if (!panel || wired.has(panel)) continue;
        wired.add(panel);

        // Placing and collapsing happen in `beforetoggle`, before the panel is painted.
        panel.addEventListener('beforetoggle', (event) => {
            if ((event as ToggleEvent).newState !== 'open') return;

            const to = direction === 'auto' ? roomFor(anchor, gap) : direction;
            panel.dataset.direction = to; // read again in `toggle`, and by the stylesheet

            place(anchor, panel, gap, to);
            if (!prefersReducedMotion()) collapse(panel);
        });

        // Only this panel's rows: a click inside a nested panel bubbles through here too.
        panel.addEventListener('click', (event) => {
            const item = (event.target as Element).closest<HTMLElement>('[data-choose]');
            if (item && item.closest('[popover]') === panel) choose(panel, item);
        });

        panel.addEventListener('toggle', (event) => {
            const open = (event as ToggleEvent).newState === 'open';
            const to = (panel.dataset.direction ?? 'down') as PopoverDirection;
            if (open) place(anchor, panel, gap, to); // again, now that it has a width

            // The one attribute the stylesheet and an icon trigger can read the state from.
            anchor.setAttribute('aria-expanded', String(open));

            if (!open || prefersReducedMotion()) return;

            unroll(panel, duration);
            raise(panel, to, options);
        });
    }
}
