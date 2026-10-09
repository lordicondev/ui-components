import { beforeEach, describe, expect, it } from 'vitest';
import { withReducedMotion } from '../triggers/testing/reduced-motion.ts';
import { concealText, revealText, settleText, splitWords } from './text-reveal.ts';

function block(html: string): HTMLElement {
    const element = document.createElement('p');
    element.innerHTML = html;
    document.body.append(element);
    return element;
}

function sentence(count: number): HTMLElement {
    return block(Array.from({ length: count }, (_, index) => `word${index}`).join(' '));
}

/** happy-dom rejects `finished` on cancel; observing it avoids unhandled rejections. */
function quiet<T extends Animation | Animation[]>(animations: T): T {
    for (const animation of [animations].flat()) animation.finished.catch(() => {});
    return animations;
}

/** A word's animation timing. */
function timing(animation: Animation) {
    const { delay, duration } = animation.effect!.getTiming();
    return { delay: delay!, duration: duration as number };
}

beforeEach(() => {
    document.body.replaceChildren();
});

describe('splitWords', () => {
    it('leaves the text exactly as it was', () => {
        const element = block('Go to Settings and click "Reset password".');
        const before = element.textContent;

        splitWords(element);

        expect(element.textContent).toBe(before);
        expect(element.querySelectorAll('[data-word]')).toHaveLength(7);
    });

    it('keeps the markup around the words', () => {
        const element = block('a <strong>bold</strong> claim');

        splitWords(element);

        expect(element.querySelector('strong')).not.toBeNull();
        expect(element.querySelector('strong')!.textContent).toBe('bold');
        expect(element.textContent).toBe('a bold claim');
    });

    it('wraps once, however often it is asked', () => {
        const element = sentence(5);

        splitWords(element);
        const again = splitWords(element);

        expect(again).toHaveLength(5);
        expect(element.querySelectorAll('[data-word] [data-word]')).toHaveLength(0);
    });
});

describe('revealText', () => {
    it('fills the run from the first word to the last', () => {
        const animations = revealText(sentence(8), { duration: 500 });
        const first = timing(animations[0]);
        const last = timing(animations.at(-1)!);

        expect(first.delay).toBe(0);
        expect(last.delay + last.duration).toBeCloseTo(500);
    });

    it('takes the same time whatever the word count', () => {
        for (const count of [2, 5, 50]) {
            const last = timing(revealText(sentence(count), { duration: 500 }).at(-1)!);
            expect(last.delay + last.duration).toBeCloseTo(500);
        }
    });

    it('keeps several words in flight at once', () => {
        const animations = revealText(sentence(19), { duration: 500 });
        const { duration } = timing(animations[0]);
        const step = timing(animations[1]).delay;

        // The fade has to outlast the stagger several times over to read as a wave.
        // The exact share is tuned by eye, so this guards a band, not a value.
        const inFlight = duration / step;
        expect(inFlight).toBeGreaterThan(4);
        expect(inFlight).toBeLessThan(12);
    });

    it('gives a lone word the whole run and no wait', () => {
        const [only] = revealText(sentence(1), { duration: 500 });

        expect(timing(only)).toEqual({ delay: 0, duration: 500 });
    });

    it('holds the whole wave back by the delay, without stretching it', () => {
        const animations = revealText(sentence(8), { duration: 500, delay: 100 });
        const first = timing(animations[0]);
        const last = timing(animations.at(-1)!);

        expect(first.delay).toBe(100);
        expect(last.delay + last.duration).toBeCloseTo(600);
    });
});

describe('concealText', () => {
    it('moves the block down without touching its ink', () => {
        const element = sentence(4);

        const slide = concealText(element, { distance: 32 })!;
        const [from, to] = (slide.effect as KeyframeEffect).getKeyframes();

        expect(from.transform).toBe('translateY(0)');
        expect(to.transform).toBe('translateY(32px)');
        expect(from.opacity).toBeUndefined();
    });

    it('drops a half-finished wave so the words leave at full ink', () => {
        const element = sentence(6);
        const wave = quiet(revealText(element));

        concealText(element);

        expect(wave.every((animation) => animation.playState === 'idle')).toBe(true);
    });
});

describe('settleText', () => {
    it('clears the slide the conceal left behind', () => {
        const element = sentence(3);
        const slide = quiet(concealText(element)!);

        settleText(element);

        expect(slide.playState).toBe('idle');
    });

    it('leaves the panel around it alone', () => {
        const panel = document.createElement('div');
        const element = sentence(3);
        panel.append(element);
        document.body.append(panel);
        const height = panel.animate({ height: ['0px', '80px'] }, { duration: 300 });

        settleText(element);

        expect(height.playState).toBe('running');
    });
});

describe('with reduced motion', () => {
    it('splits the words but animates nothing', () => {
        const restore = withReducedMotion(true);
        const element = sentence(5);

        try {
            expect(revealText(element)).toEqual([]);
            expect(concealText(element)).toBeNull();
            expect(element.querySelectorAll('[data-word]')).toHaveLength(5);
        } finally {
            restore();
        }
    });
});
