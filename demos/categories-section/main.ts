// #region setup
import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers.
defineElement();
// #endregion

import { glide } from '@shared/motion/glide.ts';

// Each row eases in on load, and to a stop under the pointer or keyboard focus, so a chip
// can be clicked. It speeds up again afterwards.
glide(document.querySelectorAll('.row'));
