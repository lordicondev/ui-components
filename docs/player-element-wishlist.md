# What this project still wants from `<lord-icon>`

`@lordicon/element` 3.0 took over what the demos used to build themselves in
`shared/triggers/`: watching an attribute (`follow`), trigger options in the attribute,
teardown through an `AbortSignal`, reduced motion, events and methods on the element,
`intro` that waits for a card to stop moving, exported segment helpers and the
`HTMLElementTagNameMap` entry. What is left:

## Element

- `target` is resolved with `closest()` only, once. A selector for a sibling or an `#id`,
  and re-resolving after DOM changes, would remove some wrapper elements from the demos.
- Changing `loading` after the element is connected does nothing.
- Registered triggers cannot be listed or removed.
