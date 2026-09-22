import { defineElement, Element } from '@lordicon/element';
import { booleanAttention } from '@shared/triggers/boolean-attention.ts';
import { HoverFocus } from '@shared/triggers/hover-focus.ts';

// Triggers have to be registered before defineElement().
// The ⋮ plays on hover or focus. The rows play on data-active, which menus() writes for
// the pointer and the arrow keys alike.
Element.defineTrigger('hover-focus', HoverFocus);
Element.defineTrigger('active-attention', booleanAttention('data-active'));

defineElement();

import { menus } from '@shared/ui/menu.ts';
import { popovers } from '@shared/ui/popover.ts';

// popovers() places the panel, animates it open and closes it when a data-choose row is
// clicked. menus() walks the same rows with the arrow keys. Choosing a row does nothing
// else here; an application would listen for popover-choose.
popovers(document, { reveal: '[data-reveal]' });
menus();
