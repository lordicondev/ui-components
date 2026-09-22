# Dropdown menu

Five commands under a ⋮, grouped, with one of them in red. Reaching a row plays its icon —
with the pointer or with the arrow keys, through the same attribute either way, which is the
one idea this demo is really about.

## Run it

```sh
npm install
npm run dev dropdown-menu
```

## Triggers

| Trigger            | Watches                 | On                 |
| ------------------ | ----------------------- | ------------------ |
| `hover-focus`      | pointer and keyboard    | the ⋮              |
| `active-attention` | `data-active` on `.row` | all five row icons |

## Hovered and arrowed to are the same state

A menu has two ways in. The pointer crosses a row; the keyboard moves a cursor onto it. They
are different devices and they mean the same thing, so this demo gives them one answer:
`menus()` writes `data-active` on the row whichever of the two moved, and everything that cares
reads that.

The stylesheet cares, in one rule:

```css
.row:hover,
.row[data-active='true'] {
    background: var(--row-hover);
}
```

And the icon cares, through `active-attention` — which is `booleanAttention('data-active')`, the
same factory already behind `focus-attention` and three others. That is the whole of it. No
trigger was written for this demo, and the icon never learns which device moved the cursor.

Getting that wrong is what a menu with keyboard support usually looks like: the mouse lights
one row, the arrow keys light another, and for a moment there are two cursors on screen. Here
there cannot be, because there is only one attribute.

The ⋮ is the exception and keeps `hover-focus`. It is not a row and has no cursor to be under;
it is a control you reach, which is the thing `hover-focus` is named for.

## One tab stop

`role="menu"` on the panel, `role="menuitem"` and `tabindex="-1"` on the rows. That is a menu:
you tab **to** it, not **through** it, and once you are in it the arrows move.

This is the first demo in the repo to do that, and it took a shared module rather than a demo
one because the command palette next door needs the same thing from a different angle — there
the cursor has to move while the caret stays in a search field, which is why `menus()` moves an
attribute and `aria-activedescendant` rather than moving focus. One mechanism covers both. The
[command menu](../command-menu/) is the other half of the story.

Escape, clicking away and the panel's place in the top layer are all still the browser's. The
[notification menu](../notification-menu/) explains why that is worth having.

`menus()` is opt-in, and the two panels that came before this one do not opt in: the
notification menu and the input form are still Tab-only and still say so. Nothing about them
changed, which is the point of putting the arrow keys in a module rather than in `popovers()` —
a panel and a cursor over its rows are two ideas, and a demo can want the first without the
second. Either of them could have it for the cost of `data-keys` and a role.

That said, the input form is the one place this would not simply drop in: a row there can open
a submenu, and the cursor would have to know what to do about that. A right-arrow is the usual
answer and nothing here implements it.

## Everything in the panel is in one cascade

`data-rise` is on the rows **and on the two headings**, so the panel fills itself top to bottom
in one run rather than appearing with its headings already in place and its rows still arriving.
A heading that did not move would be the one thing on the panel not answering, and it is the
largest quiet thing there — it reads as a stutter rather than as stillness.

`popovers()` gives each one 40ms after the one before, starting 60ms in, and hands the row back
its own delay so the label's words start from the same instant. Seven items here, so the last
of them starts at 300ms — near enough the 220ms the panel itself takes that the box and its
contents finish together.

None of those numbers are this demo's. They were measured off the notification menu's reference
recording and every panel in the showcase has used them since.

## The row you cannot undo

```css
.row[data-danger] {
    --row-hover: var(--danger-surface);
    color: var(--danger);
}
```

`--danger` is already `#DC2626`, the red the design draws, so no colour is written here. And
because the icon carries `current-color`, the trash bin takes the colour from the words beside
it — the stylesheet never mentions an icon, and nothing about the row is coloured twice.

The hover fill goes with it, a tenth of the same red rather than the grey every other row uses.
A warning that turns grey at the moment you reach for it is a warning taking it back.

The row has no heading over it either. The other five sit under Edit and Share; this one
belongs to no group, and the space above it says so more quietly than a rule would.

## Nothing says which way it opens

`popovertarget` and nothing else. `popovers()` measures the room around the button and pins the
edge the panel grows away from, so the same markup lower down a window opens upward — which is
what the [input form](../input-form/) is, from this demo's point of view.

## What this demo does not do

- **Nothing happens when you choose a row.** These commands belong to a file this page does not
  have. `popovers()` raises a bubbling `popover-choose` carrying the row, and closes the menu;
  an application would listen for that.
- **No typeahead.** Pressing `d` does not jump to Duplicate or Delete. It is a real menu
  behaviour and a real omission; `menus()` is where it would go.
- **No submenu.** The input form has one, off the same module.

## A note for whoever edits this next

Four fragments on this page point into `shared/ui/menu.css`, `shared/ui/menu.ts` and
`shared/ui/popover.ts`. Three other demos quote regions of those same files. Editing one region
changes every page that shows it, and no check catches that — read the regenerated portal pages
after a change, not just the diff.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/dropdown-menu), where it sits
alongside the other demos and the triggers it uses.
