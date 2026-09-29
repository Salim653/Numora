// Prototype-only state. No score, XP, or match result from this file is authoritative.
export type Difficulty = 'easy' | 'medium' | 'hard';
export type DemoPhase = 'lobby' | 'room' | 'ready' | 'question' | 'resolved' | 'result';

export const durations: Record<Difficulty, number> = { easy: 30, medium: 45, hard: 60 };
export const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Mudah',
  medium: 'Sedang',
  hard: 'Sulit',
};

export const demoQuestions = [
  { prompt: 'Berapakah hasil dari 18 + 24?', options: ['40', '42', '44', '46'] },
  { prompt: 'Jika 5x = 35, berapakah nilai x?', options: ['5', '6', '7', '8'] },
  { prompt: 'Berapakah ¾ dari 20?', options: ['12', '15', '16', '18'] },
  {
    prompt: 'Luas persegi dengan sisi 8 cm adalah…',
    options: ['16 cm²', '32 cm²', '64 cm²', '80 cm²'],
  },
  { prompt: 'Berapakah nilai dari 3² + 4²?', options: ['12', '24', '25', '49'] },
  { prompt: 'Pola 2, 5, 8, 11, … dilanjutkan dengan…', options: ['12', '13', '14', '15'] },
  { prompt: 'Jika 2(x + 3) = 16, berapakah x?', options: ['4', '5', '6', '8'] },
  { prompt: 'Sudut siku-siku besarnya…', options: ['45°', '60°', '90°', '180°'] },
  { prompt: 'Berapakah rata-rata dari 4, 6, dan 8?', options: ['5', '6', '7', '8'] },
  { prompt: 'Berapakah hasil 12 × 7?', options: ['72', '78', '84', '96'] },
] as const;

export type DemoMatch = {
  phase: DemoPhase;
  difficulty: Difficulty;
  index: number;
  remaining: number;
  selected: number | null;
  locked: boolean;
  opponentAnswered: boolean;
  submittedCount: number;
  disconnected: boolean;
  reconnectLeft: number;
  outcome: 'completed' | 'forfeit-preview' | null;
};

export const initialMatch: DemoMatch = {
  phase: 'lobby',
  difficulty: 'easy',
  index: 0,
  remaining: 30,
  selected: null,
  locked: false,
  opponentAnswered: false,
  submittedCount: 0,
  disconnected: false,
  reconnectLeft: 20,
  outcome: null,
};

export type DemoAction =
  | { type: 'chooseDifficulty'; difficulty: Difficulty }
  | { type: 'createRoom' }
  | { type: 'joinOpponent' }
  | { type: 'start' }
  | { type: 'select'; option: number }
  | { type: 'submit' }
  | { type: 'opponentAnswer' }
  | { type: 'tick' }
  | { type: 'next' }
  | { type: 'disconnect' }
  | { type: 'reconnect' }
  | { type: 'reset' };

export function demoMatchReducer(state: DemoMatch, action: DemoAction): DemoMatch {
  switch (action.type) {
    case 'chooseDifficulty':
      return state.phase === 'lobby'
        ? { ...state, difficulty: action.difficulty, remaining: durations[action.difficulty] }
        : state;
    case 'createRoom':
      return state.phase === 'lobby' ? { ...state, phase: 'room' } : state;
    case 'joinOpponent':
      return state.phase === 'room' ? { ...state, phase: 'ready' } : state;
    case 'start':
      return state.phase === 'ready' ? { ...state, phase: 'question' } : state;
    case 'select':
      return state.phase === 'question' &&
        !state.locked &&
        !state.disconnected &&
        action.option >= 0 &&
        action.option < 4
        ? { ...state, selected: action.option }
        : state;
    case 'submit':
      if (
        state.phase !== 'question' ||
        state.locked ||
        state.selected === null ||
        state.disconnected
      )
        return state;
      return {
        ...state,
        locked: true,
        submittedCount: state.submittedCount + 1,
        phase: state.opponentAnswered ? 'resolved' : 'question',
      };
    case 'opponentAnswer':
      if (state.phase !== 'question') return state;
      return { ...state, opponentAnswered: true, phase: state.locked ? 'resolved' : 'question' };
    case 'tick': {
      let next = state;
      if (next.phase === 'question') {
        const remaining = Math.max(0, next.remaining - 1);
        next = {
          ...next,
          remaining,
          phase: remaining === 0 ? 'resolved' : 'question',
          locked: remaining === 0 || next.locked,
          selected: remaining === 0 && !next.locked ? null : next.selected,
        };
      }
      if (next.disconnected) {
        const reconnectLeft = Math.max(0, next.reconnectLeft - 1);
        next =
          reconnectLeft === 0
            ? { ...next, reconnectLeft, phase: 'result', outcome: 'forfeit-preview' }
            : { ...next, reconnectLeft };
      }
      return next;
    }
    case 'next':
      if (state.phase !== 'resolved' || state.disconnected) return state;
      if (state.index === demoQuestions.length - 1)
        return { ...state, phase: 'result', outcome: 'completed' };
      return {
        ...state,
        phase: 'question',
        index: state.index + 1,
        remaining: durations[state.difficulty],
        selected: null,
        locked: false,
        opponentAnswered: false,
      };
    case 'disconnect':
      return state.phase === 'question' || state.phase === 'resolved'
        ? { ...state, disconnected: true, reconnectLeft: 20 }
        : state;
    case 'reconnect':
      return state.disconnected ? { ...state, disconnected: false, reconnectLeft: 20 } : state;
    case 'reset':
      return initialMatch;
  }
}
