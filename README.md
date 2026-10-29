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

| Demo                                            | What it shows                                                                                                                                                   |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Accordion](demos/accordion/)                   | A stack of headings that each open a section of content. The chevron morphs as a section opens or closes.                                                       |
| [Add new card](demos/add-new-card/)             | An empty, dashed tile for adding a new item to a grid. Its plus icon turns when you hover over it.                                                              |
| [Add to cart](demos/add-to-cart/)               | A product action with an Add to cart button and a heart for saving. The button confirms the item was added, and the heart fills when you save it.               |
| [Alerts](demos/alert/)                          | Short messages about a change or a problem, in four types. Each icon plays as the alert appears.                                                                |
| [Button progress](demos/button-progress/)       | A button that shows the progress of a download or upload. The icon loops while the file transfers, then a receipt confirms it’s done.                           |
| [Categories section](demos/categories-section/) | Three rows of category chips that scroll without end, the middle one the other way. A row stops under the pointer, and the chip’s icon plays.                   |
| [Checkbox list](demos/checkbox-list/)           | A list of options to tick, in three styles. The checkbox icon morphs into a tick when you select it.                                                            |
| [Command menu](demos/command-menu/)             | A search palette for jumping to commands, opened with a keyboard shortcut. Icons react as you move through the commands with the mouse or the arrow keys.       |
| [Dropdown menu](demos/dropdown-menu/)           | A menu of grouped actions that opens from a button. Icons react to the mouse and the arrow keys.                                                                |
| [Input form](demos/input-form/)                 | A message composer pinned to the bottom of the page. Its menu opens upward, with a submenu and a search inside.                                                 |
| [Loading list](demos/loading-list/)             | A checklist showing the steps of a running task. Each spinner turns into a tick or a cross when its step finishes.                                              |
| [Mega menu](demos/mega-menu/)                   | A site header whose Resources link opens a wide panel of tiles. A tile lights up and its icon plays when you hover over it.                                     |
| [Menu bar](demos/menu-bar/)                     | A toolbar of tools and formatting options. Icons morph into place as you pick a tool or list style, and play when pressed.                                      |
| [Notification menu](demos/notification-menu/)   | A bell that opens a list of recent notifications. It rings when a new one arrives.                                                                              |
| [Pagination](demos/pagination/)                 | Page navigation for long lists, in three button styles. A highlight slides to the page you pick.                                                                |
| [Password field](demos/password-field/)         | A password input with a show/hide toggle and error messages. The lock reacts when you click into the field, and the eye morphs open and closed with the toggle. |
| [Pricing](demos/pricing/)                       | Cards comparing subscription plans, in four layouts. Each plan’s icon plays when you hover over its card.                                                       |
| [Rating](demos/rating/)                         | A row of five stars for rating something. Stars light up one by one as you hover and morph into filled stars when you pick a rating.                            |
| [Search bar](demos/search-bar/)                 | A search field with a clear button. The magnifier reacts when you click into the field, and the cross icon appears once you stop typing.                        |
| [Sidebar navigation](demos/sidebar-navigation/) | A side menu linking to pages of an app. Icons react to hover and the keyboard, and the current page is highlighted.                                             |
| [Star button](demos/star-button/)               | A button for starring an item, with a counter. The star morphs into a filled one when you press it, and the count goes up.                                      |
| [Title with icon](demos/title-with-icon/)       | A heading with icons between its words, plain or in a box. Each icon plays when you hover over it.                                                              |

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
