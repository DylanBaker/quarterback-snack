"use client";

import { useEffect, useState } from "react";
import { fetchLeaderboard, LeaderboardEntry } from "@/lib/api";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Props {
  onBack: () => void;
}

export default function LeaderboardScreen({ onBack }: Props) {
  const isMobile = useIsMobile();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalMatchups, setTotalMatchups] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard()
      .then(data => {
        setEntries(data.entries);
        setTotalMatchups(data.total_matchups);
      })
      .finally(() => setLoading(false));
  }, []);

  const visible = expanded ? entries : entries.slice(0, 10);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 0 48px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "Anton, sans-serif",
            fontSize: "clamp(32px, 6vw, 52px)",
            textTransform: "uppercase",
            lineHeight: 1,
            whiteSpace: "nowrap",
            margin: 0,
          }}
        >
          HOTTEST{" "}
          <span
            style={{
              background: "var(--accent)",
              color: "var(--accent-text)",
              borderRadius: 6,
              padding: "0 6px",
              boxDecorationBreak: "clone",
            }}
          >
            QBs
          </span>
        </h1>
        <p
          style={{
            marginTop: 10,
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: "var(--text-muted)",
          }}
        >
          Ranked by head-to-head wins across every Quarterback Snack bracket.
        </p>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", fontFamily: "Space Grotesk, sans-serif" }}>
          Loading rankings…
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {visible.map(entry => (
              <LeaderboardRow key={entry.qb_id} entry={entry} isMobile={isMobile} />
            ))}
          </div>

          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              marginTop: 16,
              display: "block",
              width: "100%",
              padding: "11px 0",
              borderRadius: 9,
              border: "1.5px solid var(--pill-border)",
              background: "transparent",
              color: "var(--text)",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: ".08em",
              cursor: "pointer",
            }}
          >
            {expanded ? "Show less" : "Show all 32"}
          </button>

          {totalMatchups > 0 && (
            <p
              style={{
                marginTop: 16,
                textAlign: "center",
                fontSize: 12,
                color: "var(--text-faint)",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              Based on {totalMatchups.toLocaleString()} head-to-head matchups
            </p>
          )}
        </>
      )}
    </div>
  );
}

function LeaderboardRow({ entry, isMobile }: { entry: LeaderboardEntry; isMobile: boolean }) {
  const isFirst = entry.rank === 1;
  const photoSize = isFirst ? 54 : 46;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: isFirst ? "14px 16px" : "10px 16px",
        borderRadius: 12,
        background: "var(--card-surface)",
        border: "1px solid var(--card-border)",
        boxShadow: isFirst ? `0 0 0 2px var(--accent)` : undefined,
      }}
    >
      {/* Rank */}
      <div
        style={{
          fontFamily: "Anton, sans-serif",
          fontSize: isFirst ? 26 : 20,
          color: isFirst ? "var(--accent)" : "var(--text-muted)",
          minWidth: 32,
          textAlign: "center",
        }}
      >
        {entry.rank}
      </div>

      {/* Photo placeholder */}
      <div
        style={{
          width: photoSize,
          height: photoSize,
          borderRadius: 8,
          background: `linear-gradient(158deg, ${entry.team_color}33 0%, var(--photo-end) 100%)`,
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src={`/photos/${entry.qb_id}.jpg`}
          alt={entry.qb_name}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: "8%",
            zIndex: -1,
          }}
        >
          <div
            style={{
              width: "55%",
              height: "75%",
              borderRadius: "50% 50% 0 0",
              background: "var(--silhouette)",
            }}
          />
        </div>
      </div>

      {/* Name + team */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "Anton, sans-serif",
            fontSize: isFirst ? 18 : 15,
            textTransform: "uppercase",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {entry.qb_name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginTop: 2,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: entry.team_color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            {entry.team}
          </span>
        </div>
      </div>

      {/* Win bar + % */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div
          style={{
            width: isMobile ? 60 : 110,
            height: 4,
            borderRadius: 999,
            background: "var(--progress-track)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${entry.win_pct}%`,
              height: "100%",
              background: "var(--accent)",
              borderRadius: 999,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "Anton, sans-serif",
            fontSize: isFirst ? 20 : 16,
            color: isFirst ? "var(--accent)" : "var(--text)",
            minWidth: 44,
            textAlign: "right",
          }}
        >
          {entry.win_pct}%
        </span>
      </div>
    </div>
  );
}
