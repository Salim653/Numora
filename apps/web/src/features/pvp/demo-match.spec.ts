import { describe, expect, it } from 'vitest';
import { demoMatchReducer, initialMatch } from './demo-match';

describe('PvP demo state', () => {
  it('locks a submitted answer and resumes the same question after reconnect', () => {
    let state = demoMatchReducer(initialMatch, { type: 'createRoom' });
    state = demoMatchReducer(state, { type: 'joinOpponent' });
    state = demoMatchReducer(state, { type: 'start' });
    state = demoMatchReducer(state, { type: 'select', option: 1 });
    state = demoMatchReducer(state, { type: 'submit' });
    state = demoMatchReducer(state, { type: 'select', option: 2 });
    expect(state.selected).toBe(1);
    expect(state.submittedCount).toBe(1);

    state = demoMatchReducer(state, { type: 'disconnect' });
    state = demoMatchReducer(state, { type: 'tick' });
    expect(state.reconnectLeft).toBe(19);
    expect(state.remaining).toBe(29);
    state = demoMatchReducer(state, { type: 'reconnect' });
    expect(state).toMatchObject({ phase: 'question', index: 0, locked: true, disconnected: false });

    state = demoMatchReducer(state, { type: 'opponentAnswer' });
    state = demoMatchReducer(state, { type: 'next' });
    expect(state).toMatchObject({ phase: 'question', index: 1, selected: null, locked: false });

    for (let index = 1; index < 10; index += 1) {
      state = demoMatchReducer(state, { type: 'select', option: 0 });
      state = demoMatchReducer(state, { type: 'submit' });
      state = demoMatchReducer(state, { type: 'opponentAnswer' });
      state = demoMatchReducer(state, { type: 'next' });
    }
    expect(state).toMatchObject({ phase: 'result', outcome: 'completed', submittedCount: 10 });
  });

  it('does not count a selected option when time runs out before submit', () => {
    let state = demoMatchReducer(initialMatch, { type: 'createRoom' });
    state = demoMatchReducer(state, { type: 'joinOpponent' });
    state = demoMatchReducer(state, { type: 'start' });
    state = demoMatchReducer(state, { type: 'select', option: 2 });
    for (let second = 0; second < 30; second += 1)
      state = demoMatchReducer(state, { type: 'tick' });
    expect(state).toMatchObject({ phase: 'resolved', selected: null, submittedCount: 0 });
  });
});
