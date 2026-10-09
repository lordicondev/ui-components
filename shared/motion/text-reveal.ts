/**
 * Text that arrives word by word and leaves in one piece.
 *
 * `revealText()` fades the words in as a wave: several are in flight at once. `concealText()`
 * slides the whole block down without fading; the box around it is expected to clip it.
 * This module only moves the text, the caller owns the box.
 */
import { prefersReducedMotion } from './reduced-motion.ts';

/** First word starting to last word finished, whatever the word count. */
const REVEAL_MS = 500;

/**
 * How much of the run one word spends fading. Higher means a softer, more overlapping wave;
 * lower means words arrive more one at a time.
 */
const FADE_SHARE = 0.3;

const FADE_EASE = 'ease-out';

const CONCEAL_MS = 300;

/** Pixels the block travels down. Enough to read as leaving, short enough to stay clipped. */
const CONCEAL_DISTANCE = 32;

const MOVE_EASING = 'cubic-bezier(0.3, 0, 0.2, 1)';

export type RevealOptions = {
    duration?: number;
    fadeShare?: number;
    easing?: string;
    /** Wait before the first word, for text arriving into a box that is still opening. */
    delay?: number;
};

export type ConcealOptions = {
    duration?: number;
    /** Pixels, downwards. */
    distance?: number;
    easing?: string;
};

/**
 * Wraps every word of `element` in its own span. Walks text nodes rather than rewriting
 * innerHTML, so inline markup inside the paragraph survives. Runs once; later calls return
 * the spans already there.
 */
export function splitWords(element: HTMLElement): HTMLElement[] {
    const already = element.querySelectorAll<HTMLElement>('[data-word]');
    if (already.length) return [...already];

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const texts: Text[] = [];
    while (walker.nextNode()) texts.push(walker.currentNode as Text);

    for (const text of texts) {
        if (!text.data.trim()) continue;

        const pieces = document.createDocumentFragment();
        // The capturing split keeps the whitespace, so copied text reads as before.
        for (const part of text.data.split(/(\s+)/)) {
            if (!part) continue;

            if (!part.trim()) {
                pieces.append(part);
                continue;
            }

            const word = document.createElement('span');
            word.dataset.word = '';
            word.textContent = part;
            pieces.append(word);
        }

        text.replaceWith(pieces);
    }

    return [...element.querySelectorAll<HTMLElement>('[data-word]')];
}

/**
 * Cancels whatever this block and its words have running. Scoped on purpose: a subtree
 * search from an ancestor would also cancel the box's own animation.
 */
export function settleText(element: HTMLElement): void {
    for (const animation of element.getAnimations()) animation.cancel();

    for (const word of element.querySelectorAll<HTMLElement>('[data-word]')) {
        for (const animation of word.getAnimations()) animation.cancel();
    }
}

/**
 * Fades the words in one after another. The run always takes `duration`; more words mean
 * a tighter stagger.
 */
export function revealText(element: HTMLElement, options: RevealOptions = {}): Animation[] {
    const { duration = REVEAL_MS, fadeShare = FADE_SHARE, easing = FADE_EASE, delay = 0 } = options;

    const words = splitWords(element);
    settleText(element);
    if (prefersReducedMotion()) return [];

    const solo = words.length < 2;
    const fade = solo ? duration : duration * fadeShare;
    const step = solo ? 0 : (duration - fade) / (words.length - 1);

    return words.map((word, index) =>
        // `backwards` keeps a word invisible through its delay. No forwards fill, so a
        // finished wave leaves nothing to undo.
        word.animate(
            { opacity: [0, 1] },
            { duration: fade, delay: delay + index * step, easing, fill: 'backwards' },
        ),
    );
}

/**
 * Slides the block down as one, without fading. Fills forwards so the text stays down
 * until the box has closed; the next reveal cancels it.
 */
export function concealText(element: HTMLElement, options: ConcealOptions = {}): Animation | null {
    const { duration = CONCEAL_MS, distance = CONCEAL_DISTANCE, easing = MOVE_EASING } = options;

    settleText(element);
    if (prefersReducedMotion()) return null;

    return element.animate(
        { transform: ['translateY(0)', `translateY(${distance}px)`] },
        { duration, easing, fill: 'forwards' },
    );
}
