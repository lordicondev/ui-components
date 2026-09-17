# Alerts

Four kinds of alert, and an icon that greets the card it arrives on.

The first page is a picture of every kind at once. The second is the same card doing its
job: a button queues alerts one at a time, the icon plays as each arrives, and dismissing
one frees the slot it held.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger            | Watches                                  | On              |
| ------------------ | ---------------------------------------- | --------------- |
| `arrival-hover`    | its card arriving, and the pointer on it | the status icon |
| `hover` (built-in) | the pointer on the dismiss button        | the cross       |

`arrival-hover` waits for the card's own entrance animation to finish before it plays, so
the two read as one movement rather than two competing ones. It watches for the card
becoming _visible_ rather than only for the element being created, which is why the icons
play again when you page back to the gallery — a page unhidden is an arrival too.

## The two pages

Both are built from one template and one table of content, so a kind is described once.
The dots at the bottom come from `shared/ui/pager.ts`, the same ones the checkbox list uses.

The button queues four and then rests. Which kind comes next is decided by how many are
already up, so however you empty the queue, the fourth is always the quiet grey one — the
set ends on the calmest thing in it rather than the loudest.

## Worth noticing

The gallery's dismiss buttons answer the pointer and nothing else: the page is there to be
looked at, and a card that could vanish from it would leave a hole with no way back.
Dismissing lives on the second page, where it means something.

Every kind is the same card. A variant changes two colours on it and one on the icon, and
the icon's is an ordinary `color` declaration — `current-color` makes a Lordicon icon
inherit like any other element, so it needs no rule of its own and no colour in a trigger.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/alert), where it sits
alongside the other demos and the triggers it uses.
