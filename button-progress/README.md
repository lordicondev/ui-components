# Button progress

Press it and it starts working: the bar fills behind the words, the icon keeps turning, the
label changes twice, and a receipt slides out underneath. All of that is downstream of one
attribute — the button says which of three things it is doing, and everything on screen is
reading it.

Two pages, behind the dots: the same button as a download and as an upload.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger           | Watches                    | On                               |
| ----------------- | -------------------------- | -------------------------------- |
| `stage-cycle`     | `data-stage` on the button | the download icon, `morph-check` |
| `shown-attention` | `data-shown` on the toast  | the tick, state `in-reveal`      |

`stageCycle` is new, and it is the only trigger here that had to be written rather than
reused. `shownAttention` beside it is `booleanAttention` under its third name — the same
five lines the password field and the search bar already register.

## The one thing the trigger is for

Work does not stop on the beat. The download finishes wherever the icon's loop happens to
have got to, and cutting the loop off there is the difference between an icon that stops
and one that is stopped — a spinner that halts halfway round reads as a crash.

So the finish is remembered rather than obeyed. `data-stage` becomes `"done"` the moment the
transfer does, and everything else on the button answers immediately; the icon alone waits
for the cycle it is in to come round, and only then morphs. The stage is a fact as soon as
it is written. Only the picture is late, and only on purpose.

Everything else the trigger does follows from having three stages instead of two: it loops
on one, morphs forward on another, morphs back on the third. Which loop and which morph are
`data-loop` and `state` in the markup, so the upload version of this button is a different
`src` and nothing else.

## Worth noticing

The bar is never made wider. It is the full width of the button all along and scaled down to
`--progress`, which has three things going for it: a solid colour has nothing to distort,
scaling happens off the layout entirely, and there is no step where the browser has to work
out a new width. When it finishes it fades rather than running back — an empty bar is not
news, and emptying it would be a second animation saying so.

Progress arrives in steps, not frames. A real transfer says where it has got to now and
then, so the demo does too, and a `220ms linear` transition covers the distance in between.
That is the whole reason for the transition: it turns ten coarse reports into one smooth
bar, rather than smoothing something that was already smooth.

The words are on a strip and the strip only ever goes up. Three labels stacked, one line's
worth of window over them, and every change slides by exactly one line — so the old words
leave over the top and the new ones come up from underneath, whichever label is arriving.
Going back to the first one is the awkward case, because 2 → 0 would slide them down; the
strip counts on to a copy of the first line instead and is moved back to the real one with
the transition switched off, in a frame nobody sees.

The window is as wide as the widest label rather than the current one, which is what keeps
the button still. Three dots appearing at the end of "Downloading" cannot move anything,
because the space for them was already there.

The toast opens from the middle of the button and finishes flush with its left edge. Its
words are not animated at all — the box simply uncovers them, left to right, as it goes, so
there is one movement on screen rather than two racing. It is absolutely placed, so nothing
below it shifts to make room for a receipt that is leaving in two seconds.

Leaving is not the reverse of arriving. The toast drops a little and dims over 150ms rather
than closing the way it opened — it took half a second to say something and does not take
half a second to stop. Which means the box must not shrink on the way out, and the way to
say that in a transition is `0s 150ms`: the width and the offset snap back to where they
started only once the fade has finished, at a moment when there is nothing on screen to see
it happen.

The three dots after "Downloading" arrive one at a time and leave together, over and over —
a 667ms round in which each of the first three steps holds for 150ms and the last, with all
three showing, holds for the rest. They are always in the line and only ever change opacity,
so the word they follow cannot move and neither can the button: the room for them was taken
when the strip was measured, lit or not.

## Two pages, one set of code

The second page is a different `src`, three different words and one different sentence. That
is the entire difference, and it is all in the markup.

`main.ts` has a `wire()` that takes a `.task` element and gives it everything — the bar, the
labels, the stages, the receipt — knowing nothing about which of the two it has. It is called
once per `.task` found on the page, and it finds two. The stylesheet is the same: not one
rule anywhere names a download or an upload.

The two icons do not name their morph states the same way, and the markup is where that is
settled rather than in code. `state` is an attribute; which animation an icon happens to
call its second look is the icon's business, and the trigger asks for whatever it was told.

## The API

Two attributes, and they are the whole surface.

`data-progress` is a number from 0 to 100. Write it and the bar follows — from this demo's
pretend transfer, from a real `onprogress`, or by hand in the element inspector. The
stylesheet reads `--progress` rather than the attribute, because CSS cannot yet take a
number out of one, and `report()` is the one line that keeps the two in step.

`data-stage` is `idle`, `busy` or `done`. The icon, the bar, the labels and the toast all
read it and none of them reads anything else.

The labels live in the markup, all three of them, and `aria-label` on the button is copied
from whichever one is showing. That is what makes the variant this demo is a rehearsal for —
the same button with an upload icon and three different words — a matter of editing the
markup rather than the code.

## The control underneath

It is an ordinary button. While the transfer runs it is `disabled`, which stops a second
press and, without anything being written for it, stops the icon reacting to one: a disabled
button fires no click.

`aria-busy` says the same thing to a screen reader, and the toast is a `role="status"`, so
the one moment worth announcing announces itself. The strip of labels is `aria-hidden` — it
is three labels deep and only one of them is true at a time, which is exactly the thing a
name must not be.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/button-progress), where it sits
alongside the other demos and the triggers it uses.
