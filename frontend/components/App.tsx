"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QBS, QB_MAP, ROUND_LABELS } from "@/lib/qbs";
import { deriveBracket } from "@/lib/bracket";
import { submitPick, Pick } from "@/lib/api";
import { useIsMobile } from "@/hooks/useIsMobile";
import QBCard from "./QBCard";
import BracketMap from "./BracketMap";
import LeaderboardScreen from "./LeaderboardScreen";

const STORE_KEY = "qbsnack";

type AnimPhase = "pop" | "exit" | null;
type AnimSide = "left" | "right" | null;
type View = "game" | "leaderboard";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(`${STORE_KEY}_session`);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(`${STORE_KEY}_session`, id);
  }
  return id;
}

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      left: `${5 + Math.random() * 90}%`,
      top: `${-10 + Math.random() * 20}%`,
      size: 6 + Math.random() * 8,
      color: ["var(--accent)", "#ff6a1a", "#6bb3ff", "#ff2e74", "#fff"][i % 5],
      duration: `${2.2 + Math.random() * 1.4}s`,
      delay: `${Math.random() * 0.8}s`,
      borderRadius: Math.random() > 0.5 ? "50%" : "2px",
    })), []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.borderRadius,
            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [picks, setPicks] = useState<number[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [animPhase, setAnimPhase] = useState<AnimPhase>(null);
  const [animSide, setAnimSide] = useState<AnimSide>(null);
  const [view, setView] = useState<View>("game");
  const animLock = useRef(false);

  const isMobile = useIsMobile();
  const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("preview");

  // Hydrate from localStorage
  useEffect(() => {
    const savedPicks = localStorage.getItem(`${STORE_KEY}_picks`);
    const savedTheme = localStorage.getItem(`${STORE_KEY}_theme`);
    if (savedPicks) setPicks(JSON.parse(savedPicks));
    if (savedTheme) setTheme(savedTheme as "light" | "dark");
  }, []);

  // Persist picks
  useEffect(() => {
    localStorage.setItem(`${STORE_KEY}_picks`, JSON.stringify(picks));
  }, [picks]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(`${STORE_KEY}_theme`, theme);
  }, [theme]);

  const { slots, roundIndex, matchIndex, phase, leftId, rightId } = useMemo(
    () => deriveBracket(picks),
    [picks]
  );

  const leftQB = QB_MAP.get(leftId)!;
  const rightQB = QB_MAP.get(rightId)!;


  const pick = useCallback(
    (side: "left" | "right") => {
      if (animLock.current || phase === "champion") return;
      animLock.current = true;

      const winnerId = side === "left" ? leftId : rightId;
      const loserId = side === "left" ? rightId : leftId;

      setAnimPhase("pop");
      setAnimSide(side);

      setTimeout(() => setAnimPhase("exit"), 230);

      setTimeout(() => {
        const sessionId = getSessionId();
        setPicks(prev => [...prev, winnerId]);
        setAnimPhase(null);
        setAnimSide(null);
        if (!isPreview) {
          submitPick({ session_id: sessionId, round: roundIndex, winner_id: winnerId, loser_id: loserId })
            .catch(console.error);
        }
      }, 470);

      setTimeout(() => {
        animLock.current = false;
      }, 780);
    },
    [leftId, rightId, phase, roundIndex]
  );

  const reset = useCallback(() => {
    setPicks([]);
    setView("game");
    // New session on reset so picks don't collide with old ones
    localStorage.removeItem(`${STORE_KEY}_session`);
    getSessionId();
  }, []);

  const photoW = isMobile ? 122 : 278;
  const photoH = isMobile ? 150 : 332;
  const nameSize = isMobile ? 17 : 31;
  const vsSize = isMobile ? 46 : 90;
  const vsFontSize = isMobile ? 17 : 32;
  const bracketH = isMobile ? 48 : 72;
  const heroSize = isMobile ? "32px" : "clamp(40px,6vw,58px)";
  const matchupGap = isMobile ? 8 : 30;

  // Champion screen derivation
  const champion = QB_MAP.get(slots[5]?.[0])!;
  const runnerUp = QB_MAP.get(slots[4]?.find(id => id !== slots[5]?.[0]) ?? -1);
  const semifinalist = QB_MAP.get(slots[3]?.find(id => id !== slots[4]?.[0] && id !== slots[4]?.[1]) ?? -1);

  function cardStyle(side: "left" | "right"): React.CSSProperties {
    const isWinner = animSide === side;
    const isLoser = animSide !== null && animSide !== side;

    if (animPhase === "pop") {
      return {
        transform: isWinner ? "scale(1.05)" : isLoser ? "scale(.93)" : undefined,
        opacity: isLoser ? 0.32 : 1,
        boxShadow: isWinner ? `0 0 0 4px var(--accent)` : undefined,
        zIndex: isWinner ? 2 : 1,
        transition: "transform .22s cubic-bezier(.2,.9,.25,1.35), opacity .2s, box-shadow .2s",
      };
    }
    if (animPhase === "exit") {
      return {
        transform: isWinner ? "translateY(-28px) scale(1.03)" : "scale(.9)",
        opacity: 0,
        transition: "transform .22s cubic-bezier(.2,.9,.25,1.35), opacity .2s",
      };
    }
    return { animation: "qbIn .28s cubic-bezier(.2,.9,.3,1.1) both" };
  }

  if (view === "leaderboard") {
    return (
      <div style={{ minHeight: "100vh", padding: isMobile ? "60px 16px 48px" : "30px 28px 48px" }}>
        <AppBar
          roundLabel="RANKINGS"
          theme={theme}
          onThemeToggle={() => setTheme(t => t === "light" ? "dark" : "light")}
          onReset={reset}
          backButton
          onBack={() => setView("game")}
          isMobile={isMobile}
        />
        <LeaderboardScreen onBack={() => setView("game")} />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: isMobile ? "60px 16px 48px" : "30px 28px 48px",
        maxWidth: 980,
        margin: "0 auto",
      }}
    >
      <AppBar
        roundLabel={ROUND_LABELS[roundIndex] ?? "COMPLETE"}
        theme={theme}
        onThemeToggle={() => setTheme(t => t === "light" ? "dark" : "light")}
        onReset={reset}
        isMobile={isMobile}
      />

      {/* Bracket card */}
      <div
        style={{
          background: "var(--bracket-card-bg)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "16px 20px 14px",
          boxShadow: "0 12px 30px rgba(40,30,15,.1)",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: ".28em",
            color: "var(--text-faint)",
            textTransform: "uppercase",
            marginBottom: 8,
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 600,
          }}
        >
          YOUR BRACKET
        </div>
        <BracketMap
          picks={picks}
          roundIndex={roundIndex}
          matchIndex={matchIndex}
          height={bracketH}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 12,
          }}
        >
          <span
            style={{
              fontSize: 10,
              letterSpacing: ".14em",
              color: "var(--text-faint)",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 600,
            }}
          >
            PROGRESS
          </span>
          <div
            style={{
              flex: 1,
              height: 6,
              borderRadius: 999,
              background: "var(--progress-track)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.round(picks.length / 31 * 100)}%`,
                height: "100%",
                background: "var(--accent)",
                borderRadius: 999,
                transition: "width .4s cubic-bezier(.3,.9,.3,1)",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 10,
              color: "var(--text-faint)",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {picks.length} / 31
          </span>
        </div>
      </div>

      {phase === "champion" && champion ? (
        <ChampionScreen
          champion={champion}
          runnerUp={runnerUp ?? QBS[1]}
          semifinalist={semifinalist ?? QBS[2]}
          onReset={reset}
          onLeaderboard={() => setView("leaderboard")}
          isMobile={isMobile}
        />
      ) : (
        <>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2
              style={{
                fontFamily: "Anton, sans-serif",
                fontSize: heroSize,
                textTransform: "uppercase",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              WHO&apos;S{" "}
              <span
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-text)",
                  borderRadius: 6,
                  padding: "0 6px",
                  boxDecorationBreak: "clone",
                }}
              >
                HOTTER?
              </span>
            </h2>
          </div>

          {/* Matchup */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: matchupGap,
            }}
          >
            <div style={cardStyle("left")}>
              <QBCard
                qb={leftQB}
                photoW={photoW}
                photoH={photoH}
                nameSize={nameSize}
                tappable
                onClick={() => pick("left")}
              />
            </div>

            {/* VS disc */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: vsSize,
                  height: vsSize,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Anton, sans-serif",
                  fontSize: vsFontSize,
                  color: "var(--accent-text)",
                  boxShadow: `0 0 0 6px var(--accent)26, 0 14px 30px rgba(0,0,0,.18)`,
                  flexShrink: 0,
                }}
              >
                VS
              </div>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: ".14em",
                  color: "var(--text-faint)",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 600,
                }}
              >
                PICK ONE
              </span>
            </div>

            <div style={cardStyle("right")}>
              <QBCard
                qb={rightQB}
                photoW={photoW}
                photoH={photoH}
                nameSize={nameSize}
                tappable
                onClick={() => pick("right")}
              />
            </div>
          </div>

          {/* Helper */}
          <div
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 11,
              letterSpacing: ".14em",
              color: "var(--text-muted)",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 500,
            }}
          >
            LOOKS ONLY — WINNER ADVANCES
          </div>
        </>
      )}
    </div>
  );
}

