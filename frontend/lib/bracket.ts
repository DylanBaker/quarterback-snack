export type BracketSlots = number[][];

export interface Derived {
  slots: BracketSlots;
  roundIndex: number;
  matchIndex: number;
  phase: "play" | "champion";
  leftId: number;
  rightId: number;
}

export function shuffleSeeds(): number[] {
  const seeds = Array.from({ length: 32 }, (_, i) => i);
  for (let i = seeds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [seeds[i], seeds[j]] = [seeds[j], seeds[i]];
  }
  return seeds;
}

export function deriveBracket(picks: number[], seeds: number[]): Derived {
  const slots: BracketSlots = [seeds];

  let pickCursor = 0;
  // 5 rounds: 16, 8, 4, 2, 1 matchups
  const matchupsPerRound = [16, 8, 4, 2, 1];

  for (const matchupCount of matchupsPerRound) {
    const prev = slots[slots.length - 1];
    const next: number[] = [];
    for (let m = 0; m < matchupCount; m++) {
      if (pickCursor < picks.length) {
        next.push(picks[pickCursor++]);
      } else {
        // Placeholders for unpicked slots
        next.push(prev[2 * m], prev[2 * m + 1]);
        break;
      }
    }
    slots.push(next);
    if (pickCursor >= picks.length && picks.length < 31) break;
  }

  // Determine current round and match
  const roundIndex = Math.min(
    matchupsPerRound.findIndex((_, i) => {
      const picksUsed = matchupsPerRound.slice(0, i).reduce((a, b) => a + b, 0);
      return picks.length < picksUsed + matchupsPerRound[i];
    }),
    4
  );

  const picksInPriorRounds = matchupsPerRound
    .slice(0, roundIndex)
    .reduce((a, b) => a + b, 0);
  const matchIndex = picks.length - picksInPriorRounds;

  const phase: "play" | "champion" = picks.length >= 31 ? "champion" : "play";

  // Current matchup candidates come from the previous round's slot array
  const currentRoundSlots = slots[roundIndex] ?? [];
  const leftId = currentRoundSlots[2 * matchIndex] ?? 0;
  const rightId = currentRoundSlots[2 * matchIndex + 1] ?? 1;

  return { slots, roundIndex, matchIndex, phase, leftId, rightId };
}

export function buildBracketColumns(
  slots: BracketSlots,
  picks: number[],
  roundIndex: number,
  matchIndex: number
): BracketColumn[] {
  // Returns a flat array of columns for BracketMap
  const cols: BracketColumn[] = [];
  const rounds = 5;

  for (let r = 0; r < rounds; r++) {
    const matchupsInRound = Math.pow(2, rounds - 1 - r);
    const lines: LineState[] = [];

    for (let m = 0; m < matchupsInRound; m++) {
      const picksInPrior = [16, 8, 4, 2, 1].slice(0, r).reduce((a, b) => a + b, 0);
      const globalMatchIndex = picksInPrior + m;

      let state: LineState;
      if (picks.length > globalMatchIndex) {
        state = "done";
      } else if (r === roundIndex && m === matchIndex) {
        state = "current";
      } else {
        state = "todo";
      }
      lines.push(state);
    }

    cols.push({ type: "matches", lines });
  }

  return cols;
}

export type LineState = "done" | "current" | "todo";

export interface BracketColumn {
  type: "matches";
  lines: LineState[];
}
