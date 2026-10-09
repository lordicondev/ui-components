// #region setup
import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
defineElement();
// #endregion

import { fields } from '@shared/ui/field.ts';

// fields() writes the two attributes the icons watch. That module is the whole demo.
fields();
