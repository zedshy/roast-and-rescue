import { z } from "zod";

const safeText = (label: string, max: number) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(2, `${label} is too short.`)
    .max(max, `${label} must be ${max} characters or fewer.`)
    .refine((value) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value), `${label} contains unsupported characters.`);

export const imageDataSchema = z
  .string()
  .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/, "Use a PNG, JPEG, or WebP screenshot.")
  .max(4_000_000, "That screenshot is too large after compression. Try a smaller image.");

export const roastRequestSchema = z
  .object({
    image: imageDataSchema,
    intensity: z.enum(["gentle", "spicy", "brutal"]).default("spicy"),
    intent: z.object({
      product: safeText("Product description", 240),
      audience: safeText("Audience", 180),
      action: safeText("Desired action", 180),
    }),
    demo: z.literal(false).optional(),
  })
  .strict();

export const rescueImageRequestSchema = z
  .object({
    image: imageDataSchema,
    report: z.object({
      roast: safeText("Roast", 600),
      consensus: z.array(safeText("Consensus point", 300)).length(3),
      rewrite: z.object({
        eyebrow: safeText("Eyebrow", 160),
        headline: safeText("Headline", 240),
        subheading: safeText("Subheading", 500),
        cta: safeText("CTA", 120),
      }),
    }),
    demo: z.literal(false).optional(),
  })
  .strict();

const judgeSchema = z.object({
  name: safeText("Judge name", 120),
  lens: safeText("Judge lens", 120),
  opinion: safeText("Judge opinion", 800),
  verdict: safeText("Judge verdict", 300),
}).strict();

export const exportReportSchema = z.object({
  roast: safeText("Roast", 800),
  judges: z.array(judgeSchema).length(3),
  consensus: z.array(safeText("Consensus point", 500)).length(3),
  example: z.object({
    before: safeText("Before example", 500),
    after: safeText("After example", 500),
    why: safeText("Example explanation", 800),
  }).strict(),
  visitorRead: z.object({
    product: safeText("Visitor product read", 500),
    audience: safeText("Visitor audience read", 500),
    benefit: safeText("Visitor benefit read", 500),
    action: safeText("Visitor action read", 500),
    confusion: safeText("Visitor confusion", 800),
  }).strict(),
  intentGap: safeText("Intention gap", 1000),
  keep: safeText("Keep recommendation", 800),
  improvements: z.array(z.object({
    title: safeText("Improvement title", 200),
    detail: safeText("Improvement detail", 800),
  }).strict()).length(3),
  rewrite: z.object({
    eyebrow: safeText("Eyebrow", 200),
    headline: safeText("Headline", 400),
    subheading: safeText("Subheading", 800),
    cta: safeText("CTA", 160),
  }).strict(),
  scores: z.object({
    clarity: z.number().int().min(1).max(5),
    specificity: z.number().int().min(1).max(5),
    hierarchy: z.number().int().min(1).max(5),
    action: z.number().int().min(1).max(5),
  }).strict(),
}).strict();

export function firstValidationError(error: z.ZodError) {
  return error.issues[0]?.message || "Please check the submitted details.";
}
