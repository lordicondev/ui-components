# Search bar

A field with two icons that never speak at the same time. The magnifier answers the cursor
arriving. The cross waits until you have stopped typing, draws itself in, and offers to
empty the field. Between them they are two attributes on one element, and nothing else.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger               | Watches                      | On                           |
| --------------------- | ---------------------------- | ---------------------------- |
| `focus-attention`     | `data-focused` on `.field`   | the magnifier, default state |
| `clearable-attention` | `data-clearable` on `.field` | the cross, state `in-reveal` |

One trigger, registered twice. `booleanAttention` plays an icon once each time a boolean
turns true, and which boolean is the only difference between these two — the same
arrangement the password field uses for its lock, on a second attribute that means something
else entirely.

Neither icon is holding a state. The magnifier ends its wobble exactly where it started, and
the cross is simply there or not. That is what separates an attention from a morph: a morph
has two looks to keep, and these have one each.

## Worth noticing

The cross draws itself rather than appearing, and the reason is one attribute: `in-reveal`
is an entrance state, so it starts from an empty frame. Play it and you get the cross being
drawn; the icon was built that way and the demo only names it.

Going is not the reverse of coming. The cross leaves the instant the field is empty, with no
animation at all — which is deliberate and is what the reference recording does. An arrival
is worth watching; a button for a thing that no longer exists is not, and undrawing it would
hold a stale offer on screen for half a second after the thing it offered was gone.

It waits for the keyboard. A cross drawing itself in beside a moving caret is the one thing
in the field competing with what you came here to do, so it holds off until half a second
has passed with nothing typed. Leaving the field counts as stopping: whatever you were in
the middle of, you are not in the middle of it any more, and the field can say what it is
holding without waiting the pause out.

Once it is there it stays, for as long as there is anything to clear. The alternative —
taking it away on every keystroke and drawing it again at every pause — is more literally
what "show it after the typing stops" says, and it would put a button under your cursor and
then move it.

Clearing is not leaving, and saying so takes one line. Pressing the clear button really
does move focus — `mousedown` hands it to the button before the click is over — so the
field watches `focusin` and `focusout` on itself rather than the input's own `focus` and
`blur`, and a `focusout` whose `relatedTarget` is still inside the field is not a departure.
Without that check the border flickers grey for the frames between losing the input and
being handed it back, because `focusout` arrives before `focusin` and the way out has to
know where focus is going.

The cursor then goes back to the input, which is what a search box is for, and the magnifier
does not play again: `data-focused` never changed, and the icon is watching that, not us.

Both icons are the muted grey the placeholder is, which is not what the flat mockup looks
like and is what the recording measures. They are marks in a field rather than the thing in
it; the words you type are the only ink at full strength.

## The outline is the shadow

The resting field is a filled box with the faintest possible edge — a grey one step from its
own fill, which is `--border-soft`, added for exactly this: an input has a shape of its own
and does not need a line drawn round it to be found.

Focused, the edge takes the brand colour and a halo appears behind the whole box. That halo
is `--shadow-accent`, the same one under the add-to-cart button, and sharing it is the
point: a focused field and a primary button are lit the same way, so the page has one idea
of what "this one, now" looks like rather than two.

It also means the input itself draws no focus ring. `base.css` puts one on anything focused,
and here that would be a second outline sitting inside the one the field is already drawing.

## The control underneath

A real `<input type="search">`, named by a label that is read out and never drawn. The
placeholder says the same word, but a placeholder is not a name: it leaves the moment you
type, and a control cannot go nameless halfway through being used.

The clear button is hidden with `visibility` rather than `hidden`, and not for the picture.
An invisible element still has a box, so the field does not jump a button's width wider the
moment you stop typing, and the words never run under a cross that is about to appear over
them. It is out of the tab order and out of the accessibility tree either way.

Search inputs come with a clear button of their own in one engine, at one size, in a style
nobody chose. This one has its own, so that one is turned off.
