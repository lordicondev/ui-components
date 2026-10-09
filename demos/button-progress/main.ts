// #region setup
import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
defineElement();
// #endregion

import { pager } from '@shared/ui/pager.ts';

const STAGES = ['idle', 'busy', 'done'];

/** How long the pretend transfer takes, how much lands per step, and how long the receipt stays. */
const TRANSFER = 2200;
const STEP = 10;
const RECEIPT = 2000;

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

/**
 * Wires one `.task`: the button, its label strip and its toast. Called for each task on
 * the page; the download and the upload differ only in markup.
 */
function wire(task: HTMLElement): void {
    const button = task.querySelector<HTMLButtonElement>('.task__button')!;
    const strip = task.querySelector<HTMLElement>('.task__lines')!;
    const lines = [...task.querySelectorAll<HTMLElement>('.task__line')];
    const toast = task.querySelector<HTMLElement>('.toast')!;

    // A copy of the first label after the last one, so the strip can wrap forwards.
    strip.append(lines[0].cloneNode(true));

    // #region api
    /**
     * Progress from 0 to 100. An attribute, so anything can drive it: this demo's pretend
     * transfer, a real `onprogress`, or the element inspector. The stylesheet reads
     * `--progress`, because CSS cannot take a number out of an attribute.
     */
    function report(percent: number): void {
        const bounded = Math.min(Math.max(percent, 0), 100);

        button.dataset.progress = String(Math.round(bounded));
        button.style.setProperty('--progress', String(bounded / 100));
    }

    /** Sets the stage: idle, busy or done. The icon, the bar, the label and the toast read it. */
    function enter(stage: string): void {
        button.dataset.stage = stage;
        button.disabled = stage === 'busy';
        button.setAttribute('aria-busy', String(stage === 'busy'));

        say(STAGES.indexOf(stage));
    }
    // #endregion

    // #region says
    /**
     * Slides the label strip to line `at`. The strip only ever moves up. Going back to the
     * first label, it slides on to the copy past the end, then jumps back to the real one
     * with transitions off.
     */
    function say(at: number): void {
        const from = Number(strip.dataset.at ?? 0);
        const to = at === 0 && from > 0 ? lines.length : at;

        strip.dataset.at = String(at);
        strip.style.setProperty('--line', String(to));
        // The first text node only: the busy label ends in animated dots.
        button.setAttribute('aria-label', lines[at].firstChild!.textContent!.trim());

        if (to <= from) return;

        strip.addEventListener(
            'transitionend',
            () => {
                if (to !== lines.length) return;

                strip.dataset.settling = '';
                strip.style.setProperty('--line', '0');
                void strip.offsetWidth; // apply the jump now, while transitions are off
                delete strip.dataset.settling;
            },
            { once: true },
        );
    }
    // #endregion

    // #region run
    /** One press: busy with progress in steps, done, a receipt, then idle again. */
    async function run(): Promise<void> {
        enter('busy');

        for (let percent = STEP; percent <= 100; percent += STEP) {
            report(percent);
            await wait(TRANSFER / (100 / STEP));
        }
        enter('done');

        toast.dataset.shown = 'true'; // the tick plays on this
        await wait(RECEIPT);

        toast.dataset.shown = 'false';
        await wait(200); // let the toast leave before the button resets
        enter('idle');
        report(0);
    }

    button.addEventListener('click', () => void run());
    // #endregion
}

/**
 * Measures each toast's open width once the font has loaded, because CSS cannot
 * transition width to `auto`. A hidden page has no widths, so it is shown for the
 * measurement; nothing paints in between.
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
