# Roast & Rescue

Your landing page has five seconds. Let’s see what survived.

Roast & Rescue is a playful landing-page clarity test for founders and indie developers. Upload a screenshot, describe what you intended to communicate, and face three animated judges: a distracted visitor, a copy gremlin, and a click detective. Their verdict becomes a funny diagnosis, a three-point rescue plan, a concrete before/after example, and rewritten hero copy.

## Core journey

1. Upload or paste a landing-page screenshot.
2. Describe the product, audience, and desired visitor action.
3. Choose Gentle, Spicy, or Brutal.
4. Hear three distinct judge opinions and their shared verdict.
5. Review the before/after example, blind read, and intention gap.
6. Copy the rescued headline, subheading, and CTA.

The built-in sample works without an API key, so the product remains demoable if connectivity or credentials fail.

## Run locally

Requirements: Node.js 20+ and an OpenAI API key for live screenshot analysis.

```bash
npm install
cp .env.example .env.local
# Add OPENAI_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-6-astra
```

The API key is only read by the server route and must never be exposed through a `NEXT_PUBLIC_` variable.

## Technical notes

- Next.js and TypeScript
- OpenAI Responses API with image input
- Structured Outputs for predictable report rendering
- Three.js via React Three Fiber for the interactive desktop hero
- Original SVG judge cast with lightweight CSS character animation
- Client-side screenshot resizing before upload
- No database, accounts, URL scraping, or intentional image storage

## How Codex helped

Codex helped reduce the hackathon idea to one complete journey, translated the design reference into reusable CSS tokens, built the original animated SVG judge cast, extended the image-input response into three reliable critique lenses, added a no-key demo fallback, and tested the responsive interface.

## Safety and privacy

- Screenshot text is treated as untrusted content, not as instructions.
- Roasts target the page, never the person who created it.
- Scores are subjective clarity signals, not conversion predictions.
- Avoid uploading secrets or personal information.
- Screenshots are sent for the requested analysis and are not intentionally persisted by this app.

## Credits

Built during the DevDay Exchange Community Hackathon in London on 1 November 2026.

- Visual direction inspired by the [Slush style reference on Refero](https://styles.refero.design/style/8b6b547f-a357-4f1b-9842-4579c62dd42b). No proprietary fonts or source assets were copied.
- Display typography uses Anton; interface typography uses Inter through `next/font`.
- 3D ribbon is generated in code with Three.js.
- OpenAI implementation follows the current official [API quickstart](https://developers.openai.com/api/docs/quickstart), [image-input guide](https://developers.openai.com/api/docs/guides/images-vision?api-mode=responses), and [Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs).

## Submission checklist

- [ ] Add a real API key to the deployment environment
- [ ] Test the public URL in a private browser window
- [ ] Record a demo video of no more than 90 seconds
- [ ] Add the final deployed URL and demo video to this README
- [ ] Confirm the repository contains no secrets or personal data
