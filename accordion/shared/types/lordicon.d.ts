/**
 * `@lordicon/element` does not add `lord-icon` to HTMLElementTagNameMap, so
 * `querySelector('lord-icon')` would type as a plain HTMLElement. This fixes it project-wide.
 */
import type { Element as LordIconElement } from '@lordicon/element';

declare global {
    interface HTMLElementTagNameMap {
        'lord-icon': LordIconElement;
    }
}
