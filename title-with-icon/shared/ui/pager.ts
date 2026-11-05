/**
 * Dots and two arrows that switch between the parts of one demo. Demo scaffolding, not a
 * control: it exists so a demo can show three variants of a component without stacking them.
 *
 * Parts carry `data-page`, dots carry `.pager__dot`, both in source order. The arrows are
 * `.pager__step` with `data-step="-1"` or `"1"`; an arrow with nowhere to go is disabled.
 * A hidden page is out of the tab order and the accessibility tree.
 */
export function pager(root: ParentNode = document): (shown: number) => void {
    const pages = [...root.querySelectorAll<HTMLElement>('[data-page]')];
    const dots = [...root.querySelectorAll<HTMLButtonElement>('.pager__dot')];
    const steps = [...root.querySelectorAll<HTMLButtonElement>('.pager__step')];
    let at = 0;

    const show = (shown: number) => {
        at = shown;
        pages.forEach((page, index) => (page.hidden = index !== shown));
        dots.forEach((dot, index) => dot.setAttribute('aria-pressed', String(index === shown)));
        for (const step of steps) {
            const next = shown + Number(step.dataset.step);
            step.disabled = next < 0 || next >= pages.length;
        }
    };

    dots.forEach((dot, index) => dot.addEventListener('click', () => show(index)));
    steps.forEach((step) => {
        step.addEventListener('click', () => {
            show(at + Number(step.dataset.step));
            // A disabled button drops focus, so hand it to the arrow that still works.
            if (step.disabled) steps.find((other) => !other.disabled)?.focus();
        });
    });
    show(0);

    return show;
}
