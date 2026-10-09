# UI Components by Lordicon

Lordicon system icons in real UI controls: a password field, a menu, a rating, a
button that shows progress, and more. Every demo makes the same point: an icon is a
reaction to the state of a control, and wiring it up is mostly markup.

Application code sets the control's state in the DOM, usually with ARIA. A Lordicon
trigger watches that state and animates the icon. Neither knows about the other.

```html
<button type="button" class="toggle" aria-label="Show password" aria-pressed="false">
    <lord-icon
        src="icons/eye.json"
        state="morph-close"
        trigger="follow(aria-pressed)"
        target=".toggle"
        aria-hidden="true"
    ></lord-icon>
</button>
```

```ts
toggle.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(show)); // the icon follows on its own
});
```

## The demos

Each demo has a page on the [portal](https://components.lordicon.com/) with the demo
running, the code that matters, and every file it is made of.

| Demo                                            | What it shows                                                                                                                      |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [Accordion](demos/accordion/)                   | A chevron that morphs with aria-expanded, over a panel that animates its own height.                                               |
| [Add new card](demos/add-new-card/)             | A dashed tile with a plus that turns on hover. The whole script is defineElement().                                                |
| [Add to cart](demos/add-to-cart/)               | A button that opens to say what it did, and a heart that stays filled. One attribute each.                                         |
| [Alerts](demos/alert/)                          | Four kinds of alert, and icons that greet the card they arrive on.                                                                 |
| [Button progress](demos/button-progress/)       | A button that fills while the work runs, loops its icon until the work stops, and shows a receipt. As a download and as an upload. |
| [Checkbox list](demos/checkbox-list/)           | Native checkboxes whose tick is an icon following data-checked, in three styles.                                                   |
| [Command menu](demos/command-menu/)             | A palette you open with a shortcut and walk with the arrow keys while the caret stays in the field.                                |
| [Dropdown menu](demos/dropdown-menu/)           | A menu of grouped commands whose rows answer the arrow keys and the pointer through one attribute.                                 |
| [Input form](demos/input-form/)                 | A composer at the foot of the page, so its menu opens upward, with a submenu and a search inside.                                  |
| [Loading list](demos/loading-list/)             | Five steps of a job, each with a spinner that turns into a tick or a cross. The state of a step is one attribute.                  |
| [Menu bar](demos/menu-bar/)                     | A toolbar where the picked tool and the list style morph into place, the action plays on press, and every button shows its name.   |
| [Notification menu](demos/notification-menu/)   | A bell that rings when the count goes up, over a panel that unrolls and brings its rows in behind it.                              |
| [Pagination](demos/pagination/)                 | A frame that stretches to the page you picked and then catches up with itself, in three styles of button.                          |
| [Password field](demos/password-field/)         | A lock that answers focus, an eye that follows the toggle, and a hint that arrives word by word.                                   |
| [Pricing](demos/pricing/)                       | Three plans whose icons play when the pointer enters the card. In four layouts.                                                    |
| [Rating](demos/rating/)                         | Five stars that light up one after another, and fill the same way when you pick one.                                               |
| [Search bar](demos/search-bar/)                 | A field whose magnifier greets the cursor, and whose clear button draws itself once the typing has stopped.                        |
| [Sidebar navigation](demos/sidebar-navigation/) | Seven destinations whose icons answer the pointer and the keyboard, and one attribute that says where you are.                     |
| [Star button](demos/star-button/)               | A star that fills as you press it, with a count read back off the same attribute.                                                  |

## Take a demo

Every demo is also a standalone Vite project on the `standalone` branch. Copy one, install,
run:

```sh
npx giget@latest gh:lordicondev/ui-components/password-field#standalone password-field
cd password-field
npm install
npm run dev
```

The demo page offers the same copy as a ZIP and on StackBlitz. Each copy carries its own
`README.md` with the icons' triggers and what to know before adapting it.

## How a demo is built

- `index.html` puts a `<lord-icon>` in the control, with `trigger` naming a behaviour and
  `target` naming the element whose state it follows.
- `main.ts` defines the element, then sets the control's state: an ARIA attribute or a
  `data-*` attribute. It never touches the icon.
- The triggers are built into `@lordicon/element`: `follow` for state, `hover` and `click`
  for the pointer. They read nothing but the target's attributes and native events. The
  one trigger of our own is in `shared/triggers/`; see [shared/README.md](shared/README.md).
- An icon on screen from the start holds an `<img>` of its first frame, which shows until
  the icon is ready. Most load only on the first pointer, click or focus on their control
  (`loading="interaction"`). Before the script runs, `lord-icon:not(:defined)` in
  `shared/styles/base.css` gives the element its final size, so nothing moves.

To add a demo or work on the repo, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

- Code (demos, shared modules, scripts, portal): [MIT](LICENSE.md).
- Icons: [Lordicon License Terms](https://lordicon.com/licenses). The MIT licence does not
  cover them.
- Fonts: Figtree and JetBrains Mono, under the SIL Open Font License (`shared/fonts/OFL-*.txt`).

See [LICENSE.md](LICENSE.md) for the details.
