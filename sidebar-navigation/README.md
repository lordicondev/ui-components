# Sidebar navigation

Seven destinations in a column, each with an icon that plays when you reach the row —
with the pointer or with the keyboard. Underneath it is one attribute, `aria-current`,
which says where you are; the tint follows it, and so does the screen reader.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger               | Watches                      | On                                 |
| --------------------- | ---------------------------- | ---------------------------------- |
| `hover-focus`         | the pointer and the keyboard | the seven list icons, and the dots |
| `focus-attention`     | `data-focused` on `.field`   | the magnifier                      |
| `clearable-attention` | `data-clearable` on `.field` | the cross, state `in-reveal`       |

`hover-focus` is new here, and it is the element's built-in `hover` plus one line. The
built-in is the right answer for something you can only click — the add-new-card tile uses
it and needs nothing else. A navigation list is not that: tabbing down it is an ordinary
way to use it, and an icon that answers the mouse and ignores the keyboard goes quiet for
the person who most needs to be told which row they have landed on.

The extra line is `:focus-visible` rather than plain focus. Clicking a link both moves the
pointer onto it and focuses it, and only one of those is news; asking the browser which
focus it would have drawn a ring around is asking the question it has already answered.

`target=".nav__item"` is what makes the whole row the hover area. Without it each icon
would watch itself, and the animation would only play for a pointer that found the 24
pixels it occupies — the word beside it would be dead.

## Every icon plays the state it came with

No morphs. A morph has two looks to keep and this list has one look per row, so what plays
is the icon's default state and nothing is held afterwards. Five of the seven are
`hover-pinch`; the cart's own default is `hover-slide`, which rolls it, and the demo names
neither of them.

The cog is the exception, and it is one attribute: `state="hover-mechanic"`. It is the only
icon in the set that turns rather than pinches, and a cog is the one shape a reader expects
to. Everything else about that row is identical to the six above it.

## Hovering a row is two custom properties

`--nav-fill` and `--nav-mark`, declared on `.nav__item` and redeclared once. Every rule
underneath reads from them, so those two blocks are the entire difference between a row you
are pointing at and a row you are not — the icon included, because `current-color` lets a
Lordicon icon take `color` like any other element. Nothing in the stylesheet mentions an
icon, and no colour is written anywhere near one.

The label is deliberately not in that set, and this is measured rather than assumed: in the
reference recording the word is `--ink` at rest and `--ink` on hover, to within a
half-percent of the same ink on the screen. It is the destination's name, it is legible
already, and darkening it would be the row repeating a word you had just read. What changes
is the fill behind it and the mark beside it.

Neither transitions. Which row you are on is a state, not a movement, and the recording
agrees: the fill goes from white to `--surface-muted` inside a single frame at 24fps, and
back the same way. The only thing on the row with a duration is the icon.

## Where you are, and where you are pointing, look the same

The current page carries `aria-current="page"` and the same tint hover gives. That is what
the design draws, and it is not a collision: the pointer is only ever on one row, so with
the pointer away exactly one row is tinted, and that one is where you are.

Clicking moves the attribute — added to the link you pressed, removed from the rest.
Removed rather than set to `"false"`, because `aria-current` is not a boolean: a link that
is not the current page simply does not carry it. The stylesheet then reads the same
attribute a screen reader does, which is the whole point of putting the state in the markup
instead of in a class.

One listener on the list rather than one per link. Which link was pressed is already in the
event, and an eighth destination needs no second thought here.

These are real `<a href>` links with nothing behind them, and the click handler says
`preventDefault()`. That is the one thing the demo cannot be honest about: a sidebar goes
somewhere, and this one has nowhere to go.

## The search bar, borrowed whole

The field is the [search bar](../search-bar/) demo's, and now literally so: `fields()` writes
the two attributes its icons are watching — the half-second of quiet before the cross draws
itself in, and the guard that does not call reaching for the clear button a departure. It was
copied here first and shared once a third demo wanted it; the reasoning behind it is written
up over there.

It is also the one thing in the sidebar that does not answer the pointer. A field is not
somewhere you hover, it is somewhere you are, and the magnifier answers the cursor arriving
rather than passing over. Two ideas of "reached" in one column sounds like a mistake and
reads as the opposite: the list responds to being looked at, the field to being used.

The one change is the resting edge. The search bar draws a faint line round itself because
it sits alone on a page; here it sits on a card that already has one, and the design draws
no line at all. So the border is there and transparent, which keeps the words from shifting
a pixel when focus lights it up.

## A control with no natural height

A sidebar is as tall as the window beside it. The design draws it at 814px because that is
how tall that window was, and nothing about the sidebar wants that number: pinned to it, the
column hangs off the bottom of a laptop screen; measured from its own contents, it is a
532px stub with the account row halfway up the page.

So all three sizes are named and the browser picks:

```css
height: 814px;
min-height: min-content; /* never shorter than what it holds */
max-height: calc(100dvh - var(--space-48)); /* never taller than the screen */
```

`min-height` beats `max-height` in CSS, and that ordering is the rule rather than a fact to
work around. In the portal's frame it settles to the height of the screen, which is what a
sidebar looks like anywhere else.

The cap is spelled out rather than `100%` of the box around it, which is the version that
does not work: a percentage height needs a definite height to measure against, the box
around this one is sized by it, and `100%` against an indefinite height means no cap at
all. The subtraction is the demo's own padding, top and bottom.

## The two drawings that are not icons

The Lordicon mark in the header is an inline SVG — two shapes, no request, and the only
colours in this demo written as hex rather than as tokens. A logo is not a token: those two
greens belong to the mark, not to the palette, and putting them in `palette.css` would
offer them to the next demo as if they were.

The avatar is not a file at all. It is a circle and a letter, which is what the design's
avatar is; an `<img>` would be a photograph this demo does not have.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/sidebar-navigation), where it sits
alongside the other demos and the triggers it uses.
