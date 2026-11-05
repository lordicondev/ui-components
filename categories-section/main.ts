import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers.
defineElement();

import { marquee } from '@shared/motion/marquee.ts';

// Scrolls the rows. A row stops under the pointer, so a chip can be clicked.
marquee(document.querySelectorAll('.row'));
