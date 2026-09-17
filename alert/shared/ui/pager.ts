/**
 * Dots that page between the parts of one demo.
 *
 * Some controls have more to say than fits in a single picture — three styles of the same
 * checkbox, an alert list and the thing that fills it. Rather than stack them all and let
 * the demo sprawl, each part gets a page and the dots move between them.
 *
 * Convention over configuration: the parts carry `data-page`, the dots carry `.pager__dot`
 * in source order. Hiding a page takes its controls out of the tab order and out of the
 * accessibility tree with it, so only the page on screen can be reached.
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
