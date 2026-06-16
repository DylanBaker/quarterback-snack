"use client";

import { QB } from "@/lib/qbs";

interface QBCardProps {
  qb: QB;
  photoW: number;
  photoH: number;
  nameSize: number;
  tappable?: boolean;
  highlight?: boolean;
  badge?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function QBCard({
  qb,
  photoW,
  photoH,
  nameSize,
  tappable,
  highlight,
  badge,
  onClick,
  style,
}: QBCardProps) {
  const photoSrc = `/photos/${qb.id}.jpg`;

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        borderRadius: 14,
        background: "var(--card-surface)",
        border: "1px solid var(--card-border)",
        boxShadow: highlight
          ? `0 0 0 3px var(--accent), 0 26px 56px rgba(40,30,15,.26)`
          : "0 12px 30px rgba(40,30,15,.1)",
        padding: "14px 14px 16px",
        cursor: onClick ? "pointer" : "default",
        transition: "transform .14s cubic-bezier(.2,.9,.25,1.35), box-shadow .14s",
        userSelect: "none",
        borderTop: `5px solid ${qb.color}`,
        ...style,
      }}
      className="qb-card"
    >
      {badge && (
        <div
          style={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--accent)",
            color: "var(--accent-text)",
            fontFamily: "Anton, sans-serif",
            fontSize: 11,
            letterSpacing: ".1em",
            padding: "3px 10px",
            borderRadius: 6,
            whiteSpace: "nowrap",
            zIndex: 2,
          }}
        >
          {badge}
        </div>
      )}

      {/* Photo area */}
      <div
        style={{
          position: "relative",
          width: photoW,
          height: photoH,
          borderRadius: 10,
          overflow: "hidden",
          background: `linear-gradient(158deg, ${qb.color}33 0%, var(--photo-end) 100%)`,
          flexShrink: 0,
        }}
      >
        {/* Player photo — falls back to silhouette if not found */}
        <img
          src={photoSrc}
          alt={qb.name}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />

        {/* Silhouette placeholder (shown when photo fails to load) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: "12%",
            zIndex: -1,
          }}
        >
          <div style={{ width: "28%", height: "28%", borderRadius: "50%", background: "var(--silhouette)", marginBottom: "2%" }} />
          <div style={{ width: "60%", height: "36%", borderRadius: "50% 50% 0 0", background: "var(--silhouette)" }} />
        </div>

        {/* Team chip */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "var(--chip-bg)",
            backdropFilter: "blur(6px)",
            borderRadius: 5,
            padding: "3px 7px 3px 5px",
          }}
        >
          <span
            style={{
              background: qb.color,
              color: "#fff",
              fontFamily: "Anton, sans-serif",
              fontSize: 10,
              padding: "2px 5px",
              borderRadius: 3,
            }}
          >
            {qb.abbr}
          </span>
          <span
            style={{
              color: "var(--chip-text)",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            {qb.team}
          </span>
        </div>

      </div>

      {/* Name */}
      <div
        style={{
          fontFamily: "Anton, sans-serif",
          fontSize: nameSize,
          color: "var(--name-color)",
          textTransform: "uppercase",
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        {qb.name}
      </div>

      {/* Tap to pick pill */}
      {tappable && (
        <div
          style={{
            background: "var(--accent)",
            color: "var(--accent-text)",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: ".12em",
            padding: "4px 12px",
            borderRadius: 999,
          }}
        >
          TAP TO PICK
        </div>
      )}

      <style>{`
        .qb-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 0 0 2px var(--accent), 0 20px 40px rgba(40,30,15,.18);
        }
      `}</style>
    </div>
  );
}
