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

export function firstValidationError(error: z.ZodError) {
  return error.issues[0]?.message || "Please check the submitted details.";
}
