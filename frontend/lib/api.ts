const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Pick {
  session_id: string;
  round: number;
  winner_id: number;
  loser_id: number;
}

export interface LeaderboardEntry {
  qb_id: number;
  qb_name: string;
  team: string;
  team_abbr: string;
  team_color: string;
  rating: number;
  wins: number;
  losses: number;
  total: number;
  win_pct: number;
  rank: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total_matchups: number;
}

export async function submitBracket(sessionId: string, picks: Pick[]): Promise<void> {
  const res = await fetch(`${API_BASE}/results/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, picks }),
  });
  if (!res.ok && res.status !== 409) {
    throw new Error(`Failed to submit bracket: ${res.status}`);
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  const res = await fetch(`${API_BASE}/leaderboard/`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}
