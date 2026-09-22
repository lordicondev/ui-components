import { defineElement, Element } from '@lordicon/element';
import { booleanAttention } from '@shared/triggers/boolean-attention.ts';

// Triggers have to be registered before defineElement().
// The same trigger on two attributes: the magnifier plays when the field is focused, the
// cross when there is something to clear.
Element.defineTrigger('focus-attention', booleanAttention('data-focused'));
Element.defineTrigger('clearable-attention', booleanAttention('data-clearable'));

defineElement();

import { fields } from '@shared/ui/field.ts';

// fields() writes the two attributes the icons watch. That module is the whole demo.
fields();
