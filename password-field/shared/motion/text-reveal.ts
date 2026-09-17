/**
 * Text that arrives word by word and leaves in one piece.
 *
 * The two directions are deliberately not mirror images. Arriving, the block stays where it
 * is and its words fade in as a wave — several are always in flight, so the eye reads a
 * gradient rather than a queue. Leaving, nothing fades: the block slides down as one and
 * whatever box is closing over it does the hiding, which keeps every word legible right up
 * to the edge it disappears under.
 *
 * The caller owns that box. This module only moves the text inside it.
 */
import { prefersReducedMotion } from './reduced-motion.ts';

/** First word starting to last word finished. Fixed, whatever the word count. */
const REVEAL_MS = 500;

/**
 * Share of the run one word spends fading. It is the only knob that matters, and it trades
 * two qualities against each other: raise it and the trailing edge is a longer, softer
 * dissolve; lower it and the stagger stretches, so the tail keeps moving for longer but
 * the words start arriving one at a time instead of melting in.
 *
 * The width is a proportion, not a count, so the same share is denser on a long paragraph
 * than a short one — about seven words in flight across twenty, four across ten. Far below
 * this and the short ones stop being a wave and become a queue.
 */
const FADE_SHARE = 0.3;

const CONCEAL_MS = 300;

/** Far enough that the words are clearly leaving, short enough to stay under the clip. */
const CONCEAL_DISTANCE = 32;

const MOVE_EASING = 'cubic-bezier(0.3, 0, 0.2, 1)';

export type RevealOptions = {
    duration?: number;
    fadeShare?: number;
    easing?: string;
};

export type ConcealOptions = {
    duration?: number;
    /** Pixels, downwards. */
    distance?: number;
    easing?: string;
};

/**
 * Wraps every word of `element` in its own span, leaving the markup around them alone.
 *
 * Walking text nodes rather than rewriting innerHTML means a link or a <strong> inside the
 * paragraph survives; a word split across such a boundary simply becomes two spans, which
 * nobody can see because only opacity is ever animated. The spans stay inline — inline-block
 * would change line breaking and the baseline, and opacity needs neither.
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
        // The capturing split keeps the whitespace, so line breaks and copied text are
        // exactly what they were before.
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
 * Stops whatever this block has running and hands it back to the stylesheet.
 *
 * Scoped to the block and its own words on purpose: getAnimations({ subtree: true }) on an
 * ancestor would also cancel the height animation of the panel doing the clipping.
 */
export function settleText(element: HTMLElement): void {
    for (const animation of element.getAnimations()) animation.cancel();

    for (const word of element.querySelectorAll<HTMLElement>('[data-word]')) {
        for (const animation of word.getAnimations()) animation.cancel();
    }
}

// #region wave
/**
 * Words fade in one after another, each starting before the one ahead has finished. The
 * run always takes `duration`: more words tighten the stagger rather than lengthen the run.
 */
export function revealText(element: HTMLElement, options: RevealOptions = {}): Animation[] {
    const { duration = REVEAL_MS, fadeShare = FADE_SHARE, easing = 'ease-out' } = options;

    const words = splitWords(element);
    settleText(element);
    if (prefersReducedMotion()) return [];

    // A lone word has nothing to wave against, so it just takes the run.
    const solo = words.length < 2;
    const fade = solo ? duration : duration * fadeShare;
    const step = solo ? 0 : (duration - fade) / (words.length - 1);

    return words.map((word, index) =>
        // `backwards` holds a word invisible through its delay; no forwards fill means
        // a finished wave leaves nothing to undo.
        word.animate(
            { opacity: [0, 1] },
            { duration: fade, delay: index * step, easing, fill: 'backwards' },
        ),
    );
}
// #endregion

/**
 * Sends the block down as one, without fading it. The words stay at full ink and are cut
 * off by the caller's box, so none of them is ever painted outside it.
 */
export function concealText(element: HTMLElement, options: ConcealOptions = {}): Animation | null {
    const { duration = CONCEAL_MS, distance = CONCEAL_DISTANCE, easing = MOVE_EASING } = options;

    settleText(element);
    if (prefersReducedMotion()) return null;

    // Forwards, because the text has to stay down until the box has finished closing. The
    // next reveal cancels it on its way in.
    return element.animate(
        { transform: ['translateY(0)', `translateY(${distance}px)`] },
        { duration, easing, fill: 'forwards' },
    );
}
