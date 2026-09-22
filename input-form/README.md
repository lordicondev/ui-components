# Input form

A composer with a menu over it, and a menu beside that one. The interesting part is what the
demo does not say: nowhere in it is there a word about opening upward.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger               | Watches                      | On                                                                                                |
| --------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| `hover-focus`         | the pointer and the keyboard | the plus, the microphone, the send arrow, every row icon, and the chevron beside "Add to project" |
| `focus-attention`     | `data-focused` on `.field`   | the magnifier in the project search                                                               |
| `clearable-attention` | `data-clearable` on `.field` | the cross, state `in-reveal`                                                                      |

All three are borrowed and none is new — `hover-focus` from the sidebar, the other two from the
search bar. `scripts/lib/triggers.ts` needed no new line, which is unusual for a demo and is
the point: ten icons and nothing registered that did not already exist.

The split between them is the same one the sidebar makes. Everything you can reach answers
being reached, by pointer or by keyboard. The field answers being _used_ instead: the cursor
arriving in it, and there coming to be something in it worth clearing.

A hover that lands while an icon is still playing is dropped rather than started again, and
that is where a hover and a press part company. `pressAttention` restarts, because a person
pressing a button twice is asking twice. Reaching a control is not asking for anything — and a
pointer crossing this list, or going back to the row it just left, would otherwise cut every
animation off at its first frame and the menu would flicker rather than answer.

## Why it opens upward

Because there is nowhere else to go, and because `popovers()` is the thing that noticed:

```ts
const below = document.documentElement.clientHeight - box.bottom - gap;
return below >= box.top - gap ? 'down' : 'up';
```

The composer sits at the foot of the page the way a composer sits in the thing it belongs to.
That is a line of CSS — `align-content: end` — and it is the whole input to the decision. The
notification menu, whose bell is at the top of its stage, runs the same code and gets `down`.

It asks the room rather than asking whether the panel fits, and that is not laziness. The
answer has to be settled in `beforetoggle`, while the panel is still `display: none` — which
is the same reason the height has to be collapsed there — so there is no height to test. A fit
test would have to force a `display` on the panel to measure it and guess which one the demo
wanted. Which side has more room needs nothing but the button's own rectangle.

A menu opened from inside another menu skips the question and takes its parent's answer. A
stack of panels that zigzagged would be the room talking rather than the design.

## What "upward" turns out to mean

Four things, and only the first is obvious.

**The pinned edge changes.** A downward panel is pinned by its top and animating the height
moves its bottom; upward, that is reversed. Otherwise the box would grow back over the button
that opened it.

**The cascade reverses.** Rows arrive one after another from the row nearest the button —
which going up is the _last_ one in the markup. "Add plugins" is readable before "Add files or
photos" is there at all. The module reverses the list rather than the demo reordering it,
because the markup should read in the order a screen reader will.

**The rows come from below** rather than from above, so they arrive travelling the same way
the panel is growing.

**The panel leaves the way it came**, rising instead of sinking. That one is a stylesheet
change and it needed a custom property rather than a second `translate`: the upward rule and
`:popover-open` have identical specificity, so a second declaration would have won or lost on
source order alone.

### The line that looks unnecessary

```css
.popover[data-direction='up'] > * {
    flex-shrink: 0;
}
```

A panel is a flex column whose height is animated from nothing. A flex column told to be
shorter than its contents **squashes them** rather than letting them overflow — so without
this the four rows flatten into the sliver instead of sliding out of the top of it, and
bottom-aligning them has nothing left to align. The failure is invisible in a screenshot and
looks like the animation simply not happening.

## A popover inside a popover

The submenu is a second `popover`, and it is a child of the first one in the DOM. That one
fact is what makes them a pair as far as the browser is concerned: opening the inner one does
not dismiss the outer, closing the outer takes the inner with it, a click inside the menu but
outside the submenu closes only the submenu, and Escape closes one level per press. None of
that is written anywhere in this demo.

It has to be DOM nesting rather than the `popovertarget` relationship alone, because the
pointer is what opens this one — and a bare `showPopover()` has no invoker to be nested by, so
the browser light-dismisses the panel it came from. Being a child costs the submenu nothing:
a popover is in the top layer either way, and `position: fixed` keeps it out of its parent's
flex layout.

Two things follow from the nesting that had to be handled:

- `popovers()` brings in a panel's **own** rows. A plain descendant search would have handed
  the outer menu the submenu's four rows as well, spreading one cascade over eight things.
