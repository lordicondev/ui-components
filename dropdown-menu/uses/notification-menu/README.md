# Notification menu

A bell with a count on it, and a panel that unrolls under it. The bell rings when the count
goes up and says nothing when it goes down. The panel is the browser's own popover, opened
by an attribute, with an entrance written on top of it.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger           | Watches                      | On                 |
| ----------------- | ---------------------------- | ------------------ |
| `count-attention` | `data-count` on `.bell`      | the bell           |
| `hover-focus`     | the pointer and the keyboard | the four row icons |

Neither is new. `hover-focus` is the sidebar's, and `count-attention` is the password
field's error trigger under a different name — `raisedAttention`, which was already counting
something, now says which attribute it counts:

```ts
Element.defineTrigger('raised-attention', raisedAttention('data-raised'));
Element.defineTrigger('count-attention', raisedAttention('data-count'));
```

That trigger's whole behaviour is a comparison of two numbers, and it happens to be exactly
what a notification count wants. Up from zero is an arrival. Up again is another one. Down
is somebody reading them, which the bell has nothing to say about. And the number the page
was built with is not a change at all, so it plays nothing — the trigger takes the count it
arrives with and waits.

A second arrival that lands while the bell is still ringing is dropped rather than restarted.
This bell rings for a second and a half, so that happens easily, and the alternative is a
ring that keeps cutting itself off at the first frame.

## The whole API is one number

```ts
setCount(2);
```

Everything else follows from the attribute it writes. The badge is drawn from it, the icon is
watching it, and the three cases in the brief are not three code paths — they are what the
comparison of `was` and `count` already says:

| From | To  | What happens                                  |
| ---- | --- | --------------------------------------------- |
| —    | _n_ | the page's own `data-count`: nothing plays    |
| 0    | _n_ | the badge grows in, the bell rings            |
| _n_  | _m_ | the badge pops the new number, the bell rings |
| _n_  | 0   | the badge shrinks away, in silence            |

The first row is the one you cannot press a button for, because it is not something that
happens — it is how the page started. `index.html` ships `data-count="0"`; change it to
`data-count="5"` and the bell is simply sitting there with a five on it when you arrive, with
nothing having animated. The field and the Set button under the demo drive the other three.

Opening the menu is reading it, so the count goes to zero and the badge goes with it. The
bell stays quiet, because a count going down was never news.

The badge arrives with an overshoot and settles — `cubic-bezier(0.34, 1.8, 0.64, 1)` over
350ms, fitted to the recording, which grows it to about 1.18 of its size around frame six and
lands by frame ten. It leaves in 100ms without one. Coming back is worth watching; being over
is not.

## The panel is the browser's

`popovertarget` on the button and `popover` on the panel, and that is the opening. The panel
draws in the top layer, so nothing on the page can clip it and no stylesheet needs a
`z-index`. Clicking away closes it. Escape closes it. The button is described as the button
for that panel without a single `aria-` attribute being written.

What the platform will not do yet is put the panel under the button — CSS anchor positioning
is not everywhere — or say in the DOM that the button is open. `shared/ui/popover.ts` is
those two things and the entrance, and nothing else.

`aria-expanded` is the second of them, and it is what the pressed look reads:

```css
.bell[aria-expanded='true'] {
    background: var(--border-soft);
}
```

That is the same attribute a screen reader is being told about, not a class invented to sit
beside it. The reference recording does not draw this state — it lets the button go back to
white once the pointer leaves — but the design does, and a control that opened something is
still doing it.

### One line decides whether any of it works

```css
.popover:not(:popover-open) {
    display: none;
}
```

The browser hides a closed popover with `display: none` from its own stylesheet, and an
author's `display` on the panel beats it — origin wins over specificity, so it does not
matter how faint the selector is. Give the panel `display: flex` because it is a column of
rows, and it is never hidden again: it sits in the page at `opacity: 0`, taking up space,
and clicking the button appears to do nothing at all. The rule lives in `popover.css` so
that every demo built on this gets it without having to know.

### Arriving is script, leaving is not

A height that unrolls has to be measured first, so the entrance is `element.animate()`: the
panel from a sliver to what it holds in 220ms on `cubic-bezier(0.3, 0, 0.2, 1)` — the same
curve the accordion opens with, fitted to this recording at 225ms and landing on the same
answer.

A sliver rather than nothing, and that word is load-bearing. `box-sizing: border-box` is on
everything in this project, and a box can never be shorter than its own padding and border —
so `height: 0` on a panel with twelve pixels of padding still renders twenty-six tall.
Animating from `0` spends the first quarter of the duration below that floor, where nothing
moves, and what you see is a panel sitting still and then leaping into the fast part of the
curve. Both ends of the keyframe are `offsetHeight` for that reason: the height the box
actually renders at, collapsed and open. `scrollHeight` is the near miss at the far end — it
leaves the border out, so the panel stops two pixels short and snaps the rest.

