import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tooltips } from './tooltip.ts';

/** Two named controls, wired, and helpers to move a pointer between them. */
function shelf(...names: string[]) {
    const anchors = names.map((text) => {
        const button = document.createElement('button');
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        button.append(tooltip);
        document.body.append(button);
        return button;
    });

    tooltips();

    const enter = (anchor: HTMLElement) => anchor.dispatchEvent(new Event('pointerenter'));
    const leave = (anchor: HTMLElement) => anchor.dispatchEvent(new Event('pointerleave'));
    const escape = () =>
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    const drawn = () => anchors.filter((anchor) => anchor.hasAttribute('data-tip')).length;

    return { anchors, enter, leave, escape, drawn };
}

beforeEach(() => {
    vi.useFakeTimers();
    document.body.replaceChildren();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('tooltips', () => {
    it('makes a pointer wait before drawing a name', () => {
        const { anchors, enter } = shelf('Brush');

        enter(anchors[0]);
        vi.advanceTimersByTime(200);
        expect(anchors[0].hasAttribute('data-tip')).toBe(false);

        vi.advanceTimersByTime(400);
        expect(anchors[0].hasAttribute('data-tip')).toBe(true);
    });

    it('draws the next one at once while the row is warm', () => {
        const { anchors, enter, leave } = shelf('Brush', 'Fill');

        enter(anchors[0]);
        vi.advanceTimersByTime(600);
        leave(anchors[0]);

        enter(anchors[1]);
        vi.advanceTimersByTime(1);
        expect(anchors[1].hasAttribute('data-tip')).toBe(true);
    });

    it('goes back to waiting once the row has gone cold', () => {
        const { anchors, enter, leave } = shelf('Brush', 'Fill');

        enter(anchors[0]);
        vi.advanceTimersByTime(600);
        leave(anchors[0]);
        vi.advanceTimersByTime(1000);

        enter(anchors[1]);
        vi.advanceTimersByTime(200);
        expect(anchors[1].hasAttribute('data-tip')).toBe(false);
    });

    it('forgets a name the pointer left before it arrived', () => {
        const { anchors, enter, leave } = shelf('Brush');

        enter(anchors[0]);
        vi.advanceTimersByTime(200);
        leave(anchors[0]);

        vi.advanceTimersByTime(1000);
        expect(anchors[0].hasAttribute('data-tip')).toBe(false);
    });

    it("leaves one control without taking another one's name away", () => {
        const { anchors, enter, leave } = shelf('Brush', 'Fill');

        enter(anchors[1]);
        vi.advanceTimersByTime(600);
        expect(anchors[1].hasAttribute('data-tip')).toBe(true);

        // Clicking the second button blurs the first while the second's tooltip is up.
        leave(anchors[0]);
        expect(anchors[1].hasAttribute('data-tip')).toBe(true);
    });

    it('never draws two at once', () => {
        const { anchors, enter, drawn } = shelf('Brush', 'Fill');

        enter(anchors[0]);
        vi.advanceTimersByTime(600);
        enter(anchors[1]);
        vi.advanceTimersByTime(600);

        expect(drawn()).toBe(1);
        expect(anchors[1].hasAttribute('data-tip')).toBe(true);
    });

    it('puts a name away on Escape, and keeps it away until the pointer moves on', () => {
        const { anchors, enter, leave, escape } = shelf('Brush');

        enter(anchors[0]);
        vi.advanceTimersByTime(600);
        escape();
        expect(anchors[0].hasAttribute('data-tip')).toBe(false);

        // Still on the control: still dismissed.
        enter(anchors[0]);
        vi.advanceTimersByTime(600);
        expect(anchors[0].hasAttribute('data-tip')).toBe(false);

        // Shown again once the pointer has left and come back.
        leave(anchors[0]);
        enter(anchors[0]);
        vi.advanceTimersByTime(600);
        expect(anchors[0].hasAttribute('data-tip')).toBe(true);
    });
});
