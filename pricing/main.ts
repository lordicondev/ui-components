import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon does.
defineElement();

import { pager } from '@shared/ui/pager.ts';

// Four layouts of the same three cards, behind the dots.
pager();
