"use client";

import { useState } from "react";

const ink = "#111111";
type JudgeKey = "visitor" | "copy" | "detective";

const JUDGE_LINES: Record<JudgeKey, { label: string; line: string }> = {
  visitor: { label: "First impression", line: "You have five seconds. Make the point." },
  copy: { label: "Clarity", line: "Specific nouns, please. I am begging." },
  detective: { label: "Next action", line: "Every click needs a clear motive." },
};

function Visitor({ onSelect }: { onSelect?: () => void }) {
  return (
    <g className="judge-character judge-visitor" onClick={onSelect} onPointerEnter={onSelect} style={{ cursor: onSelect ? "pointer" : undefined }}>
      <g className="judge-prop judge-phone">
        <rect x="45" y="178" width="38" height="62" rx="8" fill="#242424" stroke={ink} strokeWidth="5" />
        <circle cx="64" cy="228" r="3" fill="#dceeff" />
      </g>
      <path d="M100 183c-20 5-31 24-30 48" fill="none" stroke="#8d573e" strokeWidth="18" strokeLinecap="round" />
      <circle cx="74" cy="228" r="13" fill="#8d573e" stroke={ink} strokeWidth="5" />
      <rect x="92" y="165" width="126" height="104" rx="44" fill="#fb6b32" stroke={ink} strokeWidth="5" />
      <path d="M118 177c12 18 58 18 72 0" fill="none" stroke="#ffd731" strokeWidth="10" strokeLinecap="round" />
      <rect x="108" y="67" width="94" height="112" rx="38" fill="#8d573e" stroke={ink} strokeWidth="5" />
      <circle cx="108" cy="124" r="12" fill="#8d573e" stroke={ink} strokeWidth="5" />
      <circle cx="202" cy="124" r="12" fill="#8d573e" stroke={ink} strokeWidth="5" />
      <path d="M111 84c11-28 72-31 87 4l-4 11h-83z" fill="#211916" />
      <path d="M106 78c11-25 83-27 101 1v16H106z" fill="#ffd731" stroke={ink} strokeWidth="5" strokeLinejoin="round" />
      <path d="M105 94h110" stroke={ink} strokeWidth="8" strokeLinecap="round" />
      <ellipse className="judge-eye eye-one" cx="135" cy="122" rx="17" ry="20" fill="white" stroke={ink} strokeWidth="4" />
      <ellipse className="judge-eye eye-two" cx="177" cy="122" rx="17" ry="20" fill="white" stroke={ink} strokeWidth="4" />
      <circle cx="139" cy="126" r="7" fill={ink} />
      <circle cx="181" cy="126" r="7" fill={ink} />
      <path d="M151 133l-5 13h12" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M136 159c12-7 27-7 39 0" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      <path d="M209 188c19 9 28 25 24 45" fill="none" stroke="#8d573e" strokeWidth="18" strokeLinecap="round" />
      <circle cx="231" cy="235" r="13" fill="#8d573e" stroke={ink} strokeWidth="5" />
    </g>
  );
}

function CopyGremlin({ onSelect }: { onSelect?: () => void }) {
  return (
    <g className="judge-character judge-copy" onClick={onSelect} onPointerEnter={onSelect} style={{ cursor: onSelect ? "pointer" : undefined }}>
      <rect x="319" y="166" width="126" height="103" rx="36" fill="#7458ed" stroke={ink} strokeWidth="5" />
      <path d="M334 190l48 43 47-43" fill="none" stroke="#e9ccff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M327 92c-15-48 95-65 111 0l-9 73h-93z" fill="#392276" stroke={ink} strokeWidth="5" strokeLinejoin="round" />
      <rect x="337" y="66" width="90" height="111" rx="39" fill="#efb38e" stroke={ink} strokeWidth="5" />
      <path d="M336 99c12-38 31-48 53-48 26 0 44 18 48 51-15-5-28-16-34-30-14 20-36 29-67 27z" fill="#392276" />
      <path d="M338 95c-12 23-12 55 1 76" fill="none" stroke="#392276" strokeWidth="15" strokeLinecap="round" />
      <path d="M427 94c13 25 13 54 1 78" fill="none" stroke="#392276" strokeWidth="15" strokeLinecap="round" />
      <ellipse className="judge-eye eye-one" cx="361" cy="123" rx="17" ry="20" fill="white" stroke={ink} strokeWidth="4" />
      <ellipse className="judge-eye eye-two" cx="404" cy="123" rx="17" ry="20" fill="white" stroke={ink} strokeWidth="4" />
      <circle cx="363" cy="125" r="7" fill={ink} />
      <circle cx="406" cy="125" r="7" fill={ink} />
      <circle cx="361" cy="123" r="24" fill="none" stroke={ink} strokeWidth="5" />
      <circle cx="404" cy="123" r="24" fill="none" stroke={ink} strokeWidth="5" />
      <path d="M385 122h-3" stroke={ink} strokeWidth="5" />
      <path d="M376 139l-5 11h11" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
      <path d="M365 160c11 10 25 10 36 0" fill="none" stroke="#8e3f4a" strokeWidth="5" strokeLinecap="round" />
      <path d="M321 192c-20 17-27 38-19 60" fill="none" stroke="#efb38e" strokeWidth="18" strokeLinecap="round" />
      <circle cx="305" cy="250" r="13" fill="#efb38e" stroke={ink} strokeWidth="5" />
      <g transform="rotate(13 457 188)">
        <g className="judge-prop judge-pencil">
          <rect x="452" y="144" width="12" height="88" rx="5" fill="#ffd731" stroke={ink} strokeWidth="4" />
          <path d="M452 144h12l-6-16z" fill="#efb38e" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
          <rect x="452" y="220" width="12" height="14" rx="3" fill="#fb6b32" />
        </g>
      </g>
    </g>
  );
}

