import { createHash } from "node:crypto";
import type OpenAI from "openai";

type Bucket = { count: number; resetsAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(request: Request, scope: string, limit: number, windowMs: number) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "local";
  const key = `${scope}:${address}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetsAt <= now) {
    buckets.set(key, { count: 1, resetsAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (current.count >= limit) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((current.resetsAt - now) / 1000)) };
  }

  current.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export function safetyIdentifier(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "local";
  const salt = process.env.SAFETY_IDENTIFIER_SALT || "roast-and-rescue";
  return createHash("sha256").update(`${salt}:${address}`).digest("hex");
}

export async function moderateInput(client: OpenAI, text: string, image?: string) {
  const input: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [{ type: "text", text }];
  if (image) input.push({ type: "image_url", image_url: { url: image } });

  const moderation = await client.moderations.create({
    model: "omni-moderation-latest",
    input,
  });
  return moderation.results.some((result) => result.flagged);
}

export async function moderateOutput(client: OpenAI, text: string) {
  const moderation = await client.moderations.create({
    model: "omni-moderation-latest",
    input: text,
  });
  return moderation.results.some((result) => result.flagged);
}
