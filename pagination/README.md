# Pagination

Four pages, two steps, and a frame that does not travel the way you would expect. Pick a
page and the frame stretches until it touches it, and only then does the edge it left
behind come after it. Three rows show the same control with three kinds of button.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger           | Watches              | On                             |
| ----------------- | -------------------- | ------------------------------ |
| `press-attention` | a `click` on `.step` | the arrow, state `hover-slide` |
| `press-attention` | a `click` on `.step` | the chevron, its default state |

The same trigger the menu bar uses, and for the same reason: nothing about a step button is
different once you have pressed it. The page changed, and the arrow flying out of the box
and back in is the receipt for that, not a state anyone could still read a second later.

Which animation runs is the `state` attribute rather than anything in the code. The arrow
has a `hover-slide` worth spending a press on; the chevron has only its default nudge, so
that is what it plays. Neither the trigger nor `main.ts` knows there are two icons here.

## Worth noticing

The frame is one element for the whole row, not a border on the page you are on. A border
cannot travel from one button to another — and travelling is the entire point, because the
way it moves is what tells you which direction you went.

Both of its edges are given a new position on every turn, and both are going the same way,
but they do not leave together. The leading edge goes first and alone, so for a moment the
frame is stretched across everything between where you were and where you are going. Then
the trailing edge follows, slowly, and the frame ends the size it started. Which edge leads
is the only thing script says about any of this: `data-going` on the row, and the stylesheet
has two transitions ready for the two answers.

The two halves are not the same movement and are not meant to be. The stretch is 130ms on a
curve that only accelerates — it should read as the frame being pulled, and something being
pulled does not ease into it. The catching up is 300ms on a curve that only slows down,
because that half is not going anywhere new. Both were measured off the reference recording
frame by frame, and fitting them was how it became clear the trailing edge does not move at
all until the leading one has arrived.

Everything about the row's geometry is measured rather than counted. `place()` asks a
button where it is and how wide it is, and the frame gets two numbers; nothing in the demo
knows that a page and its gap come to 44 pixels, so a row of eight pages or a wider button
would need no arithmetic changing anywhere.

There is one arrow in the icon set and two on screen. The next button is the previous one
turned round by the stylesheet, which turns its animation round with it: the arrow that
flies out to the left on one flies out to the right on the other. The icon does not know,
the trigger does not know, and there is no second file to keep in step.

## The three rows

They differ in the button and in nothing else. A box with an arrow in it, a box with a word
and a chevron, and a chevron with no box at all — and then the same numbers, the same frame,
the same times. One block in the stylesheet holds every difference between them, and one
line outside it — the next paragraph's business — is the only other place that knows there
is more than one kind of row.

The bare chevrons are the one place the design needed a decision rather than a reading. At
20 pixels they are too small to hit, so they carry the same 8 pixels of padding the other
two do — invisible, but enough of a target. The row then takes that 8 pixels back out of its
gap, because the 96 the design measures is to the chevron you can see, not to the edge of a
box you cannot.

## The control underneath

`aria-current="page"` is what says which page you are on, and it says so the moment you
click rather than when the frame finishes arriving. The frame is decoration and is marked
`aria-hidden`; take the stylesheet away and the control still works and still reports
itself correctly.

A step with nowhere to go is `disabled`, which is also why its icon holds still there: a
disabled button fires no click, so the trigger never hears one. Nothing had to be written to
make that true — it is what `disabled` already means.

The three rows are three separate controls that share their code, not one control shown
three ways: each remembers its own page. The dots are `shared/ui/pager.ts`, the same ones
the checkbox list uses, and hiding a row takes its buttons out of the tab order with it.
Every row is measured before the first one is hidden, because a box that is not on the page
has no width to ask about.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/pagination), where it sits
alongside the other demos and the triggers it uses.
