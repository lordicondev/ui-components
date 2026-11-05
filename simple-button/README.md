# Simple button

A Call us button. The phone icon rings when you point at the button.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger | Watches                    | On        |
| ------- | -------------------------- | --------- |
| `hover` | the pointer, on the button | the phone |

`target=".button"` makes the whole button the hover area. The icon plays its default state
once.

## Notes

- The colours are the brand colour in three steps: resting, hovered and pressed.
- To place a real call, make it a link: `<a class="button" href="tel:…">`.

---

Exported from [lordicondev/ui-components](https://github.com/lordicondev/ui-components/tree/main/demos/simple-button) 1.1.0,
where it sits alongside the other demos.

The code is MIT. The icons are under the [Lordicon License Terms](https://lordicon.com/licenses);
see [LICENSE.md](LICENSE.md).
