/**
 * Rows that scroll without end. A row slows to a stop while the pointer or keyboard focus is
 * on it, so its items can be clicked, and then picks up again. An item that keyboard focus
 * lands on out of view slides into view.
 *
 * Each row's first child is its track. The track's transform reads `--progress`, where 0 to 1
 * is one round, and this module changes `--progress` once a frame. From the CSS it reads
 * `--progress` (where the row starts), `--copies` (how many times the track holds its items)
 * and `--direction` (-1 runs the row the other way). With reduced motion the rows stand still.
 *
 *   marquee(document.querySelectorAll('.row'));
 */
import { prefersReducedMotion } from './reduced-motion.ts';

export type MarqueeOptions = {
    /** Milliseconds per round at full speed. */
    round?: number;
    /** Milliseconds from standing still to full speed when the page loads. */
    start?: number;
    /** Milliseconds from full speed to a stop. */
    stop?: number;
    /** Milliseconds from a stop back to full speed. */
    resume?: number;
};

type Easing = (p: number) => number;

/** Fast start, slow end. */
export const easeOut: Easing = (p) => 1 - (1 - p) ** 3;

/** Slow start, slow end. */
export const easeInOut: Easing = (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2);

/** A slower rate counts as stopped: under a pixel in ten seconds. */
const MIN_RATE = 0.005;

/** The most time one frame may move a row, so a tab brought back does not jump ahead. */
const MAX_STEP = 100;

/** Milliseconds a row takes to slide a focused item into view. */
const SEEK = 400;

const wrap = (n: number) => n - Math.floor(n);

/**
 * The rate part way from `from` to `to`. `progress` is kept within 0 and 1, because a frame
 * can carry a time from just before the change began.
 */
export function rateAt(from: number, to: number, progress: number, easing: Easing): number {
    const rate = from + (to - from) * easing(Math.min(Math.max(progress, 0), 1));
    return rate < MIN_RATE ? 0 : rate;
}

/** Where a row is `elapsed` ms later, wrapped into 0–1. */
export function advance(progress: number, elapsed: number, speed: number, round: number): number {
    return wrap(progress + (speed * elapsed) / round);
}

type Row = {
    track: HTMLElement;
    progress: number;
    direction: number;
    rate: number;
    /** The change of rate under way: stopping, starting, or none. */
    speed: { from: number; to: number; begin: number; duration: number; easing: Easing };
    /** The slide to a focused item, while there is one. */
    seek: { from: number; by: number; to: number; begin: number } | null;
};

export function marquee(
    elements: Iterable<Element>,
    { round = 60_000, start = 1600, stop = 700, resume = 1000 }: MarqueeOptions = {},
): void {
    const still = prefersReducedMotion();
    const seekTime = still ? 0 : SEEK;
    const rows: Row[] = [];

    for (const element of elements) {
        const track = element.firstElementChild;
        if (!(track instanceof HTMLElement)) continue;
        const style = getComputedStyle(track);
        const copies = Number(style.getPropertyValue('--copies')) || 1;
        const row: Row = {
            track,
            progress: wrap(Number(style.getPropertyValue('--progress')) || 0),
            direction: Number(style.getPropertyValue('--direction')) || 1,
            rate: 0,
            speed: {
                from: 0,
                to: still ? 0 : 1,
                begin: performance.now(),
                duration: start,
                easing: easeInOut,
            },
            seek: null,
        };
        rows.push(row);

        let hovered = false;
        let focused = false;
        const retarget = (to: number, duration: number, easing: Easing) => {
            row.speed = { from: row.rate, to, begin: performance.now(), duration, easing };
        };
        const settle = () =>
            hovered || focused || still
                ? retarget(0, stop, easeOut)
                : retarget(1, resume, easeInOut);

        // Slides the row the short way round until `target` is centred, or as near as it can
        // get. Nothing happens if `target` is in view.
        const reveal = (target: Element) => {
            const area = element.getBoundingClientRect();
            const box = target.getBoundingClientRect();
            if (box.left >= area.left && box.right <= area.right) return;
            const offset = box.left - track.getBoundingClientRect().left;
            const goal =
                Math.max(0, offset - (area.width - box.width) / 2) / (track.offsetWidth / copies);
            const to = wrap(goal);
            const by = to - row.progress;
            row.seek = {
                from: row.progress,
                by: by - Math.round(by),
                to,
                begin: performance.now(),
            };
            // Stand still after the slide, or the row would drift off the item.
            row.rate = 0;
            row.speed = { ...row.speed, from: 0, to: 0 };
        };

        // Touch has no hover, so a tap does not stop the row.
        element.addEventListener('pointerenter', (event) => {
            hovered = (event as PointerEvent).pointerType !== 'touch';
            settle();
        });
        element.addEventListener('pointerleave', () => ((hovered = false), settle()));
        element.addEventListener('pointercancel', () => ((hovered = false), settle()));
        element.addEventListener('focusin', (event) => {
            // A click focuses a chip too. Only keyboard focus holds the row.
            const target = event.target as Element;
            focused = target.matches(':focus-visible');
            settle();
            if (focused) reveal(target);
        });
        element.addEventListener('focusout', () => ((focused = false), settle()));
    }

    // #region frame
    // One loop moves every row. A row that is not moving is not written to.
    let last = performance.now();
    const frame = (now: number) => {
        const elapsed = Math.min(Math.max(now - last, 0), MAX_STEP);
        last = now;
        for (const row of rows) {
            const { from, to, begin, duration, easing } = row.speed;
            row.rate = rateAt(from, to, (now - begin) / duration, easing);
            if (row.seek) {
                const p = seekTime
                    ? Math.min(Math.max((now - row.seek.begin) / seekTime, 0), 1)
                    : 1;
                row.progress =
                    p < 1 ? wrap(row.seek.from + row.seek.by * easeInOut(p)) : row.seek.to;
                if (p === 1) row.seek = null;
            } else if (row.rate) {
                row.progress = advance(row.progress, elapsed, row.direction * row.rate, round);
            } else continue;
            row.track.style.setProperty('--progress', row.progress.toFixed(6));
        }
        requestAnimationFrame(frame);
    };
    if (rows.length) requestAnimationFrame(frame);
    // #endregion
}
