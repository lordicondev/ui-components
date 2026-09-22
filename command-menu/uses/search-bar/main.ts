// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanAttention } from '@shared/triggers/boolean-attention.ts';

// The same trigger twice, on two attributes and for two different reasons. The magnifier
// answers the cursor arriving; the cross answers there being something to clear. Neither
// is a state the icon holds afterwards — both are the icon saying "that happened".
Element.defineTrigger('focus-attention', booleanAttention('data-focused'));
Element.defineTrigger('clearable-attention', booleanAttention('data-clearable'));

defineElement();
// #endregion

import { fields } from '@shared/ui/field.ts';

/*
 * And that is the demo. The two attributes the icons are watching are written by `fields()`,
 * which is the field this page is about — the settle timer that waits for the keyboard, the
 * guard that does not call reaching for the clear button a departure, and the clear itself.
 * The blocks below are that module, shown here because they are what there is to read.
 */
fields();
