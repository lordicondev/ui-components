/**
 * @lordicon/element does not augment HTMLElementTagNameMap (verified in 2.3.1: zero
 * occurrences in src/ and dist/), so `document.querySelector('lord-icon')` would type
 * as a plain HTMLElement. One declaration here fixes it for the whole project.
 */
import type { Element as LordIconElement } from '@lordicon/element';

declare global {
    interface HTMLElementTagNameMap {
        'lord-icon': LordIconElement;
    }
}
