/**
 * A panel that opens beside the control that owns it, on whichever side there is room.
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
 * What the platform does not do is place the panel against the button — CSS anchor
 * positioning is not everywhere yet — or say in the DOM that the button is open, or animate
 * the opening. That is this module, and it is all there is to it.
 *
 * Which way it opens is not the demo's business either. A menu under a bell at the top of a
 * page and a menu over a composer at the foot of one are the same control, and asking each
 * demo to know which it is would be asking it to describe its own layout back to us. So the
 * panel measures the room around the control and pins the edge it is growing away from, and
 * writes the answer on itself as `data-direction` for the stylesheet to read.
 *
 * The entrance is a height that unrolls and the panel's own rows arriving into it. Anything
 * marked `data-rise` inside the panel is a row: it comes from a little beyond its place and
 * fades in, each one after the one before it. The cascade runs away from the control — down
 * a panel that opened downwards, up one that opened up — so the row nearest the button you
 * just pressed is always the first to arrive. A demo with more to start at the same moment
 * — words to reveal, a fill to unroll — is handed each row and the delay it was given, so
 * whatever it starts lands in the same cascade rather than in one of its own.
 *
 * Leaving is not script at all. A popover closing leaves the top layer, and the way to hold
 * it there long enough to watch is `transition-behavior: allow-discrete` in the stylesheet
 * — see popover.css. Doing it here would mean fighting the browser for the right to keep an
 * element it has already taken away.
 */
import { prefersReducedMotion } from '../motion/reduced-motion.ts';
import { revealText } from '../motion/text-reveal.ts';

/** Between the control and the near edge of the panel, whichever edge that turns out to be. */
const GAP = 8;

/** The height unrolling. Measured from the reference recording at 225ms. */
const OPEN_MS = 220;

/** A box opening, which is the curve the accordion's panel uses for the same reason. */
const OPEN_EASE = 'cubic-bezier(0.3, 0, 0.2, 1)';

/** Before the first row starts, so the panel is already on its way. */
const RISE_LEAD = 60;

/** And between one row and the next. */
const RISE_STAGGER = 40;

/** How far beyond its place a row starts — above it going down, below it going up. */
const RISE_DISTANCE = 12;

/** A row settling. Slower than its own fade, so it is readable before it has stopped. */
const RISE_MS = 360;
const RISE_EASE = 'cubic-bezier(0.25, 1, 0.5, 1)';

/** The fade is over well before the movement is, which is what the recording measures. */
const FADE_MS = 180;

/** A label arriving word by word: short, and mostly faded in before it has stopped. */
const REVEAL_MS = 260;
const REVEAL_FADE = 0.45;

export type PopoverDirection = 'up' | 'down';

/** What a `popover-choose` event carries: the row that was chosen. */
export type PopoverChoice = { item: HTMLElement };

export type PopoverOptions = {
    gap?: number;
    /** Which way the panel opens. `auto` asks the room around the control. */
    direction?: PopoverDirection | 'auto';
    duration?: number;
    lead?: number;
    stagger?: number;
    /**
     * Called for each `[data-rise]` row as the panel opens, with the delay that row was
     * given. Anything the caller starts from here joins the same cascade.
     */
    onRise?: (row: HTMLElement, delay: number) => void;
    /**
     * A selector, matched inside each rising row: whatever it finds arrives word by word,
     * starting when the row does. It is the one thing enough demos wanted that asking each to
     * write it through `onRise` was asking four of them to agree on two numbers by hand.
     */
    reveal?: string;
};

/** Where a row falls in the cascade. Exported so a caller can line something else up. */
export function riseDelay(index: number, options: PopoverOptions = {}): number {
    const { lead = RISE_LEAD, stagger = RISE_STAGGER } = options;
    return lead + index * stagger;
}

// #region up
/**
 * Which way there is room to open.
 *
 * The question has to be answered while the panel is still hidden — that is what `collapse`
 * below is for — so its height is not knowable yet, and this cannot be a test of whether the
 * panel fits. Asking which side has more room needs nothing but the control's own rectangle,
 * and gives the same answer in every case where the two differ enough to matter.
 *
 * A tie goes downwards, because that is where a menu goes unless something says otherwise.
 */