function AppBar({
  roundLabel,
  theme,
  onThemeToggle,
  onReset,
  backButton,
  onBack,
  isMobile,
}: {
  roundLabel: string;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  onReset: () => void;
  backButton?: boolean;
  onBack?: () => void;
  isMobile: boolean;
}) {
  const pillStyle: React.CSSProperties = {
    padding: "5px 12px",
    borderRadius: 999,
    border: "1.5px solid var(--pill-border)",
    background: "transparent",
    color: "var(--text)",
    fontFamily: "Space Grotesk, sans-serif",
    fontWeight: 600,
    fontSize: isMobile ? 11 : 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 22,
      }}
    >
      {/* Logo + wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: isMobile ? 32 : 38,
            height: isMobile ? 32 : 38,
            borderRadius: 8,
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Anton, sans-serif",
            fontSize: isMobile ? 14 : 17,
            color: "var(--accent-text)",
            flexShrink: 0,
          }}
        >
          QB
        </div>
        <div>
          <div
            style={{
              fontFamily: "Anton, sans-serif",
              fontSize: isMobile ? 17 : 24,
              textTransform: "uppercase",
              lineHeight: 1,
              whiteSpace: "nowrap",
              color: "var(--text)",
            }}
          >
            QUARTERBACK SNACK
          </div>
          <div
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 600,
              fontSize: isMobile ? 8 : 10.5,
              textTransform: "uppercase",
              letterSpacing: ".12em",
              color: "var(--accent)",
              whiteSpace: "nowrap",
            }}
          >
            FINDING THE SEXIEST QUARTERBACK
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {backButton ? (
          <button onClick={onBack} style={pillStyle}>← Back</button>
        ) : (
          <button style={{ ...pillStyle, borderStyle: "solid" }}>
            {roundLabel}
          </button>
        )}
        <button onClick={onThemeToggle} style={pillStyle}>
          {theme === "dark" ? "☀ Light" : "☾ Dark"}
        </button>
        <button onClick={onReset} style={pillStyle}>↺</button>
      </div>
    </div>
  );
}

function ChampionScreen({
  champion,
  runnerUp,
  semifinalist,
  onReset,
  onLeaderboard,
  isMobile,
}: {
  champion: ReturnType<typeof QB_MAP.get> & {};
  runnerUp: ReturnType<typeof QB_MAP.get> & {};
  semifinalist: ReturnType<typeof QB_MAP.get> & {};
  onReset: () => void;
  onLeaderboard: () => void;
  isMobile: boolean;
}) {
  const champPhotoW = isMobile ? 168 : 216;
  const champPhotoH = isMobile ? 202 : 258;

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 18,
        background: "var(--champ-bg)",
        border: "1px solid var(--border)",
        padding: "36px 24px 32px",
        textAlign: "center",
        overflow: "hidden",
        animation: "champPop .5s cubic-bezier(.2,.9,.3,1.1) both",
      }}
    >
      <Confetti />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "inline-block",
            border: "1.5px solid var(--pill-border)",
            borderRadius: 999,
            padding: "4px 14px",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: ".14em",
            marginBottom: 16,
          }}
        >
          FINAL RESULT
        </div>

        <h2
          style={{
            fontFamily: "Anton, sans-serif",
            fontSize: isMobile ? 28 : 42,
            textTransform: "uppercase",
            margin: "0 0 24px",
          }}
        >
          YOUR HOTTEST{" "}
          <span
            style={{
              background: "var(--accent)",
              color: "var(--accent-text)",
              borderRadius: 6,
              padding: "0 6px",
            }}
          >
            QB
          </span>
        </h2>

        {/* Champion card */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <QBCard
            qb={champion}
            photoW={champPhotoW}
            photoH={champPhotoH}
            nameSize={isMobile ? 22 : 28}
            highlight
            badge="CHAMPION"
          />
        </div>

        {/* Runner-up + semifinalist */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            opacity: 0.86,
            marginBottom: 24,
          }}
        >
          <QBCard qb={runnerUp} photoW={isMobile ? 100 : 130} photoH={isMobile ? 120 : 156} nameSize={isMobile ? 13 : 17} />
          <QBCard qb={semifinalist} photoW={isMobile ? 100 : 130} photoH={isMobile ? 120 : 156} nameSize={isMobile ? 13 : 17} />
        </div>

        <p
          style={{
            fontSize: 11,
            letterSpacing: ".14em",
            color: "var(--text-muted)",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          CROWNED YOUR CHAMPION IN 31 TAPS
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={onReset}
            style={{
              padding: "11px 24px",
              borderRadius: 9,
              background: "var(--accent)",
              color: "var(--accent-text)",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: ".06em",
              border: "none",
              cursor: "pointer",
            }}
          >
            ↻ PLAY AGAIN
          </button>
          <button
            onClick={async () => {
              const text = `I crowned ${champion.name} the Hottest QB on Quarterback Snack! 🏈🔥 quarterbacksnack.com`;
              if (navigator.share) {
                await navigator.share({ text, url: "https://quarterbacksnack.com" });
              } else {
                await navigator.clipboard.writeText(text);
                alert("Copied to clipboard!");
              }
            }}
            style={{
              padding: "11px 24px",
              borderRadius: 9,
              border: "1.5px solid var(--pill-border)",
              background: "transparent",
              color: "var(--text)",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: ".06em",
              cursor: "pointer",
            }}
          >
            ↗ SHARE
          </button>
        </div>

        <div style={{ marginTop: 20 }}>
          <button
            onClick={onLeaderboard}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent)",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            SEE FULL RANKINGS →
          </button>
        </div>
      </div>
    </div>
  );
}