Which raises the question of when to start it, and the obvious answer is wrong. `toggle` is
queued as a task, so the browser has already shown the panel — at the full height its
contents give it — before anything can react, and a frame of the finished panel is painted
before the animation collapses it again. You see the menu, then you see it arrive. The panel
is closed in `beforetoggle` instead, which runs while it is still hidden and is the only
moment a height can be put on it that nobody sees it without. Placing it happens there for
the same reason: otherwise the first frame is drawn where the browser would have centred it.

The departure cannot be script. A popover closing leaves the top layer, and asking to keep an
element the browser has already taken away is a fight nobody wins. `transition-behavior:
allow-discrete` is the platform's answer: `display` and `overlay` are not interpolable, so a
transition normally switches them at once, but told to allow the discrete step the browser
holds both at their old value until the rest of the transition is over. The panel fades and
sinks for 160ms and then goes. Where that is not understood it goes at once, which is what a
popover did before any of this existed.

The panel goes back the way it came — down, here, back under the bell — and so do its rows.
Which way that is, the module works out for itself; see the input form, which is the same
panel with nowhere below it to go.

## One cascade, not three animations that overlap

Anything marked `data-rise` inside the panel is a row. `popovers()` brings each one in from
12px above its place, fading over 180ms and settling over 360ms — the fade is over well
before the movement is, so a row is readable while it is still arriving, which is what the
recording measures.

A hover that lands while a row's icon is still playing is dropped rather than started again.
A pointer crossing the list, or going back to the row it just left, would otherwise cut each
animation off at its first frame — the list would flicker rather than answer. That lives in
`hover-focus`, so the sidebar and the input form got it at the same time.

Rows start 40ms apart, the first of them 60ms after the panel. Measured against the recording
the five elements start at 52, 131, 140, 173 and 185ms after the panel does; a fixed stagger
is within a frame of that at every point except one, and 40ms is as fine a grain as 24fps can
honestly resolve.

A title's words and a new row's tint have to start in that same cascade rather than in one of
their own. The words are the module's own business now — four demos wanted them, so `reveal`
takes a selector and `popovers()` starts them from the instant it moved the row. The tint is
this demo's alone, and for that the module hands each row back with the delay it gave it:

```ts
popovers(document, {
    reveal: '[data-reveal]',

    onRise(row, delay) {
        if (row.hasAttribute('data-unread')) unroll(row, delay + 90);
    },
});
```

The words are the accordion's `revealText`, faster: 260ms with almost half of it spent fading,
against the accordion's 500ms and a third. Those two numbers are in `popover.ts` now rather
than here — they were measured on this recording, and the demos that came after took them. A one-line title in a list is not a paragraph, and
the recording puts each word about 40ms behind the last with a 120ms fade of its own.

## A fill with a width

The tint behind a new row unrolls left to right, which a background colour cannot do: a colour
has no width to grow. So it is a background _image_ — a gradient of one colour — and what
animates is `background-size`:

```css
.feed__row {
    background-image: linear-gradient(var(--row-fill), var(--row-fill));
    background-size: 100% 100%;
}
```

The stylesheet then only ever says what colour a row is, resting or under the pointer, and
never learns that it is halfway in. The unroll is one line of script animating `0% 100%` to
`100% 100%` over 370ms.

The dot is not in any of this. It is there the moment the row is, because the tint already
takes a third of a second to say the row is new and the dot has nothing to add by taking as
long. It is also the only part of "new" a screen reader can be told about, so the word
`Unread` sits behind it, read and never drawn.

## Hovering a row

Measured, not assumed. A read row goes white to `--surface-muted`. A new row goes from its
tint to the same tint again — `--accent-surface` is already the brand colour at a tenth of
its strength over white, and hovered it is two tenths:

```css
--row-hover: color-mix(in srgb, var(--accent) 10%, var(--accent-surface));
```

That is not a guess at what the recording shows. The resting tint measures within two units
of `--accent-surface`, and the hovered one within two units of another tenth of the accent
over it — where `--brand-200`, the obvious candidate, is out by six and eleven in the
direction the encoder does not err.

Neither transitions. The fill changes inside a single frame at 24fps, and being pointed at is
a state rather than a movement — the same argument the sidebar makes about its rows.

## What this demo does not do

"Mark as read" is drawn because the design has it and wired to nothing, the way menu-bar's
"More options" is. The rows are real buttons, so they can be tabbed to and the keyboard gets
the icons too, and like the sidebar's links they have nowhere to go.

The panel opens downwards because there is room below the bell, which is a decision
`popovers()` makes rather than one this demo states. What it still does not do is clamp: a
panel taller than the room on the side it chose runs off the edge of the screen.