function roomFor(anchor: HTMLElement, gap: number): PopoverDirection {
    // A menu opened from inside another menu grows the way that one did. A stack that
    // zigzagged would be the room talking rather than the design.
    const outer = anchor.closest<HTMLElement>('[data-direction]');
    if (outer) return outer.dataset.direction as PopoverDirection;

    const box = anchor.getBoundingClientRect();
    const below = document.documentElement.clientHeight - box.bottom - gap;

    return below >= box.top - gap ? 'down' : 'up';
}
// #endregion

/**
 * Against the control, and not off the side of the screen.
 *
 * A popover is positioned like a fixed element, so the control's own viewport rectangle is
 * already in the right coordinates. The panel is pinned by the edge it grows away from — a
 * downward panel by its top, an upward one by its bottom — so that animating the height moves
 * the far edge and leaves the near one against the control.
 *
 * Both edges are written every time. A panel can open one way, be scrolled, and open the
 * other, and an inline `top` left over from last time would fight the `bottom` set this one.
 *
 * `data-side="inline"` puts the panel beside the control instead of under it, which is what a
 * submenu is. It clears the panel the control is *in* rather than the control itself, because
 * a row is as wide as the menu holding it and clearing only the row would land on top of it.
 *
 * The panel's own width is only knowable once it is showing, and this runs both before and
 * after: before, so the panel is never painted where the browser would have put it, and again
 * after, when there is a width to keep inside the screen.
 */
