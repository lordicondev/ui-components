// #region setup
import { defineElement, Element } from '@lordicon/element';
import { previewMorph } from '@shared/triggers/preview-morph.ts';

// Two attributes, because a star has two things to say: what the rating is, and what it
// would be if you clicked. The trigger morphs on the first and nudges on the second.
Element.defineTrigger('preview-morph', previewMorph('data-chosen', 'data-lit'));

defineElement();
// #endregion

const group = document.querySelector<HTMLFieldSetElement>('.rating')!;
const stars = [...group.querySelectorAll<HTMLElement>('.star')];
const inputs = stars.map((star) => star.querySelector<HTMLInputElement>('.star__input')!);

/** How far apart two stars in the same run start. Measured off the reference recording:
 *  five frames at 60 fps, and the same number for the highlight and for the fill. */
const STEP = 80;

let rating = inputs.findIndex((input) => input.checked) + 1;

/** Which star the pointer is on, counting from one — or zero when it is nowhere near. */
let hovered = 0;

/**
 * Two runs, and a list of timers each. They are cancelled separately: a pointer moving
 * during a fill must not take the rest of that fill away with it, which is how a row ends
 * up with holes — filled at one and four, and nothing in between.
 */
const lighting: ReturnType<typeof setTimeout>[] = [];
const filling: ReturnType<typeof setTimeout>[] = [];

// #region runs
/**
 * Applies `change` to the stars in `which`, one every STEP, from the right — so a row
 * answers as a run rather than as a flash.
 *
 * Every run here goes that way, and for the same reason both times: the star that has to
 * change first is the rightmost one that has to change at all. Lighting up, that is the
 * star you are pointing at, and the run travels back towards one. Emptying, it is the top
 * of the old rating, and stars come off the end as the rating falls.
 *
 * Stars that already agree never reach this list, which keeps them still and keeps the run
 * as short as the change actually is.
 */
function spread(
    timers: ReturnType<typeof setTimeout>[],
    which: number[],
    change: (at: number) => void,
): void {
    which
        .sort((a, b) => b - a)
        .forEach((at, step) => timers.push(setTimeout(() => change(at), step * STEP)));
}
// #endregion

// #region preview
/**
 * Colour what the row is promising: the star under the pointer and everything left of it,
 * or the rating itself once the pointer has gone. The one you are on answers first and the
 * rest follow leftwards, each a step behind the last.
 *
 * Taking the promise back is not an event: those stars go dark at once, with no run and no
 * animation, because nothing is being offered — only withdrawn.
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
// #endregion

// #region choose
/**
 * Settle on a rating. Five icons morphing at once is a flash rather than a movement, so
 * the change runs: upwards it fills towards the star you pressed, downwards the stars come
 * off the end one at a time. The colour is left to `preview`, which says the same thing.
 */
function choose(count: number): void {
    rating = count;
    preview();

    for (const timer of filling.splice(0)) clearTimeout(timer);

    const changing = [...stars.keys()].filter(
        (at) => at < count !== (stars[at].dataset.chosen === 'true'),
    );

    spread(filling, changing, (at) => {
        stars[at].dataset.chosen = String(at < count);
    });
}
// #endregion

// #region wiring
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

// Arrow keys move a radio group's choice as surely as a click does, so both arrive here.
group.addEventListener('change', () => {
    const picked = inputs.findIndex((input) => input.checked);
    if (picked >= 0) choose(picked + 1);
});

// A radio cannot be unchecked by clicking it again, so on its own the group can be taken
// down to one star but never back to none. Pressing the star that is already the whole
// rating clears it.
//
// Deciding is immediate; acting waits for the click to finish. A label re-checks its radio
// on the way out, after this listener has run, so a radio unchecked here and now is checked
// straight back again a moment later.
group.addEventListener('click', (event) => {
    const at = stars.indexOf((event.target as Element).closest('.star')!);
    if (at < 0 || rating !== at + 1) return;

    setTimeout(() => {
        inputs[at].checked = false;
        choose(0);
    });
});
// #endregion
