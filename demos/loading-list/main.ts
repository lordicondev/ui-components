// #region setup
import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
defineElement();
// #endregion

// #region api
type Status = 'pending' | 'active' | 'done' | 'failed';

const SAID: Record<Status, string> = {
    pending: 'Waiting',
    active: 'In progress',
    done: 'Done',
    failed: 'Failed',
};

/**
 * Sets the status of one step. This is the whole API: the icons and colours follow
 * data-status, and the hidden text says the same to a screen reader.
 */
function setStatus(step: HTMLElement, status: Status): void {
    step.dataset.status = status;
    step.querySelector('.step__said')!.textContent = SAID[status];
}
// #endregion

// A made-up process: how long each step takes, and one that fails the first time.
const jobs = [
    { id: 'upload', takes: 1800, fails: false },
    { id: 'validate', takes: 1600, fails: false },
    { id: 'optimize', takes: 2000, fails: false },
    { id: 'preview', takes: 2300, fails: true },
    { id: 'finish', takes: 1200, fails: false },
];

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

// #region scenario
/** Runs the jobs from `from` on, and stops at a failure to offer a retry. */
async function run(from: number): Promise<void> {
    for (let at = from; at < jobs.length; at++) {
        const job = jobs[at];
        const step = document.getElementById(`step-${job.id}`)!;

        setStatus(step, 'active');
        await wait(job.takes);

        if (job.fails) {
            job.fails = false; // the retry goes through
            setStatus(step, 'failed');
            offerRetry(step, at);
            return;
        }
        setStatus(step, 'done');
    }
}
// #endregion

// #region retry
/** Shows the step's Retry button. A press hides it and runs again from that step. */
function offerRetry(step: HTMLElement, at: number): void {
    const retry = step.querySelector<HTMLButtonElement>('.step__retry')!;
    retry.hidden = false;
    retry.addEventListener(
        'click',
        () => {
            retry.hidden = true;
            void run(at);
        },
        { once: true },
    );
}
// #endregion

setTimeout(() => void run(0), 600);
