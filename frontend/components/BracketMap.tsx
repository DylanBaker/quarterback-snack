"use client";

type LineState = "done" | "current" | "todo";

interface BracketMapProps {
  picks: number[];
  roundIndex: number;
  matchIndex: number;
  height: number;
}

export default function BracketMap({ picks, roundIndex, matchIndex, height }: BracketMapProps) {
  const totalPicks = picks.length;
  // Rounds: 16, 8, 4, 2, 1 matchups. Left half = first 16+8+4+2 = 30...
  // Actually left half plays rounds 0-3 (matches 0-15 in round 0, etc.)
  // Right half mirrors: round 0 matches 8-15 on right side going inward
  // Wait - all 31 picks are sequential. Left bracket = first 16 picks of round 0,
  // right bracket = matches 8-15 of round 0 (second 8 divisional matchups).
  // Actually the bracket is split: left 16 seeds (0-15) and right 16 seeds (16-31).
  // Round 0: matches 0-7 = left half, matches 8-15 = right half
  // Round 1: matches 0-3 = left half, matches 4-7 = right half
  // Round 2: matches 0-1 = left half, matches 2-3 = right half
  // Round 3: match 0 = left half, match 1 = right half
  // Round 4: match 0 = final (center)

  const roundMatchups = [16, 8, 4, 2, 1];

  function globalPickIndex(round: number, match: number): number {
    return roundMatchups.slice(0, round).reduce((a, b) => a + b, 0) + match;
  }

  function getState(round: number, match: number): LineState {
    const idx = globalPickIndex(round, match);
    if (totalPicks > idx) return "done";
    if (round === roundIndex && match === matchIndex) return "current";
    return "todo";
  }

  function stateColor(s: LineState) {
    if (s === "done") return "var(--line-done)";
    if (s === "current") return "var(--accent)";
    return "var(--line-todo)";
  }
  function stateWidth(s: LineState) { return s === "current" ? 2.5 : 1.5; }

  const W = 500;
  const H = height;
  const cx = W / 2; // center x

  // Each half is 4 rounds wide. Half-width = cx.
  // Round 0: 8 matchups per side, round 1: 4, round 2: 2, round 3: 1
  const halfRounds = 4; // rounds 0-3 on each side
  const colW = cx / halfRounds; // width per round column

  const lines: React.ReactNode[] = [];
  let key = 0;

  function hLine(x1: number, x2: number, y: number, state: LineState) {
    lines.push(<line key={key++} x1={x1} y1={y} x2={x2} y2={y}
      stroke={stateColor(state)} strokeWidth={stateWidth(state)} strokeLinecap="round" />);
  }
  function vLine(x: number, y1: number, y2: number, state: LineState) {
    lines.push(<line key={key++} x1={x} y1={y1} x2={x} y2={y2}
      stroke={stateColor(state)} strokeWidth={stateWidth(state)} strokeLinecap="round" />);
  }

  // Draw left half: rounds 0-3, matches 0...(matchupsPerSide-1)
  for (let r = 0; r < halfRounds; r++) {
    const matchupsThisRound = roundMatchups[r] / 2; // half the total matchups
    const blockH = H / matchupsThisRound;
    const x1 = r * colW;
    const x2 = (r + 1) * colW;

    for (let m = 0; m < matchupsThisRound; m++) {
      const globalMatch = m; // left half always uses first half of matchups
      const state = getState(r, globalMatch);
      const y = (m + 0.5) * blockH;

      // Horizontal stub
      hLine(x1, x2, y, state);

      // Connector to next round
      if (r < halfRounds - 1) {
        const nextBlockH = H / (roundMatchups[r + 1] / 2);
        const partnerY = (Math.floor(m / 2) + 0.5) * nextBlockH;
        vLine(x2, y, partnerY, state);
      }
    }
  }

  // Draw right half: rounds 0-3, matches (total/2)...(total-1), mirrored horizontally
  for (let r = 0; r < halfRounds; r++) {
    const matchupsThisRound = roundMatchups[r] / 2;
    const blockH = H / matchupsThisRound;
    const x1 = W - r * colW;
    const x2 = W - (r + 1) * colW;

    for (let m = 0; m < matchupsThisRound; m++) {
      const globalMatch = roundMatchups[r] / 2 + m; // right half = second half of matchups
      const state = getState(r, globalMatch);
      const y = (m + 0.5) * blockH;

      hLine(x1, x2, y, state);

      if (r < halfRounds - 1) {
        const nextBlockH = H / (roundMatchups[r + 1] / 2);
        const partnerY = (Math.floor(m / 2) + 0.5) * nextBlockH;
        vLine(x2, y, partnerY, state);
      }
    }
  }

  // Final match (round 4) — center horizontal lines meeting at champion dot
  const finalState = getState(4, 0);
  const midY = H / 2;
  hLine(colW * halfRounds, cx, midY, finalState);         // left side to center
  hLine(cx, W - colW * halfRounds, midY, finalState);     // center to right side

  // Champion dot
  lines.push(
    <circle key={key++} cx={cx} cy={midY} r={4}
      fill={stateColor(finalState)} />
  );

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }} aria-hidden>
      {lines}
    </svg>
  );
}
