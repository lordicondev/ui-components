import type { Player } from '@lordicon/web';

/** A frame range, `[start, end)`, as the player's `switchSegment()` takes it. */
export type Segment = [number, number];

type State = Player['availableStates'][number];

/**
 * The frames of one state. The end of a segment is exclusive, so `+ 1` keeps the state's
 * last frame in.
 */
export function stateSegment(state: State): Segment {
    return [state.time, state.time + state.duration + 1];
}

/** The state named by the player's `state`, or null when there is none. */
export function currentState(player: Player): State | null {
    return player.availableStates.find((state) => state.name === player.state) ?? null;
}

/**
 * Splits the current morph state in two. A morph marker carries a ratio, e.g.
 * `morph-close:0.5`: frames up to the ratio go to the second look, the rest come back.
 * Returns null when the current state is not a morph.
 */
export function splitAtRatio(player: Player): [Segment, Segment] | null {
    const state = currentState(player);
    const ratio = state?.params.length ? parseFloat(state.params[0]) : NaN;
    if (!state || !(ratio > 0 && ratio <= 1)) return null;

    const [start, end] = stateSegment(state);
    const boundary = start + Math.floor((state.duration + 1) * ratio);

    return [
        [start, boundary],
        [boundary, end],
    ];
}
