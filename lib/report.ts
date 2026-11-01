export type Intensity = "gentle" | "spicy" | "brutal";

export type RoastReport = {
  roast: string;
  judges: Array<{
    name: string;
    lens: string;
    opinion: string;
    verdict: string;
  }>;
  consensus: string[];
  example: {
    before: string;
    after: string;
    why: string;
  };
  visitorRead: {
    product: string;
    audience: string;
    benefit: string;
    action: string;
    confusion: string;
  };
  intentGap: string;
  keep: string;
  improvements: Array<{
    title: string;
    detail: string;
  }>;
  rewrite: {
    eyebrow: string;
    headline: string;
    subheading: string;
    cta: string;
  };
  scores: {
    clarity: number;
    specificity: number;
    hierarchy: number;
    action: number;
  };
};

export const SAMPLE_REPORT: RoastReport = {
  roast:
    "This hero has the confidence of a billion-pound platform and the explanatory power of a billboard glimpsed from a moving train.",
  judges: [
    {
      name: "The Distracted Visitor",
      lens: "First impression",
      opinion:
        "I can tell this is analytics, but I cannot tell what it analyses before my imaginary train reaches the next station.",
      verdict: "Category clear. Value fuzzy.",
    },
    {
      name: "The Copy Gremlin",
      lens: "Clarity and specificity",
      opinion:
        "“Unlock insights” and “drive outcomes” are doing competitive corporate-jargon gymnastics. Give me one expensive problem and one recognisable customer.",
      verdict: "Too many clouds, not enough nouns.",
    },
    {
      name: "The Click Detective",
      lens: "CTA and next action",
      opinion:
        "“Start now” asks for commitment before explaining the reward. A safer, concrete first step would earn more curiosity.",
      verdict: "The button needs a promise.",
    },
  ],
  consensus: [
    "Name the checkout problem in the first line.",
    "Say explicitly that the product is for independent online shops.",
    "Make the CTA describe the useful first step, not the signup mechanism.",
  ],
  example: {
    before: "Unlock insights. Drive outcomes.",
    after: "Find the checkout problems costing you sales.",
    why: "The revision names the problem, implies a financial benefit, and gives the right customer a reason to keep reading.",
  },
  visitorRead: {
    product: "An AI analytics product for online businesses",
    audience: "Probably enterprise product or engineering teams",
    benefit: "It promises to reveal patterns hidden in customer data",
    action: "Start a trial, though the commitment is unclear",
    confusion: "What data it analyses and what changes after I use it",
  },
  intentGap:
    "You meant “checkout diagnostics for independent shops”; the page currently reads like a broad enterprise analytics suite.",
  keep:
    "The product screenshot creates credibility and gives the eye a clear destination.",
  improvements: [
    {
      title: "Name the expensive problem",
      detail: "Lead with failed checkouts rather than a general promise to unlock insights.",
    },
    {
      title: "Choose a customer",
      detail: "Say “independent online shops” so the right visitor recognises themselves immediately.",
    },
    {
      title: "Make the first step safe",
      detail: "Replace the vague trial CTA with a concrete, low-commitment analysis action.",
    },
  ],
  rewrite: {
    eyebrow: "CHECKOUT DIAGNOSTICS FOR INDEPENDENT SHOPS",
    headline: "Find the checkout problems costing you sales.",
    subheading:
      "See where shoppers abandon their purchase and get a focused fix list—without digging through another analytics dashboard.",
    cta: "Analyse my checkout",
  },
  scores: {
    clarity: 2,
    specificity: 1,
    hierarchy: 4,
    action: 2,
  },
};

export const REPORT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "roast",
    "judges",
    "consensus",
    "example",
    "visitorRead",
    "intentGap",
    "keep",
    "improvements",
    "rewrite",
    "scores",
  ],
  properties: {
    roast: { type: "string" },
    judges: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "lens", "opinion", "verdict"],
        properties: {
          name: { type: "string" },
          lens: { type: "string" },
          opinion: { type: "string" },
          verdict: { type: "string" },
        },
      },
    },
    consensus: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" },
    },
    example: {
      type: "object",
      additionalProperties: false,
      required: ["before", "after", "why"],
      properties: {
        before: { type: "string" },
        after: { type: "string" },
        why: { type: "string" },
      },
    },
    visitorRead: {
      type: "object",
      additionalProperties: false,
      required: ["product", "audience", "benefit", "action", "confusion"],
      properties: {
        product: { type: "string" },
        audience: { type: "string" },
        benefit: { type: "string" },
        action: { type: "string" },
        confusion: { type: "string" },
      },
    },
    intentGap: { type: "string" },
    keep: { type: "string" },
    improvements: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "detail"],
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
        },
      },
    },
    rewrite: {
      type: "object",
      additionalProperties: false,
      required: ["eyebrow", "headline", "subheading", "cta"],
      properties: {
        eyebrow: { type: "string" },
        headline: { type: "string" },
        subheading: { type: "string" },
        cta: { type: "string" },
      },
    },
    scores: {
      type: "object",
      additionalProperties: false,
      required: ["clarity", "specificity", "hierarchy", "action"],
      properties: {
        clarity: { type: "integer", minimum: 1, maximum: 5 },
        specificity: { type: "integer", minimum: 1, maximum: 5 },
        hierarchy: { type: "integer", minimum: 1, maximum: 5 },
        action: { type: "integer", minimum: 1, maximum: 5 },
      },
    },
  },
} as const;
