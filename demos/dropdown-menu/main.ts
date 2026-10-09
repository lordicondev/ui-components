// #region setup
import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
defineElement();
// #endregion

import { menus } from '@shared/ui/menu.ts';
import { popovers } from '@shared/ui/popover.ts';

// #region wiring
// popovers() places the panel, animates it open and closes it when a data-choose row is
// clicked. menus() walks the same rows with the arrow keys. Choosing a row does nothing
// else here; an application would listen for popover-choose.
popovers(document, { reveal: '[data-reveal]' });
menus();
// #endregion