function place(anchor: HTMLElement, panel: HTMLElement, gap: number, to: PopoverDirection): void {
    const box = anchor.getBoundingClientRect();
    const wide = document.documentElement.clientWidth;
    const tall = document.documentElement.clientHeight;
    const width = panel.offsetWidth; // 0 while it is still hidden, which clamps to nothing
    const beside = panel.dataset.side === 'inline';

    // Beside: flush with the anchor's near edge, so the panel and the row line up.
    // Under: clear of it by the gap, so the control stays readable.
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

/**
 * And out again, from the sliver `collapse` left it at to whatever it holds.
 *
 * Both ends are the heights the box actually *renders* at, and neither is a number this could
 * have guessed. `box-sizing: border-box` is on everything, so `height: 0` does not give a box
 * of nothing — a box can never be shorter than its own padding and border, and a panel with
 * twelve pixels of padding renders twenty-six tall however hard it is told not to. Animating
 * from `0` therefore spends the opening under that floor, where nothing moves: the panel sits
 * at its collapsed height for a quarter of the duration and then appears to leap into the fast
 * part of the curve. That is not a dropped frame, it is a curve pointed below the floor.
 *
 * The far end is the same mistake in miniature. `scrollHeight` leaves out the border, so a
 * panel animated to it stops two pixels short and snaps the rest when the animation lets go.
 * `offsetHeight` is the one that counts both.
 */
function unroll(panel: HTMLElement, duration: number): void {
    // Still collapsed, so this is what `height: 0` came to.
    const from = panel.offsetHeight;

    // Measured with the collapse lifted — and put back by the animation's own first
    // keyframe before this task ends, so the full height is never painted either.
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

/** The panel at the top of the chain this one belongs to, or this one if it stands alone. */
function outermost(panel: HTMLElement): HTMLElement {
    let found = panel;
    let above = found.parentElement?.closest<HTMLElement>('[popover]');

    while (above) {
        found = above;
        above = found.parentElement?.closest<HTMLElement>('[popover]');
    }

    return found;
}

// #region choose
/**
 * Choosing a row puts the menus away, and says which row it was.
 *
 * `data-choose` on the row is the whole of it, and it is deliberately opt-in: not every row
 * is a choice. The one that opens a submenu is a route rather than an answer, and closing the
 * menu out from under it would be the opposite of what it is for.
 *
 * What closes is the panel at the top of the chain rather than the one the row sits in. A
 * choice made two menus deep finishes the errand both of them were opened for, and the
 * browser takes the nested ones away with the one that holds them.
 *
 * The event bubbles and carries the row, so an application can hear a choice without knowing
 * which panel it came from or how many were open at the time.
 */
function choose(panel: HTMLElement, item: HTMLElement): void {
    const detail: PopoverChoice = { item };

    panel.dispatchEvent(new CustomEvent('popover-choose', { bubbles: true, detail }));
    outermost(panel).hidePopover();
}
// #endregion

/**
 * A panel's own rows, and not a nested panel's.
 *
 * A submenu lives inside the menu that opens it, which is what makes the two a pair as far as
 * the browser is concerned — so a plain descendant search would hand the outer panel somebody
 * else's rows to bring in as well.
 */
function own(panel: HTMLElement): HTMLElement[] {
    return [...panel.querySelectorAll<HTMLElement>('[data-rise]')].filter((row) => {
        // The nearest panel above the row. Ours unless something else got in between.
        const inner = row.closest('[popover]');
        return inner === panel || !panel.contains(inner);
    });
}

/**
 * Rows arrive from a little beyond their place, fading faster than they settle. An upward panel
 * takes its rows in reverse, so the cascade runs away from the control and the row nearest
 * the button answers first — `index` is a position in that cascade, not in the markup.
 *
 * A label named by `reveal` starts from the row's own delay, so its words are part of the one
 * cascade rather than a second animation that happens to overlap it.
 */
// #region rise
// Reversed going up, so the cascade always runs away from the control — `index` is a position
// in it, not in the markup. A `reveal` label starts from its own row's delay, joining that
// same cascade rather than beginning one of its own.
function raise(panel: HTMLElement, to: PopoverDirection, options: PopoverOptions): void {
    const rows = own(panel);
    const cascade = to === 'up' ? rows.reverse() : rows;
    const from = to === 'up' ? RISE_DISTANCE : -RISE_DISTANCE;

    cascade.forEach((row, index) => {
        const delay = riseDelay(index, options);

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
// #endregion

/**
 * Wires every `[popovertarget]` under `root` to the panel it names.
 *
 * Called once, for a page that keeps its controls — the same shape as `tooltips()`, and for
 * the same reason: nothing here needs taking apart.
 */
export function popovers(root: ParentNode = document, options: PopoverOptions = {}): void {
    const { gap = GAP, duration = OPEN_MS, direction = 'auto' } = options;

    for (const anchor of root.querySelectorAll<HTMLElement>('[popovertarget]')) {
        const panel = document.getElementById(anchor.getAttribute('popovertarget')!);
        if (!panel) continue;

        // Both of these belong on `beforetoggle` rather than on `toggle`, and for one
        // reason: it runs before the panel has been shown, so neither the place the
        // browser would have put it nor the height its contents give it is ever painted.
        panel.addEventListener('beforetoggle', (event) => {
            if ((event as ToggleEvent).newState !== 'open') return;

            const to = direction === 'auto' ? roomFor(anchor, gap) : direction;

            // Written down rather than worked out twice. `toggle` needs the same answer and
            // the stylesheet needs it too, and a question asked twice can be answered twice.
            panel.dataset.direction = to;

            place(anchor, panel, gap, to);
            if (!prefersReducedMotion()) collapse(panel);
        });

        // Its own rows again: a click inside a nested panel bubbles through this one too.
        panel.addEventListener('click', (event) => {
            const item = (event.target as Element).closest<HTMLElement>('[data-choose]');
            if (item && item.closest('[popover]') === panel) choose(panel, item);
        });

        panel.addEventListener('toggle', (event) => {
            const open = (event as ToggleEvent).newState === 'open';
            const to = (panel.dataset.direction ?? 'down') as PopoverDirection;
            if (open) place(anchor, panel, gap, to); // again, now that it has a width

            // What the control is for is the browser's business; what state it is in is
            // ours, and an attribute is the only form of it a stylesheet or an icon can
            // read. Both are watching this one.
            anchor.setAttribute('aria-expanded', String(open));

            if (!open || prefersReducedMotion()) return;

            unroll(panel, duration);
            raise(panel, to, options);
        });
    }
}
