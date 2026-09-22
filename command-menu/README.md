# Command menu

A palette you open with ⌘K, type into, and walk with the arrow keys — without the caret ever
leaving the field. Every row's icon plays as the cursor reaches it, and a search that matches
nothing takes the headings away with the rows.

## Run it

```sh
npm install
npm run dev command-menu
```

## Triggers

| Trigger               | Watches                      | On                            |
| --------------------- | ---------------------------- | ----------------------------- |
| `active-attention`    | `data-active` on `.row`      | all seven row icons           |
| `focus-attention`     | `data-focused` on `.field`   | the magnifier                 |
| `clearable-attention` | `data-clearable` on `.field` | the cross, state `in-reveal`  |
| `shown-attention`     | `data-shown` on `.empty`     | the cross-circle, `in-reveal` |

Four names, one trigger: every one of them is `booleanAttention` over a different attribute.
None of them is new, and `scripts/lib/triggers.ts` gained a single line for the whole iteration.

## The cursor is an attribute, not focus

This is the demo that decides the design of `shared/ui/menu.ts`. In a palette the field has to
keep focus — you are still typing — so the thing moving down the list cannot be focus. It is
`aria-activedescendant` on the input, pointing at a row that carries `data-active`.

That costs nothing and buys the part that matters: the same attribute is what the pointer
writes, so an icon watching `data-active` plays for an arrow key and for a mouse alike and
never learns which. The [dropdown menu](../dropdown-menu/) is the same module with the panel
itself as the controller, and it is worth reading the two side by side — the only difference
between a menu and a palette, here, is which element carries `data-keys`.

Home and End are left alone, because in a field they belong to the caret. `menus()` asks
whether its controller is something you type into and stays out of the way if it is.

## ⌘K, and a popover nobody pressed

```ts
document.addEventListener('keydown', (event) => {
    if (event.key !== 'k' || !(event.metaKey || event.ctrlKey)) return;

    event.preventDefault();
    palette.togglePopover();
});
```

`togglePopover()` rather than clicking the button, because the shortcut is not a way of
pressing it: the keystroke means "the palette", and pressing it again means "not the palette".

A popover opened from script has no invoker, which would matter if this one were nested inside
another. It is not — and `popovers()` wired this panel to that button once, at startup, so the
panel still places itself against a button nobody pressed and the button still gets its
`aria-expanded`. The shortcut is announced rather than only drawn, with `aria-keyshortcuts` on
the button.

Inside the portal's frame the shortcut works once the frame has focus, which is a property of
frames rather than of this demo.

## Eleven things arriving in order

`data-rise` is on the field, the three headings and the seven rows, so the panel fills top to
bottom in one run — the headings included, because a heading that stayed still while its own
rows slid in under it would be the one thing on the panel not answering.

That is the longest cascade in the showcase, and worth being honest about: at 40ms apart the
last row starts at 460ms, while the panel itself is at full height by 220. For a few frames
there is a tall panel with its lower half still filling. Every other demo here is short enough
that the two finish together, and this one is not — but the alternative is a second set of
timings for one panel, and the same widget moving two different ways on two pages is worse than
a number being slightly wrong on one of them.

You can type through all of it. The field has focus from the first frame.

## A search of nothing

Three rules and three lines. The rows hide themselves with `hidden` — out of the layout and out
of the accessibility tree are the same question, and `base.css` settles it once. The headings
need no script at all:

```css
.menu__group:not(:has(.row:not([hidden]))),
.commands:not(:has(.row:not([hidden]))) {
    display: none;
}
```

A group whose rows have all gone goes with them, name and all; when every group has gone the
list goes too, because an empty column still takes the panel's gap and a panel that is only a
search box should look like one.

The panel's height then simply follows what is in it — the height is the browser's again once
the opening animation is over. Nothing eases it: a box shrinking over 200ms would still be
moving when the next letter landed. The design draws the empty panel at its full height; this
does not, deliberately, for the same reason the input form's submenu does not.

The empty state needs two words in the markup, `hidden` and `data-shown`, and they are not the
same word twice. `hidden` is whether it is there; `data-shown` is the cross-circle being told
it is its turn, because an element cannot draw itself in out of `display: none`.

## The field, copied for the fourth time

It is the [search bar](../search-bar/)'s, and `fields()` wires it — the settle timer before the
cross draws itself, and the guard that does not call reaching for the clear button a departure.
The look is copied rather than shared, which is now the fourth copy and still the right answer:
a field has no mechanism in CSS the way a popover or a menu does, it is tokens and a
`visibility`, and sharing it would mean sharing a look instead of a part.

One line differs from the search bar's, and the design is why: no border at rest. This field
sits on a panel that already has an edge, so a second one inside it would be a box drawn round
nothing. The border is there and transparent, so the words do not move when focus lights it.

Clearing re-filters for free. `fields()` raises an `input` event by hand when its cross is
pressed, precisely so that whatever the field feeds cannot tell the difference between a field
emptied by its button and one emptied by holding backspace. This is the second demo to depend
on that, and the first was [the input form](../input-form/).

## What this demo does not do

- **Nothing happens when you choose a row**, beyond the palette closing and `popover-choose`
  being raised with the row in it.
- **No typeahead, no fuzzy matching, no ranking.** The filter is a substring test. A real
  palette scores its matches and puts the best first; that is a search problem rather than an
  interface one.
- **No scrolling.** `menus()` does not bring a row into view, because this list is never longer
  than the panel.

## A note for whoever edits this next

Four fragments on this page point into `shared/ui/menu.ts`, `shared/ui/menu.css` and
`shared/ui/field.ts`, and three other demos quote regions of those same files. Editing one
region changes every page that shows it, and no check catches that.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/command-menu), where it sits
alongside the other demos and the triggers it uses.
