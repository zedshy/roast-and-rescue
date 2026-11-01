"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Intensity, RoastReport } from "@/lib/report";
import { LogoMark } from "@/components/LogoMark";

const MascotScene = dynamic(
  () => import("@/components/MascotScene").then((module) => module.MascotScene),
  { ssr: false },
);
const JudgeScene = dynamic(
  () => import("@/components/JudgeScene").then((module) => module.JudgeScene),
  { ssr: false },
);

type Intent = {
  product: string;
  audience: string;
  action: string;
};

const DEMO_INTENT: Intent = {
  product: "Checkout diagnostics for small online shops",
  audience: "Independent ecommerce founders",
  action: "Analyse their checkout",
};

const intensityLabels: Array<{ value: Intensity; label: string; icon: string }> = [
  { value: "gentle", label: "Gentle", icon: "☁" },
  { value: "spicy", label: "Spicy", icon: "✹" },
  { value: "brutal", label: "Brutal", icon: "⚡" },
];

function copyText(text: string) {
  return navigator.clipboard.writeText(text);
}

function verdictText(report: RoastReport) {
  return [
    "My landing page just faced the Roast & Rescue panel 🔥",
    `“${report.roast}”`,
    "",
    ...report.judges.map((judge) => `${judge.name}: ${judge.verdict}`),
    "",
    "The rescue:",
    ...report.consensus.map((point) => `• ${point}`),
  ].join("\n");
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    if (lines.length === maxLines - 1) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (words.length && lines.join(" ").length < text.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.,;:!?]?$/, "")}…`;
  }
  return lines;
}

async function createShareCard(report: RoastReport): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not make a share card.");

  context.fillStyle = "#dceeff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#6d42ff";
  context.beginPath();
  context.arc(1085, 60, 230, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#ff5a1f";
  context.beginPath();
  context.arc(65, 595, 170, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#0b0b0b";
  context.font = "900 24px Arial, sans-serif";
  context.fillText("ROAST & RESCUE", 64, 70);
  context.fillStyle = "#ff5a1f";
  context.font = "900 18px Arial, sans-serif";
  context.fillText("THE FIVE-SECOND VERDICT", 64, 122);
  context.fillStyle = "#0b0b0b";
  context.font = "900 48px Arial, sans-serif";
  const roastLines = wrapCanvasText(context, `“${report.roast}”`, 980, 4);
  roastLines.forEach((line, index) => context.fillText(line, 64, 188 + index * 58));

  const cardY = 440;
  report.judges.slice(0, 3).forEach((judge, index) => {
    const x = 64 + index * 360;
    context.fillStyle = index === 0 ? "#ffdfd0" : index === 1 ? "#e8dcff" : "#cef6df";
    context.strokeStyle = "#0b0b0b";
    context.lineWidth = 3;
    context.beginPath();
    context.roundRect(x, cardY, 330, 116, 18);
    context.fill();
    context.stroke();
    context.fillStyle = "#0b0b0b";
    context.font = "900 13px Arial, sans-serif";
    context.fillText(judge.name.toUpperCase(), x + 18, cardY + 29);
    context.font = "700 18px Arial, sans-serif";
    wrapCanvasText(context, judge.verdict, 292, 3).forEach((line, lineIndex) =>
      context.fillText(line, x + 18, cardY + 60 + lineIndex * 23),
    );
  });

  context.fillStyle = "#0b0b0b";
  context.font = "700 15px Arial, sans-serif";
  context.fillText("roast-and-rescue · Built at DevDay Exchange London", 64, 603);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Share card failed."))), "image/png");
  });
}

async function compressImage(file: File): Promise<string> {
  if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
    throw new Error("Please choose a PNG, JPEG, or WebP image.");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Please choose an image smaller than 12 MB.");
  }

  const bitmap = await createImageBitmap(file);
  const maxDimension = 1800;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the screenshot.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let encoded = canvas.toDataURL("image/jpeg", 0.84);
  if (encoded.length > 3_700_000) encoded = canvas.toDataURL("image/jpeg", 0.68);
  if (encoded.length > 3_700_000) encoded = canvas.toDataURL("image/jpeg", 0.52);
  if (encoded.length > 4_000_000) {
    throw new Error("This screenshot is still too large after compression. Try a smaller crop.");
  }
  return encoded;
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="score">
      <div className="score-heading">
        <span>{label}</span>
        <strong>{value}/5</strong>
      </div>
      <div className="score-track">
        <span style={{ width: `${value * 20}%` }} />
      </div>
    </div>
  );
}

export default function Home() {
  const fileInput = useRef<HTMLInputElement>(null);
  const labRef = useRef<HTMLElement>(null);
  const loadingRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [capturingWebsite, setCapturingWebsite] = useState(false);
  const [captureError, setCaptureError] = useState("");
  const [intensity, setIntensity] = useState<Intensity>("spicy");
  const [intent, setIntent] = useState<Intent>({ product: "", audience: "", action: "" });
  const [report, setReport] = useState<RoastReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [rescueImage, setRescueImage] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageGenerationError, setImageGenerationError] = useState("");

  const canSubmit = Boolean(image && intent.product && intent.audience && intent.action);
  const rewriteCopy = useMemo(() => {
    if (!report) return "";
    return `${report.rewrite.eyebrow}\n\n${report.rewrite.headline}\n${report.rewrite.subheading}\n\n${report.rewrite.cta}`;
  }, [report]);

  useEffect(() => {
    const onPaste = async (event: ClipboardEvent) => {
      const file = Array.from(event.clipboardData?.files ?? []).find((item) =>
        item.type.startsWith("image/"),
      );
      if (!file) return;
      event.preventDefault();
      await prepareFile(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const frame = requestAnimationFrame(() => {
      loadingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [loading]);

  async function prepareFile(file: File) {
    setError("");
    setCaptureError("");
    setReport(null);
    setRescueImage(null);
    setImageGenerationError("");
    try {
      setImage(await compressImage(file));
      setFileName(file.name || "Pasted screenshot");
      setWebsiteUrl("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read that image.");
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void prepareFile(file);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) void prepareFile(file);
  }

  function openFilePicker() {
    if (!fileInput.current) return;
    fileInput.current.value = "";
    fileInput.current.click();
  }

  async function captureWebsite() {
    if (!websiteUrl.trim() || capturingWebsite) return;
    setCapturingWebsite(true);
    setCaptureError("");
    setReport(null);
    setRescueImage(null);
    setImageGenerationError("");
    try {
      const response = await fetch("/api/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });
      const payload = (await response.json()) as {
        image?: string;
        finalUrl?: string;
        title?: string;
        error?: string;
      };
      if (!response.ok || !payload.image) throw new Error(payload.error || "Website capture failed.");
      setImage(payload.image);
      setWebsiteUrl(payload.finalUrl || websiteUrl);
      setFileName(payload.title ? `Website: ${payload.title}` : "Website screenshot");
    } catch (cause) {
      setCaptureError(cause instanceof Error ? cause.message : "We could not capture that website.");
    } finally {
      setCapturingWebsite(false);
    }
  }

  async function analyse({ demo = false }: { demo?: boolean } = {}) {
    if (loading) return;
    const runDemo = demo || image === "/sample-landing.svg";
    setLoading(true);
    setError("");
    setReport(null);
    const activeIntent = demo ? DEMO_INTENT : intent;
    if (demo) {
      setIntent(DEMO_INTENT);
      setImage("/sample-landing.svg");
      setFileName("acme-checkout-demo.svg");
      setIntensity("spicy");
    }

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: runDemo ? undefined : image,
          intensity: demo ? "spicy" : intensity,
          intent: activeIntent,
          demo: runDemo,
        }),
      });
      const payload = (await response.json()) as { report?: RoastReport; error?: string };
      if (!response.ok || !payload.report) {
        throw new Error(payload.error || "The analysis did not complete.");
      }
      setReport(payload.report);
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The roast overheated. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(key: string, value: string) {
    try {
      await copyText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1400);
    } catch {
      setError("Your browser blocked clipboard access. Select the text and copy it manually.");
    }
  }

  async function handleShare() {
    if (!report) return;
    try {
      const text = verdictText(report);
      const shareUrl = window.location.origin;
      const blob = await createShareCard(report);
      const file = new File([blob], "roast-and-rescue-verdict.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "My Roast & Rescue verdict", text, url: shareUrl, files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title: "My Roast & Rescue verdict", text, url: shareUrl });
      } else {
        await copyText(`${text}\n\n${shareUrl}`);
      }
      setCopied("share");
      window.setTimeout(() => setCopied(""), 1800);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setError("Sharing was blocked. Save the verdict card instead.");
    }
  }

  async function downloadShareCard() {
    if (!report) return;
    try {
      const blob = await createShareCard(report);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "roast-and-rescue-verdict.png";
      anchor.click();
      URL.revokeObjectURL(url);
      setCopied("card");
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setError("This browser could not save the verdict card.");
    }
  }

  async function generateRescueImage() {
    if (!report || !image || generatingImage) return;
    setGeneratingImage(true);
    setImageGenerationError("");
    try {
      const demo = image === "/sample-landing.svg";
      const response = await fetch("/api/rescue-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demo,
          image: demo ? undefined : image,
          report: {
            roast: report.roast,
            consensus: report.consensus,
            rewrite: report.rewrite,
          },
        }),
      });
      const payload = (await response.json()) as { image?: string; error?: string };
      if (!response.ok || !payload.image) throw new Error(payload.error || "No concept was generated.");
      setRescueImage(payload.image);
    } catch (cause) {
      setImageGenerationError(cause instanceof Error ? cause.message : "The visual rescue did not finish.");
    } finally {
      setGeneratingImage(false);
    }
  }

  function startOver() {
    setImage(null);
    setFileName("");
    setWebsiteUrl("");
    setCaptureError("");
    setIntent({ product: "", audience: "", action: "" });
    setIntensity("spicy");
    setReport(null);
    setError("");
    setCopied("");
    setRescueImage(null);
    setImageGenerationError("");
    if (fileInput.current) fileInput.current.value = "";
    requestAnimationFrame(() => labRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  return (
    <main>
      <div className="marquee" aria-hidden="true">
        <div>
          YOUR LANDING PAGE HAS FIVE SECONDS ✦ LET’S SEE WHAT SURVIVED ✦ YOUR LANDING PAGE
          HAS FIVE SECONDS ✦ LET’S SEE WHAT SURVIVED ✦
        </div>
      </div>

      <nav>
        <a className="brand" href="#top" aria-label="Roast and Rescue home">
          <LogoMark />
          <span className="brand-name">Roast <em>&amp;</em> Rescue</span>
        </a>
        <div className="nav-pills">
          <a href="#roast">The lab</a>
          <a href="#how">How it works</a>
        </div>
        <a className="primary-button nav-cta" href="#roast">
          Roast my page
        </a>
      </nav>

      <section className="hero" id="top">
        <JudgeScene interactive />
        <div className="hero-sticker sticker-yellow">5 SEC</div>
        <div className="hero-copy">
          <p className="eyebrow">A FIVE-SECOND LANDING-PAGE TEST WITH TEETH</p>
          <h1 aria-label="Roast and Rescue">
            <span className="hero-word" aria-hidden="true">ROAST</span>
            <span className="hero-rescue-line" aria-hidden="true">
              <span className="hero-amp">&</span>
              <span className="hero-word">RESCUE</span>
            </span>
          </h1>
          <p className="hero-subtitle">
            Find out what visitors actually understand—then rescue your hero copy before they
            bounce.
          </p>
          <a className="primary-button" href="#roast">
            Enter the roast lab <span aria-hidden="true">↓</span>
          </a>
          <div className="hero-proof" aria-label="Product highlights">
            <span>3 opinionated judges</span>
            <span>1 useful rescue</span>
            <span>No account</span>
          </div>
        </div>
      </section>

      <section className="meme-strip" aria-label="Common landing-page clarity problems">
        <div className="meme-card founder-meme">
          <span>FOUNDER</span>
          <strong>“The value prop is obvious.”</strong>
        </div>
        <div className="meme-arrow" aria-hidden="true">→</div>
        <div className="meme-card visitor-meme">
          <span>VISITOR, 5 SECONDS LATER</span>
          <strong>“So… is it blockchain?”</strong>
        </div>
        <div className="meme-card cta-meme">
          <span>THE CTA</span>
          <strong>LEARN MORE</strong>
          <small>learn what, bestie?</small>
        </div>
      </section>

      <section className="lab-section" id="roast" ref={labRef}>
        <div className="section-heading">
          <p className="eyebrow">THE ROAST LAB</p>
          <h2>Bring the landing page.</h2>
          <p>Upload a screenshot or capture a public URL. No account, and no intentional image storage.</p>
        </div>

        <div className="lab-grid">
          <div className="upload-column">
            <div
              className={`dropzone ${image ? "has-image" : ""}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={onDrop}
            >
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onFileChange}
                hidden
              />
              {image ? (
                <>
                  <Image
                    src={image}
                    alt="Landing-page screenshot preview"
                    fill
                    sizes="(max-width: 900px) 100vw, 58vw"
                    unoptimized
                  />
                  <div className="image-actions">
                    <span>{fileName}</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openFilePicker();
                      }}
                    >
                      Replace
                    </button>
                  </div>
                </>
              ) : (
                <div className="dropzone-empty">
                  <div className="upload-icon">↥</div>
                  <strong>Drop, paste or choose a screenshot</strong>
                  <span>PNG, JPEG or WebP · 12 MB max</span>
                  <button type="button" onClick={openFilePicker}>Choose image</button>
                </div>
              )}
            </div>

            <div className="capture-divider"><span>OR</span></div>
            <form
              className="url-capture"
              onSubmit={(event) => {
                event.preventDefault();
                void captureWebsite();
              }}
            >
              <label htmlFor="website-url">Capture a public website</label>
              <div>
                <input
                  id="website-url"
                  type="text"
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={websiteUrl}
                  onChange={(event) => setWebsiteUrl(event.target.value)}
                  placeholder="yourwebsite.com"
                  maxLength={2048}
                />
                <button type="submit" disabled={!websiteUrl.trim() || capturingWebsite || loading}>
                  {capturingWebsite ? "Capturing…" : "Capture site"}
                </button>
              </div>
              <small>Public pages only · desktop hero screenshot · no logins or private networks</small>
              {captureError && <p className="capture-error" role="alert">{captureError}</p>}
            </form>

            <button
              className="demo-button"
              type="button"
              onClick={() => void analyse({ demo: true })}
              disabled={loading}
            >
              {image === "/sample-landing.svg" ? "Run the sample again" : "No screenshot? Run the sample"} <span>→</span>
            </button>
          </div>

          <div className="controls-card">
            <div className="step-label"><span>01</span> Tell us what you meant</div>
            <label>
              What does the product actually do?
              <input
                value={intent.product}
                onChange={(event) => setIntent({ ...intent, product: event.target.value })}
                placeholder="e.g. Checkout diagnostics for small shops"
              />
            </label>
            <label>
              Who is it for?
              <input
                value={intent.audience}
                onChange={(event) => setIntent({ ...intent, audience: event.target.value })}
                placeholder="e.g. Independent ecommerce founders"
              />
            </label>
            <label>
              What should visitors do?
              <input
                value={intent.action}
                onChange={(event) => setIntent({ ...intent, action: event.target.value })}
                placeholder="e.g. Analyse their checkout"
              />
            </label>

            <div className="step-label second"><span>02</span> Choose your heat</div>
            <div className="intensity-picker">
              {intensityLabels.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={intensity === item.value ? "active" : ""}
                  onClick={() => setIntensity(item.value)}
                  aria-pressed={intensity === item.value}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            <button
              className="analyse-button"
              type="button"
              onClick={() => void analyse()}
              disabled={!canSubmit || loading}
            >
              {loading ? "Heating the grill…" : "Roast this page"}
              <span aria-hidden="true">✦</span>
            </button>
            {!canSubmit && !loading && (
              <p className="form-hint">Add a screenshot and all three intentions to begin.</p>
            )}
            {error && <p className="error-message" role="alert">{error}</p>}
          </div>
        </div>
      </section>

      {loading && (
        <section className="loading-section" ref={loadingRef} aria-live="polite" aria-busy="true">
          <JudgeScene />
          <div className="loading-stickers" aria-hidden="true">
            <span>THE VISITOR IS SQUINTING</span>
            <span>THE GREMLIN WANTS NOUNS</span>
            <span>THE DETECTIVE FOUND THE CTA</span>
          </div>
          <h2>Calling the judges…</h2>
          <p>Three tiny experts. Three completely different kinds of side-eye.</p>
        </section>
      )}

      {report && (
        <section className="results-section" ref={resultsRef} aria-live="polite">
          <div className="result-banner">
            <div className="result-memes" aria-hidden="true">
              <span>IT’S GIVING: MYSTERY</span>
              <span>THE HERO NEEDS A HERO</span>
            </div>
            <p className="eyebrow">THE FIVE-SECOND VERDICT</p>
            <blockquote>“{report.roast}”</blockquote>
            <button
              className="result-copy-button"
              type="button"
              onClick={() => void handleCopy("roast", report.roast)}
            >
              {copied === "roast" ? "Copied roast!" : "Copy the roast"}
            </button>
            <div className="share-actions">
              <button type="button" onClick={() => void handleShare()}>
                {copied === "share" ? "Shared / copied!" : "Share verdict ↗"}
              </button>
              <button type="button" onClick={() => void downloadShareCard()}>
                {copied === "card" ? "Card saved!" : "Save share card ↓"}
              </button>
            </div>
            <span className="roast-stamp">ROASTED</span>
          </div>

          <section className="judge-panel" aria-labelledby="judge-panel-title">
            <div className="judge-heading">
              <p className="eyebrow">THE PANEL HAS ENTERED THE CHAT</p>
              <h2 id="judge-panel-title">Meet your judges.</h2>
              <p>They do not agree on everything. That is the useful part.</p>
            </div>

            <JudgeScene />

            <div className="judge-opinions">
              {report.judges.map((judge, index) => (
                <article className={`judge-card judge-card-${index + 1}`} key={judge.name}>
                  <div className="judge-number">0{index + 1}</div>
                  <p className="eyebrow">{judge.lens}</p>
                  <h3>{judge.name}</h3>
                  <blockquote>“{judge.opinion}”</blockquote>
                  <strong>{judge.verdict}</strong>
                </article>
              ))}
            </div>

            <div className="panel-conclusion">
              <article className="consensus-card">
                <p className="eyebrow">THE UNANIMOUS VERDICT</p>
                <h3>Do these three things first.</h3>
                <ul>
                  {report.consensus.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </article>

              <article className="example-card">
                <p className="eyebrow">SHOW, DON’T TELL</p>
                <div className="example-line example-before">
                  <span>BEFORE</span>
                  <strong>{report.example.before}</strong>
                </div>
                <div className="example-arrow" aria-hidden="true">↓</div>
                <div className="example-line example-after">
                  <span>AFTER</span>
                  <strong>{report.example.after}</strong>
                </div>
                <p>{report.example.why}</p>
              </article>
            </div>
          </section>

          <div className="results-grid">
            <article className="visitor-card">
              <div className="card-heading">
                <span className="number-sticker">01</span>
                <div>
                  <p className="eyebrow">WHAT A VISITOR SEES</p>
                  <h3>The blind read</h3>
                </div>
              </div>
              {Object.entries(report.visitorRead).map(([key, value]) => (
                <div className="read-row" key={key}>
                  <span>{key.replace(/([A-Z])/g, " $1")}</span>
                  <p>{value}</p>
                </div>
              ))}
            </article>

            <article className="score-card">
              <p className="eyebrow">SUBJECTIVE CLARITY SIGNALS</p>
              <h3>The vital signs</h3>
              <Score label="Clarity" value={report.scores.clarity} />
              <Score label="Specificity" value={report.scores.specificity} />
              <Score label="Hierarchy" value={report.scores.hierarchy} />
              <Score label="Action" value={report.scores.action} />
              <p className="score-note">Signals, not conversion predictions.</p>
            </article>
          </div>

          <article className="gap-card">
            <div className="gap-icon">↯</div>
            <div>
              <p className="eyebrow">THE INTENTION GAP</p>
              <h3>{report.intentGap}</h3>
            </div>
          </article>

          <div className="rescue-mascot-band">
            <MascotScene mode="rescue" />
            <div>
              <span className="eyebrow">THE CRITIC HAS LOGGED OFF</span>
              <strong>Your hero survived character development.</strong>
            </div>
          </div>

          <div className="rescue-heading">
            <p className="eyebrow">NOW FOR THE USEFUL BIT</p>
            <h2>Rescue mode.</h2>
          </div>

          <div className="keep-card">
            <span>KEEP THIS</span>
            <p>{report.keep}</p>
          </div>

          <div className="improvements-grid">
            {report.improvements.map((item, index) => (
              <article key={item.title}>
                <span>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>

          <article className="rewrite-card">
            <div className="rewrite-topline">
              <div>
                <p className="eyebrow">YOUR RESCUED HERO</p>
                <span>Ready to test—not guaranteed to convert.</span>
              </div>
              <button type="button" onClick={() => void handleCopy("rewrite", rewriteCopy)}>
                {copied === "rewrite" ? "Copied!" : "Copy all"}
              </button>
            </div>
            <div className="rewritten-hero">
              <p>{report.rewrite.eyebrow}</p>
              <h3>{report.rewrite.headline}</h3>
              <span>{report.rewrite.subheading}</span>
              <button type="button">{report.rewrite.cta}</button>
            </div>
          </article>

          <article className="visual-rescue-card">
            <div className="visual-rescue-copy">
              <div>
                <p className="eyebrow">OPTIONAL AI CONCEPT</p>
                <h3>See the critique become a direction.</h3>
              </div>
              <p>
                Generate one illustrative hero redesign using the rescued copy and priority fixes.
                Review every word, accessibility choice and claim before using it.
              </p>
              <button type="button" onClick={() => void generateRescueImage()} disabled={generatingImage}>
                {generatingImage ? "Designing the rescue…" : rescueImage ? "Generate another concept" : "Generate visual rescue ✦"}
              </button>
              <small>Avoid screenshots containing secrets or personal/customer data.</small>
              {imageGenerationError && <p className="error-message" role="alert">{imageGenerationError}</p>}
            </div>
            <div className={`visual-rescue-preview ${rescueImage ? "has-concept" : ""}`}>
              {rescueImage ? (
                <>
                  <Image
                    src={rescueImage}
                    alt="AI-generated illustrative landing-page hero concept"
                    width={1536}
                    height={1024}
                    unoptimized
                  />
                  <a href={rescueImage} download="roast-and-rescue-concept.jpg">Download concept ↓</a>
                </>
              ) : (
                <div aria-hidden="true">
                  <span>BEFORE</span><span>→</span><strong>AFTER?</strong>
                </div>
              )}
            </div>
          </article>

          <button className="start-over" type="button" onClick={startOver}>
            Roast another page ↺
          </button>
        </section>
      )}

      <section className="how-section" id="how">
        <p className="eyebrow">HOW IT WORKS</p>
        <h2>Blind read. Honest gap. Better words.</h2>
        <div>
          <article><span>01</span><h3>See</h3><p>We inspect the screenshot before considering your intended message.</p></article>
          <article><span>02</span><h3>Roast</h3><p>A memorable diagnosis makes the clarity problem impossible to ignore.</p></article>
          <article><span>03</span><h3>Rescue</h3><p>You leave with three priorities and hero copy ready to test.</p></article>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand"><LogoMark /><span className="brand-name">Roast <em>&amp;</em> Rescue</span></div>
        <p>Built at DevDay Exchange London with Codex and the OpenAI API.</p>
        <a href="https://github.com/zedshy/roast-and-rescue">GitHub ↗</a>
      </footer>
    </main>
  );
}