function Detective({ onSelect }: { onSelect?: () => void }) {
  return (
    <g className="judge-character judge-detective" onClick={onSelect} onPointerEnter={onSelect} style={{ cursor: onSelect ? "pointer" : undefined }}>
      <rect x="548" y="164" width="130" height="105" rx="35" fill="#61dfa4" stroke={ink} strokeWidth="5" />
      <path d="M564 177l47 61 49-61M611 177v65" fill="none" stroke="#f6f1df" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="567" y="65" width="93" height="113" rx="38" fill="#b96f50" stroke={ink} strokeWidth="5" />
      <path d="M571 86c17-35 69-35 86 1v18c-15-14-29-24-44-25-15 10-26 16-42 19z" fill="#1d1714" />
      <ellipse className="judge-eye eye-one" cx="592" cy="124" rx="17" ry="20" fill="white" stroke={ink} strokeWidth="4" />
      <ellipse className="judge-eye eye-two" cx="635" cy="124" rx="17" ry="20" fill="white" stroke={ink} strokeWidth="4" />
      <circle cx="594" cy="126" r="7" fill={ink} />
      <circle cx="637" cy="126" r="7" fill={ink} />
      <path d="M608 136l-5 12h11" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
      <path d="M589 157c14-9 30-9 45 0" fill="none" stroke="#1d1714" strokeWidth="9" strokeLinecap="round" />
      <path d="M607 163c7 4 13 4 20 0" fill="none" stroke="#592f29" strokeWidth="4" strokeLinecap="round" />
      <g transform="rotate(3 615 75)">
        <path d="M559 75h112" stroke={ink} strokeWidth="13" strokeLinecap="round" />
        <path d="M575 73l8-42h64l8 42z" fill="#25372f" stroke={ink} strokeWidth="5" strokeLinejoin="round" />
        <path d="M581 59h68" stroke="#ffd731" strokeWidth="8" />
      </g>
      <path d="M669 190c20 15 27 34 20 57" fill="none" stroke="#b96f50" strokeWidth="18" strokeLinecap="round" />
      <circle cx="685" cy="249" r="13" fill="#b96f50" stroke={ink} strokeWidth="5" />
      <g className="judge-prop judge-glass">
        <circle cx="704" cy="194" r="33" fill="#dceeff" fillOpacity=".65" stroke={ink} strokeWidth="8" />
        <path d="M682 218l-29 31" stroke={ink} strokeWidth="10" strokeLinecap="round" />
      </g>
    </g>
  );
}

export function JudgeScene({ interactive = false }: { interactive?: boolean }) {
  const [active, setActive] = useState<JudgeKey>("visitor");
  const activeLine = JUDGE_LINES[active];

  return (
    <div
      className={`judge-scene active-${active} ${interactive ? "is-interactive" : ""}`}
      aria-hidden={interactive ? undefined : true}
      aria-label={interactive ? "Meet the three landing-page judges" : undefined}
    >
      <svg className="judge-cast-svg" viewBox="0 0 760 340" role="presentation">
        <Visitor onSelect={interactive ? () => setActive("visitor") : undefined} />
        <CopyGremlin onSelect={interactive ? () => setActive("copy") : undefined} />
        <Detective onSelect={interactive ? () => setActive("detective") : undefined} />
        <rect x="26" y="258" width="708" height="48" rx="15" fill={ink} />
        <rect x="26" y="258" width="708" height="9" rx="5" fill="#343434" />
        <ellipse cx="155" cy="261" rx="24" ry="8" fill="#fb6b32" stroke={ink} strokeWidth="4" />
        <ellipse cx="382" cy="261" rx="24" ry="8" fill="#7458ed" stroke={ink} strokeWidth="4" />
        <ellipse cx="613" cy="261" rx="24" ry="8" fill="#61dfa4" stroke={ink} strokeWidth="4" />
        <g transform="translate(442 262) rotate(-48)">
          <g className="judge-gavel">
            <rect x="-7" y="-5" width="14" height="92" rx="7" fill={ink} />
            <rect x="-38" y="-19" width="76" height="32" rx="8" fill="#ffd731" stroke={ink} strokeWidth="5" />
          </g>
        </g>
      </svg>
      {interactive && (
        <div className="judge-live-line" aria-live="polite">
          <span>{activeLine.label}</span>
          <strong>“{activeLine.line}”</strong>
        </div>
      )}
      <div className="judge-nameplates">
        {interactive ? (
          <>
            <button type="button" aria-pressed={active === "visitor"} onClick={() => setActive("visitor")} onMouseEnter={() => setActive("visitor")} onFocus={() => setActive("visitor")}>The Visitor</button>
            <button type="button" aria-pressed={active === "copy"} onClick={() => setActive("copy")} onMouseEnter={() => setActive("copy")} onFocus={() => setActive("copy")}>Copy Gremlin</button>
            <button type="button" aria-pressed={active === "detective"} onClick={() => setActive("detective")} onMouseEnter={() => setActive("detective")} onFocus={() => setActive("detective")}>Click Detective</button>
          </>
        ) : (
          <>
            <span>The Visitor</span>
            <span>Copy Gremlin</span>
            <span>Click Detective</span>
          </>
        )}
      </div>
    </div>
  );
}
