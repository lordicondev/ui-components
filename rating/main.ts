import { defineElement, Element } from '@lordicon/element';
import { previewMorph } from '@shared/triggers/preview-morph.ts';

// Triggers have to be registered before defineElement().
// data-chosen is the rating; the icon morphs on it. data-lit is the preview; the icon nudges on it.
Element.defineTrigger('preview-morph', previewMorph('data-chosen', 'data-lit'));

defineElement();

const group = document.querySelector<HTMLFieldSetElement>('.rating')!;
const stars = [...group.querySelectorAll<HTMLElement>('.star')];
const inputs = stars.map((star) => star.querySelector<HTMLInputElement>('.star__input')!);

/** Delay between two stars in the same run. From the reference recording: five frames at 60fps. */
const STEP = 80;

let rating = inputs.findIndex((input) => input.checked) + 1;

/** The star under the pointer, counting from one. Zero when the pointer is elsewhere. */
let hovered = 0;

// Two runs with separate timers. A pointer move cancels the lighting, a new rating cancels
// the filling; sharing one list would let a pointer move cut a fill short.
const lighting: ReturnType<typeof setTimeout>[] = [];
const filling: ReturnType<typeof setTimeout>[] = [];

/**
 * Applies `change` to the stars in `which`, one every STEP, highest index first. Lighting
 * up, the star under the pointer changes first and the run travels back towards one.
 * Emptying, the stars come off the end.
 */
function spread(
    timers: ReturnType<typeof setTimeout>[],
    which: number[],
    change: (at: number) => void,
): void {
    [...which]
        .sort((a, b) => b - a)
        .forEach((at, step) => timers.push(setTimeout(() => change(at), step * STEP)));
}

/**
 * Colours the stars up to the pointer, or up to the rating once the pointer has gone.
 * Lighting up runs one star at a time; going dark happens at once.
 */
function preview(): void {
    const count = hovered || rating;
    for (const timer of lighting.splice(0)) clearTimeout(timer);

    const arriving: number[] = [];
    stars.forEach((star, at) => {
        const lit = at < count;
        if (lit === (star.dataset.lit === 'true')) return;
        if (lit) arriving.push(at);
        else star.dataset.lit = 'false';
    });

    spread(lighting, arriving, (at) => (stars[at].dataset.lit = 'true'));
}

/** Sets the rating. The stars that change shape do so one at a time, from the top down. */
function choose(count: number): void {
    rating = count;
    preview();

    for (const timer of filling.splice(0)) clearTimeout(timer);

    // A star changes when it should be filled but is not, or the other way round.
    const changing = [...stars.keys()].filter(
        (at) => at < count !== (stars[at].dataset.chosen === 'true'),
    );

    spread(filling, changing, (at) => {
        stars[at].dataset.chosen = String(at < count);
    });
}

for (const [at, star] of stars.entries()) {
    star.addEventListener('pointerenter', () => {
        hovered = at + 1;
        preview();
    });
}

group.addEventListener('pointerleave', () => {
    hovered = 0;
    preview();
});

// `change` fires for a click and for an arrow key alike.
group.addEventListener('change', () => {
    const picked = inputs.findIndex((input) => input.checked);
    if (picked >= 0) choose(picked + 1);
});

// A radio cannot be unchecked by clicking it, so clicking the star that is the whole
// rating clears it. Deferred with setTimeout: the label re-checks its radio after this
// listener runs, so unchecking it here would be undone at once.
group.addEventListener('click', (event) => {
    const at = stars.indexOf((event.target as Element).closest('.star')!);
    if (at < 0 || rating !== at + 1) return;

    setTimeout(() => {
        inputs[at].checked = false;
        choose(0);
    });
});
