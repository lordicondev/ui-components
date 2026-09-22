/**
 * A text field that says, in two attributes, what is happening to it.
 *
 *     <div class="field" data-focused="false" data-clearable="false">
 *         <lord-icon … trigger="focus-attention" target=".field"></lord-icon>
 *         <input class="field__input" />
 *         <button class="field__clear">…</button>
 *     </div>
 *
 * `data-focused` is whether the cursor is in it. `data-clearable` is whether there is
 * anything worth offering to clear — deliberately not the same question as whether the field
 * is empty, for the reason written over the settle timer below. Icons watch the attributes
 * through their own triggers and the stylesheet watches them too; nothing here knows about
 * either, which is what lets one field answer a magnifier and a cross at once.
 *
 * The clear button is optional. A field without one never sets `data-clearable` and never
 * starts a timer, which is the whole of what a search box inside a menu needs.
 *
 * A note for anyone reading this beside `password-field`: that demo also has a `.field` and a
 * `.field__input`, but a differently shaped control — a grid wrapper with `.field__control`
 * inside it, focus wired through the input's own `focus`/`blur`, and no clearable state at
 * all. It does not call this, and should not.
 */

/** How long the quiet has to last before a field offers to be emptied. */
const SETTLED = 500;

export type FieldOptions = { settled?: number };

/**
 * Wires every `.field` under `root`.
 *
 * Called once, for a page that keeps its controls — the same shape as `tooltips()` and
 * `popovers()`, and for the same reason: nothing here needs taking apart.
 */
export function fields(root: ParentNode = document, options: FieldOptions = {}): void {
    for (const field of root.querySelectorAll<HTMLElement>('.field')) {
        wire(field, options.settled ?? SETTLED);
    }
}

function wire(field: HTMLElement, settled: number): void {
    const input = field.querySelector<HTMLInputElement>('.field__input');
    if (!input) return;

    const clear = field.querySelector<HTMLButtonElement>('.field__clear');
    let settling: ReturnType<typeof setTimeout> | undefined;

    /** Offer to clear, or stop offering. The icon and the stylesheet both read this. */
    const offer = (clearable: boolean) => {
        clearTimeout(settling);
        field.dataset.clearable = String(clearable);
    };

    // #region focus
    // The whole field, not the input: there are two things inside it that can hold focus, and
    // as far as anyone looking at it is concerned the control is focused if either does. So
    // `focusin`/`focusout`, which bubble, rather than the input's own `focus` and `blur`.
    field.addEventListener('focusin', () => (field.dataset.focused = 'true'));

    field.addEventListener('focusout', (event) => {
        // Reaching for the clear button is not leaving. Without this the field flickers grey
        // for the frame between losing the input and being handed back — `focusout` arrives
        // before `focusin`, so the way out has to know where focus is going.
        if (field.contains(event.relatedTarget as Node | null)) return;

        // Leaving settles the typing too. Whatever you were in the middle of, you have
        // stopped, and the field can say what it holds without waiting out the rest of it.
        field.dataset.focused = 'false';
        if (clear && input.value) offer(true);
    });
    // #endregion

    if (!clear) return;

    // #region settle
    /*
     * The cross is not news while you are still typing. It is an answer to a question you have
     * not finished asking, and an icon drawing itself in beside a moving caret is the one thing
     * in the field competing with what you came here to do. So it waits for the keyboard.
     */
    input.addEventListener('input', () => {
        clearTimeout(settling);

        // Nothing left to clear, and no reason to wait half a second to say so.
        if (!input.value) return offer(false);

        // Once it is there it stays: a button that hopped away on the next keystroke would be
        // gone exactly when you reached for it.
        if (field.dataset.clearable === 'true') return;

        settling = setTimeout(() => offer(true), settled);
    });
    // #endregion

    // Clearing is not leaving. The cursor goes back where it was, and the icon watching
    // `data-focused` does not play again — that attribute never changed.
    //
    // The event is raised by hand because setting `value` from script does not raise one, and
    // whatever the field feeds — a list being filtered, say — is listening for exactly that.
    // A field emptied by its own button and one emptied by holding backspace are the same
    // thing as far as anything downstream is concerned.
    clear.addEventListener('click', () => {
        input.value = '';
        offer(false);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
    });
}
