<a href="https://components.lordicon.com/?utm_source=github&utm_medium=readme&utm_campaign=ui-components&utm_content=repo-banner">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset=".github/assets/lordicon-ui-components-repo-dark.gif">
        <img src=".github/assets/lordicon-ui-components-repo-light.gif" width="100%" alt="UI Components by Lordicon: animated icons in real UI controls">
    </picture>
</a>

# Animated UI Components by Lordicon – Free Interactive Components

Lordicon system icons wired into everyday controls: a password field, a menu, a rating, a
button that shows progress, and more. Every demo makes the same point: an icon is a
reaction to the state of a control, and wiring it up is mostly markup.

**[See every component live on components.lordicon.com →](https://components.lordicon.com/?utm_source=github&utm_medium=readme&utm_campaign=ui-components&utm_content=intro-link)**

Application code sets the control's state in the DOM, usually with ARIA. A Lordicon
trigger watches that state and animates the icon. Neither knows about the other.

```html
<button type="button" class="toggle" aria-label="Show password" aria-pressed="false">
    <lord-icon
        src="icons/system-outline-69-eye.json"
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

Each demo has a page on [components.lordicon.com](https://components.lordicon.com/) with the demo
running, the code that matters, and every file it is made of. Click a preview to open it.

### Buttons

| Preview                                                                                                                                                                                                                                                           | Demo                                      | What it shows                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="https://components.lordicon.com/demos/add-to-cart/"><img src="portal/src/gifs/animated-add-to-cart-button.gif" width="200" alt="Animated add to cart button with heart icon: cart confirms the item and the heart fills when saved"></a>                 | [Add to cart](demos/add-to-cart/)         | A product action with an Add to cart button and a heart for saving. The button confirms the item was added, and the heart fills when you save it. |
| <a href="https://components.lordicon.com/demos/button-progress/"><img src="portal/src/gifs/animated-download-progress-button.gif" width="200" alt="Animated download progress button: icon loops during the file transfer and a receipt confirms completion"></a> | [Button progress](demos/button-progress/) | A button that shows the progress of a download or upload. The icon loops while the file transfers, then a receipt confirms it’s done.             |
| <a href="https://components.lordicon.com/demos/icon-button/"><img src="portal/src/gifs/animated-bookmark-icon-button.gif" width="200" alt="Animated bookmark icon button: bookmark fills on click and a short message confirms the item was saved"></a>           | [Icon button](demos/icon-button/)         | A bookmark button with no label. The bookmark fills when you press it, and a short message confirms the item was saved.                           |
| <a href="https://components.lordicon.com/demos/simple-button/"><img src="portal/src/gifs/animated-call-us-button.gif" width="200" alt="Animated Call us button: phone icon rings on hover"></a>                                                                   | [Simple button](demos/simple-button/)     | A Call us button. The phone icon rings when you point at it.                                                                                      |
| <a href="https://components.lordicon.com/demos/star-button/"><img src="portal/src/gifs/animated-star-button-counter.gif" width="200" alt="Animated star button with counter: star morphs into a filled star on click and the count goes up"></a>                  | [Star button](demos/star-button/)         | A button for starring an item, with a counter. The star morphs into a filled one when you press it, and the count goes up.                        |
| <a href="https://components.lordicon.com/demos/toolbar/"><img src="portal/src/gifs/animated-text-editor-toolbar.gif" width="200" alt="Animated text editor toolbar: tool and list style icons morph into place when selected and play when pressed"></a>          | [Toolbar](demos/toolbar/)                 | A row of tools and formatting options. Icons morph into place as you pick a tool or list style, and play when pressed.                            |

### Forms & Inputs

| Preview                                                                                                                                                                                                                                                             | Demo                                    | What it shows                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="https://components.lordicon.com/demos/checkbox-list/"><img src="portal/src/gifs/animated-checkbox-list-component.gif" width="200" alt="Animated checkbox list in three styles: checkbox icon morphs into a tick when selected"></a>                        | [Checkbox list](demos/checkbox-list/)   | A list of options to tick, in three styles. The checkbox icon morphs into a tick when you select it.                                                            |
| <a href="https://components.lordicon.com/demos/input-form/"><img src="portal/src/gifs/animated-chat-input-form.gif" width="200" alt="Animated chat message input form with an upward menu, submenu and search, icons animating on hover"></a>                       | [Input form](demos/input-form/)         | A message composer pinned to the bottom of the page. Its menu opens upward, with a submenu and a search inside.                                                 |
| <a href="https://components.lordicon.com/demos/password-field/"><img src="portal/src/gifs/animated-password-field-show-hide.gif" width="200" alt="Animated password field: lock reacts on focus and eye icon morphs open and closed with the show/hide toggle"></a> | [Password field](demos/password-field/) | A password input with a show/hide toggle and error messages. The lock reacts when you click into the field, and the eye morphs open and closed with the toggle. |
| <a href="https://components.lordicon.com/demos/rating/"><img src="portal/src/gifs/animated-star-rating-component.gif" width="200" alt="Animated star rating: five stars light up one by one on hover and fill when a rating is selected"></a>                       | [Rating](demos/rating/)                 | A row of five stars for rating something. Stars light up one by one as you hover and morph into filled stars when you pick a rating.                            |
| <a href="https://components.lordicon.com/demos/search-bar/"><img src="portal/src/gifs/animated-search-bar-component.gif" width="200" alt="Animated search bar: magnifier icon reacts on focus and a clear button appears after typing"></a>                         | [Search bar](demos/search-bar/)         | A search field with a clear button. The magnifier reacts when you click into the field, and the cross icon appears once you stop typing.                        |

### Menus

| Preview                                                                                                                                                                                                                                                                | Demo                                          | What it shows                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="https://components.lordicon.com/demos/command-menu/"><img src="portal/src/gifs/animated-command-menu-component.gif" width="200" alt="Animated command menu search palette: icons react while moving through commands with mouse or arrow keys"></a>           | [Command menu](demos/command-menu/)           | A search palette for jumping to commands, opened with a keyboard shortcut. Icons react as you move through the commands with the mouse or the arrow keys. |
| <a href="https://components.lordicon.com/demos/dropdown-menu/"><img src="portal/src/gifs/animated-dropdown-menu-component.gif" width="200" alt="Animated dropdown menu with grouped actions: icons react to hover and keyboard navigation"></a>                        | [Dropdown menu](demos/dropdown-menu/)         | A menu of grouped actions that opens from a button. Icons react to the mouse and the arrow keys.                                                          |
| <a href="https://components.lordicon.com/demos/notification-menu/"><img src="portal/src/gifs/animated-notification-menu-bell.gif" width="200" alt="Animated notification menu: bell icon rings when a new notification arrives and opens a list of recent alerts"></a> | [Notification menu](demos/notification-menu/) | A bell that opens a list of recent notifications. It rings when a new one arrives.                                                                        |

### Navigation

| Preview                                                                                                                                                                                                                                                           | Demo                                            | What it shows                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| <a href="https://components.lordicon.com/demos/mega-menu/"><img src="portal/src/gifs/animated-mega-menu-component.gif" width="200" alt="Animated mega menu: Resources panel opens with link tiles that light up and play their icons on hover"></a>               | [Mega menu](demos/mega-menu/)                   | A site header with a Resources menu that opens a wide panel of links. Each tile lights up and plays its icon when you point at it. |
| <a href="https://components.lordicon.com/demos/pagination/"><img src="portal/src/gifs/animated-pagination-component.gif" width="200" alt="Animated pagination in three button styles: highlight slides to the selected page"></a>                                 | [Pagination](demos/pagination/)                 | Page navigation for long lists, in three button styles. A highlight slides to the page you pick.                                   |
| <a href="https://components.lordicon.com/demos/sidebar-navigation/"><img src="portal/src/gifs/animated-sidebar-navigation-menu.gif" width="200" alt="Animated sidebar navigation menu: icons react to hover and keyboard, with the current page highlighted"></a> | [Sidebar navigation](demos/sidebar-navigation/) | A side menu linking to pages of an app. Icons react to hover and the keyboard, and the current page is highlighted.                |

### Feedback & Progress

| Preview                                                                                                                                                                                                                                         | Demo                                | What it shows                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| <a href="https://components.lordicon.com/demos/alert/"><img src="portal/src/gifs/animated-alert-component.gif" width="200" alt="Animated alert messages in four types: success, info, warning and error icons play as each alert appears"></a>  | [Alerts](demos/alert/)              | Short messages about a change or a problem, in four types. Each icon plays as the alert appears.                   |
| <a href="https://components.lordicon.com/demos/loading-list/"><img src="portal/src/gifs/animated-loading-list-component.gif" width="200" alt="Animated loading checklist: spinners turn into a tick or a cross as each task step finishes"></a> | [Loading list](demos/loading-list/) | A checklist showing the steps of a running task. Each spinner turns into a tick or a cross when its step finishes. |

### Containers

| Preview                                                                                                                                                                                                                          | Demo                                | What it shows                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| <a href="https://components.lordicon.com/demos/accordion/"><img src="portal/src/gifs/animated-accordion-component.gif" width="200" alt="Animated accordion component: chevron icon morphs as each section opens and closes"></a> | [Accordion](demos/accordion/)       | A stack of headings that each open a section of content. The chevron morphs as a section opens or closes. |
| <a href="https://components.lordicon.com/demos/add-new-card/"><img src="portal/src/gifs/animated-add-new-card-component.gif" width="200" alt="Animated add new card tile: dashed card with a plus icon that turns on hover"></a> | [Add new card](demos/add-new-card/) | An empty, dashed tile for adding a new item to a grid. Its plus icon turns when you hover over it.        |

### Page sections

| Preview                                                                                                                                                                                                                                                 | Demo                                            | What it shows                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="https://components.lordicon.com/demos/categories-section/"><img src="portal/src/gifs/animated-categories-section.gif" width="200" alt="Animated categories section: three rows of scrolling category chips with icons that play on hover"></a> | [Categories section](demos/categories-section/) | Three rows of category chips that scroll without end, the middle one the other way. Point at a row to stop it; the chip’s icon plays. |
| <a href="https://components.lordicon.com/demos/pricing/"><img src="portal/src/gifs/animated-pricing-cards-section.gif" width="200" alt="Animated pricing cards comparing subscription plans: each plan icon plays on hover"></a>                        | [Pricing](demos/pricing/)                       | Cards comparing subscription plans, in four layouts. Each plan’s icon plays when you hover over its card.                             |
| <a href="https://components.lordicon.com/demos/title-with-icon/"><img src="portal/src/gifs/animated-title-with-icons.gif" width="200" alt="Animated heading with icons between words, plain and boxed, icons playing one after another"></a>            | [Title with icon](demos/title-with-icon/)       | A heading with icons between its words, plain or in a box. The icons play by themselves, one after another.                           |

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
