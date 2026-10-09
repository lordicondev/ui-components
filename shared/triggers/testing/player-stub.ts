import type { IconState, Player, PlayOptions, Segment } from '@lordicon/element';

/** `play:segment` is `play({ segment })`, `seek:end` is `seek('end')`, `segment` a new segment. */
export type PlayerCall = 'play' | 'play:segment' | 'seek:start' | 'seek:end' | 'segment';

/**
 * A stand-in for the Lordicon player that records the calls a trigger makes. A trigger only
 * talks to the player through these few members.
 */
export type StubPlayer = Player & {
    calls: PlayerCall[];
    ready: boolean;
    playing: boolean;
    direction: 1 | -1;
    lastSegment: Segment | null;
};

export function playerStub(options: { states?: IconState[]; state?: string } = {}): StubPlayer {
    const calls: PlayerCall[] = [];

    const stub = {
        calls,
        ready: false,
        playing: false,
        direction: 1 as 1 | -1,
        lastSegment: null as Segment | null,
        state: options.state ?? null,
        states: options.states ?? [],
        get currentState(): IconState | null {
            return stub.states.find((state) => state.name === stub.state) ?? null;
        },

        play: ({ segment }: PlayOptions = {}) => {
            if (segment) {
                stub.lastSegment = segment;
                stub.direction = 1;
            }
            calls.push(segment ? 'play:segment' : 'play');
            return Promise.resolve(true);
        },
        seek: (frame: 'start' | 'end') => void calls.push(`seek:${frame}`),
        set segment(segment: Segment | null) {
            stub.lastSegment = segment;
            stub.direction = 1;
            calls.push('segment');
        },
    };

    return stub as unknown as StubPlayer;
}
