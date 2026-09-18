# Menu bar

Seven buttons in one bar, saying two different things. The four on the left are a choice:
pick one and it morphs into place while the tool you put down morphs back out. The three on
the right are actions — they happen, the icon acknowledges it, and a second later the button
is exactly as it was.

Every button also carries its name, floating above it on hover. That is not a second copy of
the label added for the picture: it is the label, drawn.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger           | Watches                    | On                            |
| ----------------- | -------------------------- | ----------------------------- |
| `selected-morph`  | `data-selected` on `.tool` | the tool, its `morph-*` state |
| `press-attention` | a `click` on `.action`     | the button, its default state |

`selectedMorph` is `booleanMorph` under another name — the third demo to register the same
trigger against a different attribute, which is the point of it having one.

`pressAttention` is new, and it is the simplest trigger here: a click plays the icon once.
There is no attribute because there is no state. A button that opens a menu leaves nothing
behind for an icon to hold, so what the icon gives is a receipt rather than a look.

## Worth noticing

The bar is one row of buttons and two entirely different promises, and every difference
between them follows from that. A tool is a state: it has an attribute, it morphs, and it
stays. An action has no attribute, plays once and ends where it started — which is also why
reduced motion treats them differently. A morph still arrives at the other look, because
that look is the state and hiding it would be a lie; an attention animation is skipped
outright, because there is nothing at the end of it to arrive at.

Changing tool moves two icons at once and they are doing opposite things: the one being put
down travels back to its outline, the one being picked up fills in. Neither is told about the
other. Each is watching its own label's `data-selected`, and `follow()` writes all four in
one pass, so the crossing is a consequence of the state changing rather than a piece of
choreography.

A press that lands while the icon is still playing starts it again, and `raised-attention`
— the alert demo's trigger — drops that one instead. The difference is who is repeating
themselves. There it is an application putting the same message up twice, and the icon has
nothing to add. Here it is a person pressing the button again, and a button that answered
every other press would read as broken rather than as calm.

`state` is not the same word on all four tools: the brush uses `morph-change` and the other
three `morph-select`. The names come from the icons, not from the bar, and the markup is
where they are reconciled — nothing in the code or the stylesheet knows there was anything
to reconcile.

Two of the icons shipped with their morph state missing its `:0.5` ratio, which splits the
animation into the way in and the way back. Without it the trigger has one long transition
instead of two halves, and a tool picked up fills and then immediately empties again. The
ratio is in the file, on the layer the marker was made from; `shared/icons.json` records both
files as edited by hand.

## Tooltips

`shared/ui/tooltip.ts` and its stylesheet are new, and meant for more demos than this one.

The idea is that an icon button already has a name — the words a screen reader reads out —
and a tooltip is that name made visible. So there is one span, it names the button the
ordinary way, and the stylesheet lifts it out of the flow and holds it at `opacity: 0`. An
invisible element is still an element: the name is in the accessibility tree the whole time,
which `display: none` or `visibility: hidden` would not have managed. Nothing is duplicated
and there is no `aria-*` to keep in step, because there is only one copy of the word.

It rises into place and sinks back out, both directions the same movement in reverse. That
is unusual for this project, where in and out are usually not mirrors — but nothing is being
announced here. The name was always there, and it is only being shown.

What is left for script is timing. The first tooltip waits, so that a pointer crossing the
bar does not flash seven names on its way past. After one has been read that wait is only in
the way — moving one button along is a comparison, and answering it half a second late reads
as lag — so closing one tooltip leaves the row warm and the next opens at once, until the
pointer has been away from every button for long enough to have finished looking.

Keyboard focus never waits: arriving on a button with Tab is asking for its name outright.
A pointer merely passing over it is not asking at all, and `:focus-visible` is exactly the
distinction between the two. Escape puts a tooltip away without moving the pointer off the
button it covers, and the button keeps the name it was given.

## The control underneath

The tools are a radio group — a real one, hidden but entirely intact. The arrows move
between tools, the bar is a single tab stop, the choice submits with a form, and each tool
has a name to be read out. `change` fires for a click and for an arrow key alike, so there is
one way into `follow()` rather than two.

What a radio group will not do is say which one is checked in a form anything can watch.
`checked` is a property, and a `MutationObserver` sees attributes. So the group's own answer
is copied onto each label as `data-selected`, and from there the icon and the stylesheet both
read it without either knowing a radio was involved.

The actions are ordinary buttons and need none of that. They are pressed with Enter and Space
because that is what buttons do, and `press-attention` listens for the `click` those produce
rather than for a pointer, so the keyboard is included without a line of its own.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/menu-bar), where it sits
alongside the other demos and the triggers it uses.
