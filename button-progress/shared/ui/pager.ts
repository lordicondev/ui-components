/**
 * Dots that switch between the parts of one demo. Demo scaffolding, not a control: it
 * exists so a demo can show three variants of a component without stacking them.
 *
 * Parts carry `data-page`, dots carry `.pager__dot`, both in source order. A hidden page is
 * out of the tab order and the accessibility tree.
 */
export function pager(root: ParentNode = document): (shown: number) => void {
    const pages = [...root.querySelectorAll<HTMLElement>('[data-page]')];
    const dots = [...root.querySelectorAll<HTMLButtonElement>('.pager__dot')];

    const show = (shown: number) => {
        pages.forEach((page, at) => (page.hidden = at !== shown));
        dots.forEach((dot, at) => dot.setAttribute('aria-pressed', String(at === shown)));
    };

    dots.forEach((dot, at) => dot.addEventListener('click', () => show(at)));
    show(0);

    return show;
}
