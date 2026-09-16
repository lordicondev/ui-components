/** Watches one attribute and returns the teardown. */
export function observeAttribute(
    element: HTMLElement,
    attribute: string,
    onChange: () => void,
): () => void {
    const observer = new MutationObserver(onChange);
    observer.observe(element, { attributes: true, attributeFilter: [attribute] });
    return () => observer.disconnect();
}
