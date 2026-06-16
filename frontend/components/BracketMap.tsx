"use client";

interface BracketMapProps {
  picks: number[];
  roundIndex: number;
  matchIndex: number;
  height: number;
}

type LineState = "done" | "current" | "todo";

export default function BracketMap({ picks, roundIndex, matchIndex, height }: BracketMapProps) {
  // 5 rounds: 16, 8, 4, 2, 1 matchups
  const roundMatchups = [16, 8, 4, 2, 1];
  const totalPicks = picks.length;

  function getLineState(round: number, match: number): LineState {
    const picksInPrior = roundMatchups.slice(0, round).reduce((a, b) => a + b, 0);
    const globalIdx = picksInPrior + match;
    if (totalPicks > globalIdx) return "done";
    if (round === roundIndex && match === matchIndex) return "current";
    return "todo";
  }

  const svgW = 500;
  const svgH = height;
  const colW = svgW / 5;
  const strokeDone = "var(--line-done)";
  const strokeTodo = "var(--line-todo)";
  const strokeCurrent = "var(--accent)";

  const lines: React.ReactNode[] = [];

  // Draw each round as a set of horizontal stubs converging toward center
  roundMatchups.forEach((matchups, r) => {
    const blockH = svgH / matchups;

    for (let m = 0; m < matchups; m++) {
      const state = getLineState(r, m);
      const color = state === "done" ? strokeDone : state === "current" ? strokeCurrent : strokeTodo;
      const strokeW = state === "current" ? 3 : 1.5;

      // Left half mirrors right half — we draw both sides converging to center
      // Left side: rounds 0-4 from left edge to center
      const x1L = r * colW;
      const x2L = (r + 1) * colW;
      const y = (m + 0.5) * blockH;

      lines.push(
        <line
          key={`L-${r}-${m}`}
          x1={x1L}
          y1={y}
          x2={x2L}
          y2={y}
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
      );

      // Connector to next round (bracket arm)
      if (r < 4) {
        const nextBlockH = svgH / roundMatchups[r + 1];
        const partnerY = (Math.floor(m / 2) + 0.5) * nextBlockH;
        const x = x2L;

        lines.push(
          <line
            key={`C-${r}-${m}`}
            x1={x}
            y1={y}
            x2={x}
            y2={partnerY}
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        );
      }
    }
  });

  // Champion dot at far right
  const champState = getLineState(4, 0);
  const champColor = champState === "done" ? strokeDone : champState === "current" ? strokeCurrent : strokeTodo;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      {lines}
      <circle cx={svgW} cy={svgH / 2} r={5} fill={champColor} />
    </svg>
  );
}
