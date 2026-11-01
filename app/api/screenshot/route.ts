import { existsSync } from "node:fs";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/server-guardrails";
import { assertPublicHostname, normalizeWebsiteUrl } from "@/lib/url-safety";

export const runtime = "nodejs";
export const maxDuration = 120;

const localChromeCandidates = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter((value): value is string => Boolean(value));

async function browserOptions() {
  if (process.env.VERCEL) {
    return {
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true as const,
    };
  }
  const executablePath = localChromeCandidates.find((candidate) => existsSync(candidate));
  if (!executablePath) {
    throw new Error("LOCAL_CHROME_MISSING");
  }
  return {
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    executablePath,
    headless: true as const,
  };
}

export async function POST(request: Request) {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined;
  try {
    const limit = rateLimit(request, "website-screenshot", 5, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Website captures are limited to five every ten minutes. Try again shortly.", code: "RATE_LIMITED" },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    const body = (await request.json()) as { url?: unknown };
    if (typeof body.url !== "string" || body.url.trim().length < 4) {
      return NextResponse.json({ error: "Enter a public website URL.", code: "INVALID_URL" }, { status: 400 });
    }
    const target = normalizeWebsiteUrl(body.url);
    await assertPublicHostname(target.hostname);

    browser = await puppeteer.launch(await browserOptions());
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.setUserAgent(
      "Mozilla/5.0 (compatible; RoastAndRescue/1.0; +https://github.com/zedshy/roast-and-rescue)",
    );
    page.setDefaultNavigationTimeout(25_000);
    page.setDefaultTimeout(12_000);

    const hostChecks = new Map<string, Promise<boolean>>();
    await page.setRequestInterception(true);
    page.on("request", (pageRequest) => {
      void (async () => {
        try {
          const resource = new URL(pageRequest.url());
          if (resource.protocol === "data:" || resource.protocol === "blob:") {
            await pageRequest.continue();
            return;
          }
          if (!['http:', 'https:'].includes(resource.protocol)) {
            await pageRequest.abort("blockedbyclient");
            return;
          }
          let check = hostChecks.get(resource.hostname);
          if (!check) {
            if (hostChecks.size >= 50) {
              await pageRequest.abort("blockedbyclient");
              return;
            }
            check = assertPublicHostname(resource.hostname).then(() => true).catch(() => false);
            hostChecks.set(resource.hostname, check);
          }
          if (await check) await pageRequest.continue();
          else await pageRequest.abort("blockedbyclient");
        } catch {
          try { await pageRequest.abort("blockedbyclient"); } catch { /* page closed */ }
        }
      })();
    });

    await page.goto(target.href, { waitUntil: "domcontentloaded", timeout: 25_000 });
    const finalUrl = normalizeWebsiteUrl(page.url());
    await assertPublicHostname(finalUrl.hostname);
    await new Promise((resolve) => setTimeout(resolve, 1_200));
    const title = (await page.title()).slice(0, 160);
    const screenshot = await page.screenshot({ type: "jpeg", quality: 72, fullPage: false });
    const encoded = Buffer.from(screenshot).toString("base64");
    if (encoded.length > 3_700_000) throw new Error("SCREENSHOT_TOO_LARGE");

    return NextResponse.json(
      { image: `data:image/jpeg;base64,${encoded}`, finalUrl: finalUrl.href, title },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "LOCAL_CHROME_MISSING") {
      return NextResponse.json(
        { error: "Local capture needs Chrome or PUPPETEER_EXECUTABLE_PATH. Vercel is configured automatically.", code: message },
        { status: 503 },
      );
    }
    if (/public|private|hostname|http|credentials|URL|too long/i.test(message)) {
      return NextResponse.json({ error: message, code: "UNSAFE_URL" }, { status: 400 });
    }
    console.error("Website capture failed", error);
    return NextResponse.json(
      { error: "We could not capture that site. Check that it is public and try again.", code: "CAPTURE_FAILED" },
      { status: 502 },
    );
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
