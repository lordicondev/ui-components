import type { IconState, LordIconElement } from '@lordicon/element';
import { beforeEach, describe, expect, it } from 'vitest';
import { PreviewMorph } from './preview-morph.ts';
import { playerStub, type StubPlayer } from './testing/player-stub.ts';

/** Like the star icon: a default state for the nudge, and a morph. */
function states(): IconState[] {
    return [
        { name: 'hover-pinch', time: 70, duration: 60, params: [], default: true },
        { name: 'morph-select', time: 140, duration: 60, params: ['0.5'] },
    ] as IconState[];
}

function mount(options: { chosen?: boolean; reducedMotion?: boolean } = {}) {
    const target = document.createElement('label');
    target.setAttribute('data-chosen', String(options.chosen ?? false));
    target.setAttribute('data-lit', String(options.chosen ?? false));

    const icon = document.createElement('span');
    target.append(icon);
    document.body.append(target);

    const player = playerStub({ states: states(), state: 'morph-select' });
    const trigger = new PreviewMorph({
        player,
        element: icon as unknown as LordIconElement,
        target,
        signal: new AbortController().signal,
        options: { attr: 'data-chosen', preview: 'data-lit' },
        reducedMotion: options.reducedMotion ?? false,
        setAnimating: () => {},
    });

    /** The MutationObserver is async, so wait a tick after every change. */
    const set = async (attribute: string, value: boolean) => {
        target.setAttribute(attribute, String(value));
        await Promise.resolve();
    };

    return { trigger, player, target, set };
}

function ready(player: StubPlayer, trigger: { onReady?: () => void }) {
    player.ready = true;
    trigger.onReady?.();
}

beforeEach(() => {
    document.body.replaceChildren();
});

describe('preview-morph', () => {
    it('nudges with the default state when the preview arrives', async () => {
        const { trigger, player, set } = mount();
        ready(player, trigger);
        player.calls.length = 0;

        await set('data-lit', true);
        expect(player.lastSegment).toEqual([70, 131]);
        expect(player.calls).toEqual(['play:segment']);
    });

    it('stays put when the icon already holds the chosen look', async () => {
        const { trigger, player, set } = mount({ chosen: true });
        ready(player, trigger);
        player.calls.length = 0;

        await set('data-lit', false);
        await set('data-lit', true);
        expect(player.calls).toEqual([]);
    });

    it('says nothing when the preview is withdrawn', async () => {
        const { trigger, player, set } = mount();
        ready(player, trigger);
        await set('data-lit', true);
        player.calls.length = 0;

        await set('data-lit', false);
        expect(player.calls).toEqual([]);
    });

    it('drops a second nudge while the first is still playing', async () => {
        const { trigger, player, set } = mount();
        ready(player, trigger);
        await set('data-lit', true);
        player.playing = true;
        player.calls.length = 0;

        await set('data-lit', false);
        await set('data-lit', true);
        expect(player.calls).toEqual([]);
    });

    it('takes the player back rather than reversing a nudge it did not start', async () => {
        const { trigger, player, set } = mount();
        ready(player, trigger);
        await set('data-lit', true);
        player.playing = true;
        player.calls.length = 0;

        // The rating changes mid-nudge. The morph must load its own half, not reverse the nudge.
        await set('data-chosen', true);
        expect(player.calls).toEqual(['play:segment']);
        expect(player.lastSegment).toEqual([140, 170]);
        expect(player.direction).toBe(1);
    });

    it('still reverses a morph it did start', async () => {
        const { trigger, player, set } = mount();
        ready(player, trigger);
        await set('data-chosen', true);
        player.playing = true;
        player.calls.length = 0;

        await set('data-chosen', false);
        expect(player.calls).toEqual(['play']);
        expect(player.direction).toBe(-1);
    });

    it('leaves the nudge out under reduced motion', async () => {
        const { trigger, player, set } = mount({ reducedMotion: true });
        ready(player, trigger);
        player.calls.length = 0;

        await set('data-lit', true);
        expect(player.calls).toEqual([]);
    });
});
