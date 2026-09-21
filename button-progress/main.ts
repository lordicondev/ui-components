// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanAttention } from '@shared/triggers/boolean-attention.ts';
import { stageCycle } from '@shared/triggers/stage-cycle.ts';
import { pager } from '@shared/ui/pager.ts';

// The transfer icon reads the stage and does the sequencing itself — loop while the work
// runs, confirm once it has, and only after the loop it was in has come round. The toast's
// tick is the plain case beside it: play once, when it arrives.
Element.defineTrigger('stage-cycle', stageCycle('data-stage'));
Element.defineTrigger('shown-attention', booleanAttention('data-shown'));

defineElement();
// #endregion

const STAGES = ['idle', 'busy', 'done'];

/** How long the pretend transfer takes, how much of it lands at a time, and how long its
 *  receipt stays up. Reporting in steps is the point: a real transfer says where it has
 *  got to now and then, and the stylesheet covers the distance in between. */
const TRANSFER = 2200;
const STEP = 10;
const RECEIPT = 2000;

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

// #region wire
/**
 * Everything one of these buttons does, given nothing but the button.
 *
 * It is called once per `.task` on the page and there are two of them, which is the whole
 * difference between the download and the upload: a different `src`, three different words
 * and one different sentence, all of it in the markup. Nothing below knows which it has.
 */
function wire(task: HTMLElement): void {
    const button = task.querySelector<HTMLButtonElement>('.task__button')!;
    const strip = task.querySelector<HTMLElement>('.task__lines')!;
    const lines = [...task.querySelectorAll<HTMLElement>('.task__line')];
    const toast = task.querySelector<HTMLElement>('.toast')!;

    // The copy that makes the wrap invisible: the strip counts past the last line to a
    // repeat of the first, and is moved back to the real one once it has arrived there.
    strip.append(lines[0].cloneNode(true));
    // #skip

    // #region api
    /**
     * Where the bar is, from 0 to 100. Write it and the fill follows.
     *
     * This is the whole of the progress API and it is an attribute, so it can be set from
     * anywhere — the pretend transfer below, a real one's `onprogress`, or the element
     * inspector. The stylesheet reads `--progress` rather than the attribute, because CSS
     * cannot yet take a number out of one, so the two are kept in step here.
     */
    function report(percent: number): void {
        const bounded = Math.min(Math.max(percent, 0), 100);

        button.dataset.progress = String(Math.round(bounded));
        button.style.setProperty('--progress', String(bounded / 100));
    }

    /** Which of the three things the button is doing. Everything else is downstream. */
    function enter(stage: string): void {
        button.dataset.stage = stage;
        button.disabled = stage === 'busy';
        button.setAttribute('aria-busy', String(stage === 'busy'));

        say(STAGES.indexOf(stage));
    }
    // #endregion

    // #region says
    /**
     * Slide the strip up by one line, whichever way round the change is.
     *
     * Going back to the start is the interesting one: 2 → 0 would slide the words down, and
     * the old line is supposed to leave upwards every time. So the strip keeps counting — a
     * copy of the first line is waiting past the end — and once it has arrived there it is
     * moved back to the real one with the transition switched off, which nobody can see.
     */
    function say(at: number): void {
        const from = Number(strip.dataset.at ?? 0);
        const to = at === 0 && from > 0 ? lines.length : at;

        strip.dataset.at = String(at);
        strip.style.setProperty('--line', String(to));
        // The first text node, not the whole line: the busy one ends in three dots that
        // come and go, and "Uploading dot dot dot" is not what the button is called.
        button.setAttribute('aria-label', lines[at].firstChild!.textContent!.trim());

        if (to <= from) return;

        strip.addEventListener(
            'transitionend',
            () => {
                if (to !== lines.length) return;

                strip.dataset.settling = '';
                strip.style.setProperty('--line', '0');
                void strip.offsetWidth; // take the jump now, while nothing may transition
                delete strip.dataset.settling;
            },
            { once: true },
        );
    }
    // #endregion

    // #region run
    /** One press, one whole cycle. The stages are set here and nothing else is. */
    async function run(): Promise<void> {
        enter('busy');

        for (let percent = STEP; percent <= 100; percent += STEP) {
            report(percent);
            await wait(TRANSFER / (100 / STEP));
        }
        enter('done');

        toast.dataset.shown = 'true'; // its tick draws itself in on this
        await wait(RECEIPT);

        toast.dataset.shown = 'false';
        await wait(200); // let it fall away before the button forgets the whole thing
        enter('idle');
        report(0);
    }

    button.addEventListener('click', () => void run());
    // #endregion
    // #endskip
}
// #endregion

/**
 * How wide each receipt is when it is open. Measured once, after the font, because Figtree
 * is not the width of the fallback it replaces.
 *
 * A hidden page has no width to ask about, so the page is put back for as long as the
 * question takes. Nothing is painted in between — a browser does not stop mid-task to draw
 * — so there is nothing to see, and it beats holding the pager back until the font lands.
 */
async function measure(): Promise<void> {
    await document.fonts.ready;

    for (const toast of document.querySelectorAll<HTMLElement>('.toast')) {
        const page = toast.closest<HTMLElement>('[data-page]')!;
        const away = page.hidden;

        page.hidden = false;
        toast.style.setProperty('--toast-width', `${toast.scrollWidth}px`);
        page.hidden = away;
    }
}

for (const task of document.querySelectorAll<HTMLElement>('.task')) wire(task);

pager();
void measure();
