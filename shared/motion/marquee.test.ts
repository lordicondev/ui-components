import { describe, expect, it } from 'vitest';
import { advance, easeInOut, easeOut, rateAt } from './marquee.ts';

describe('easing', () => {
    it.each([easeOut, easeInOut])('runs from 0 to 1', (easing) => {
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
    });

    it.each([easeOut, easeInOut])('never goes back', (easing) => {
        let last = 0;
        for (let p = 0.05; p <= 1; p += 0.05) {
            expect(easing(p)).toBeGreaterThanOrEqual(last);
            last = easing(p);
        }
    });

    it('easeOut is quick at first and easeInOut is slow at first', () => {
        expect(easeOut(0.2)).toBeGreaterThan(0.4);
        expect(easeInOut(0.2)).toBeLessThan(0.1);
    });
});

describe('rateAt', () => {
    it('runs from the first rate to the second', () => {
        expect(rateAt(1, 0, 0, easeOut)).toBe(1);
        expect(rateAt(1, 0, 1, easeOut)).toBe(0);
        expect(rateAt(0, 1, 1, easeInOut)).toBe(1);
    });

    it('never runs backwards, even when the frame is earlier than the start', () => {
        expect(rateAt(0, 1, -0.02, easeInOut)).toBe(0);
        expect(rateAt(1, 0, -0.02, easeOut)).toBe(1);
        expect(rateAt(0, 1, 1.5, easeInOut)).toBe(1);
    });

    it('counts a crawl as stopped', () => {
        for (let p = 0; p <= 1; p += 0.001) {
            const rate = rateAt(1, 0, p, easeOut);
            expect(rate === 0 || rate >= 0.005).toBe(true);
        }
    });
});

describe('advance', () => {
    it('moves by the share of a round that has passed', () => {
        expect(advance(0, 15_000, 1, 60_000)).toBeCloseTo(0.25);
        expect(advance(0.5, 6_000, 0.5, 60_000)).toBeCloseTo(0.55);
    });

    it('wraps past the end and below the start', () => {
        expect(advance(0.9, 12_000, 1, 60_000)).toBeCloseTo(0.1);
        expect(advance(0.1, 12_000, -1, 60_000)).toBeCloseTo(0.9);
    });

    it('stays put at rate 0', () => {
        expect(advance(0.3, 16, 0, 60_000)).toBe(0.3);
    });
});
