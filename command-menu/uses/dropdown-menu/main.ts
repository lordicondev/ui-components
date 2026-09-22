// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanAttention } from '@shared/triggers/boolean-attention.ts';
import { HoverFocus } from '@shared/triggers/hover-focus.ts';

// The ⋮ answers being reached, by pointer or by keyboard, which is what `hover-focus` is for.
//
// The rows do not use it, and that is the interesting half. A row in this menu can be reached
// by the mouse or by an arrow key, and `menus()` writes the same `data-active` for both — so
// what the icon watches is the state rather than the device, and one trigger covers a pointer
// crossing the row and a cursor arriving on it from the keyboard.
Element.defineTrigger('hover-focus', HoverFocus);
Element.defineTrigger('active-attention', booleanAttention('data-active'));

defineElement();
// #endregion

import { menus } from '@shared/ui/menu.ts';
import { popovers } from '@shared/ui/popover.ts';

// #region wiring
/*
 * The demo, in full.
 *
 * `popovers()` places the panel, works out which way there is room for it to open, unrolls its
 * height and brings the rows in behind it — and reveals each row's label word by word from the
 * same instant that row starts moving, which is what the selector is for.
 *
 * `menus()` is the arrow keys, and it needs nothing said to it either: the rows it walks are
 * the ones already marked `data-choose`, because a row you can arrow to and a row you can
 * choose are the same row.
 *
 * What happens when you choose one is not here, because nothing does. These commands belong to
 * a file this page does not have; `popovers()` raises `popover-choose` for an application that
 * does, and puts the menu away either way.
 */
popovers(document, { reveal: '[data-reveal]' });
menus();
// #endregion
