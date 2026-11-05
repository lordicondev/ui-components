// #region setup
import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon does.
defineElement();
// #endregion

import { pager } from '@shared/ui/pager.ts';

// Two versions of the same title, behind the dots.
pager();
