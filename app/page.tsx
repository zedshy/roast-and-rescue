"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Intensity, RoastReport } from "@/lib/report";

const RibbonScene = dynamic(
  () => import("@/components/RibbonScene").then((module) => module.RibbonScene),
  { ssr: false },
);
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
  return canvas.toDataURL("image/jpeg", 0.86);
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
  const [intensity, setIntensity] = useState<Intensity>("spicy");
  const [intent, setIntent] = useState<Intent>({ product: "", audience: "", action: "" });
  const [report, setReport] = useState<RoastReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

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
    setReport(null);
    try {
      setImage(await compressImage(file));
      setFileName(file.name || "Pasted screenshot");
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

  function startOver() {
    setImage(null);
    setFileName("");
    setIntent({ product: "", audience: "", action: "" });
    setIntensity("spicy");
    setReport(null);
    setError("");
    setCopied("");
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
          R<span>&</span>R
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
        <RibbonScene />
        <div className="hero-sticker sticker-orange">HONEST</div>
        <div className="hero-sticker sticker-yellow">5 SEC</div>
        <div className="speech-bubble">respectfully… what do you sell?</div>
        <div className="hero-copy">
          <p className="eyebrow">A FIVE-SECOND LANDING-PAGE TEST WITH TEETH</p>
          <h1 aria-label="Roast and Rescue">
            <span className="hero-word" aria-hidden="true">ROAST</span>
            <span className="hero-amp" aria-hidden="true">&</span>
            <span className="hero-word" aria-hidden="true">RESCUE</span>
          </h1>
          <p className="hero-subtitle">
            Find out what visitors actually understand—then rescue your hero copy before they
            bounce.
          </p>
          <a className="primary-button" href="#roast">
            Enter the roast lab <span aria-hidden="true">↓</span>
          </a>
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
          <h2>Drop the screenshot.</h2>
          <p>No URL scraping. No account. Your image is used for this analysis, not saved by us.</p>
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
        <div className="brand footer-brand">R<span>&</span>R</div>
        <p>Built at DevDay Exchange London with Codex and the OpenAI API.</p>
        <a href="https://github.com/zedshy/roast-and-rescue">GitHub ↗</a>
      </footer>
    </main>
  );
}