- The row uses `popovertargetaction="show"` rather than the default toggle. The pointer
  resting on it is what opens the submenu, and a click that closed a panel the pointer was
  still inside would be a fight between the two.

Closing is the demo's, and most of it is not a timer.

The panel is drawn a gap away from the row, and a pointer travelling between them is over
neither for as long as it takes to cross — long enough, moved slowly, for the submenu to
decide it has been left. Waiting longer would make the decision late as well as wrong, so the
gap is closed instead: the panel is given strips of reach down each side, and the pair becomes
one continuous target with no dead space in it.

That needed one line from the shared stylesheet. The browser gives a popover `overflow: auto`,
which makes it a scroll container and clips anything it puts outside its own box — so the
reach was there and invisible to the pointer until `popover.css` took that back.

Two smaller rules finish it. A panel somebody is typing in has not been left, whatever the
pointer is doing: the cursor is in the search box, and the mouse has nothing to say about
that. And a pointer that wanders off the pair entirely gets 150ms to come back.

## One cascade, and the words are in it

`popovers()` is given no timings. The reference render opens its panel in about 550ms with
rows 83ms apart, against the module's 220 and 40 — but the same widget moving two different
ways on two pages is worse than either number being right, and the curve fits this recording
at rmse 0.013 where the others fit at 0.003. Not worth a second set of constants.

What it is given is one selector, and that is the one place this demo goes past what the
recording shows. Measured, the row labels fade as a block: left and right halves within a
hundredth of each other across three frames. But every other panel in the showcase brings its
words in one at a time, and a menu that did not would read as the odd one out rather than as
restraint — so the labels get the accordion's `revealText`, at the notification menu's
settings.

```ts
popovers(document, { reveal: '[data-reveal]' });
```

That used to be six lines here and six more in the notification menu, with the same two
numbers written out twice. The module already knows when each row moves and what delay it
gave it, so the words land in the one cascade rather than in a second that overlaps it — and
`onRise` is still there for a demo with something else to start at the same moment.

## Choosing a row

Every row that is an answer carries `data-choose`, and that one attribute is the whole of it:
`popovers()` closes the panel at the **top of the chain** and raises a `popover-choose` event
carrying the row. Chosen from the menu or from the submenu two deep, it is the same attribute
and the same result — the browser takes the nested panel away with the one that holds it.

It is opt-in because not every row is a choice. "Add to project" is the one row here without
the attribute: it is a route rather than an answer, and closing the menu out from under it
would be the opposite of what it is for.

The event is what makes the mechanism usable by something that is not this page. It bubbles
and carries the row, so a listener can hear a choice without knowing which panel it came from
or how many were open at the time:

```ts
document.addEventListener('popover-choose', () => prompt.focus());
```

That line is this demo's entire answer to being chosen from, and it is honest about what the
control does: the menus put themselves away, and the cursor goes back to the one place it was.

## The field is the search bar's, whole

The project search is `shared/ui/field.ts`, which is where the search bar's own script now
lives — the same two attributes, the same two triggers, the same half-second of quiet before
the cross draws itself in.

It does one thing here that the search bar never needed. Emptying a field from script raises no
`input` event, so a cross that cleared the box would have left the list filtered down to
nothing with nothing in the search to explain why. `fields()` now raises the event by hand: a
field emptied by its own button and one emptied by holding backspace are the same thing as far
as anything downstream is concerned.

And when the search matches nothing, the list is not empty — it is gone. An empty `<ul>` still
takes the column's gap, which would leave the field with twice as much room under it as over
it, and a panel that is only a search box should look like one.

## One halo, not three

The composer's focus glow and the send button's glow are the same `--shadow-accent`, and the
panels carry `--shadow-sm`. Lit all at once on an empty page they argue, so the send button's
glow is hung off the same custom property as the composer's and only burns while the composer
is focused. At rest the page has one shadow on it.

## What this demo does not do

The microphone is wired to nothing — recording audio is not something this page can honestly
do. Choosing a row closes the menus, raises the event and leaves nothing else behind:
attaching things to a message is a feature this control does not have, and drawing one would
be inventing it. The event is the seam where an application would put that.

The panel is not clamped. Taller than the room on the side it chose and it runs off the edge
of the screen; nothing here is, so nothing here shows it.

Fragments on this page point into `shared/ui/popover.ts`, `popover.css`, `menu.css` and
`field.ts`. The notification menu, the dropdown menu, the command palette and the search bar
quote regions of those same files. Editing one region changes every page that shows it, and no
check catches that.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/input-form), where it sits
alongside the other demos and the triggers it uses.
