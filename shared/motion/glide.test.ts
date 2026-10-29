import { describe, expect, it } from 'vitest';
import { easeInOut, easeOut } from './glide.ts';

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
