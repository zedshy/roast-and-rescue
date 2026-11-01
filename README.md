# Roast & Rescue

Your landing page has five seconds. Let’s see what survived.

Roast & Rescue is a playful landing-page clarity test for founders and indie developers. Upload a screenshot, describe what you intended to communicate, and face three animated judges: a distracted visitor, a copy gremlin, and a click detective. Their verdict becomes a funny diagnosis, a three-point rescue plan, a concrete before/after example, and rewritten hero copy.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzedshy%2Froast-and-rescue&env=OPENAI_API_KEY%2CSAFETY_IDENTIFIER_SALT)

## Core journey

1. Upload or paste a landing-page screenshot.
2. Describe the product, audience, and desired visitor action.
3. Choose Gentle, Spicy, or Brutal.
4. Hear three distinct judge opinions and their shared verdict.
5. Review the before/after example, blind read, and intention gap.
6. Share or download the panel verdict as a social card.
7. Copy the rescued hero, or generate one illustrative visual direction from the critique.

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
OPENAI_IMAGE_MODEL=gpt-image-2.5-flare
SAFETY_IDENTIFIER_SALT=replace_with_a_random_secret
```

The API key is only read by the server route and must never be exposed through a `NEXT_PUBLIC_` variable.

## Deploy to Vercel

1. Click **Deploy with Vercel** above or import `zedshy/roast-and-rescue` in Vercel.
2. Add `OPENAI_API_KEY` and a long random `SAFETY_IDENTIFIER_SALT` as **Secret** environment variables for Production and Preview.
3. Leave the framework preset as Next.js and the build command as `npm run build`; no output-directory override is needed.
4. Deploy, then open the generated URL in a private browser window and run both the built-in sample and one real screenshot.

The two API routes use the Node.js runtime with a 300-second ceiling, which fits Vercel Hobby’s current maximum. Screenshots are compressed below Vercel’s 4.5 MB function payload cap, and generated concepts use compressed JPEG output for the same reason. Changing environment variables only affects a new deployment, so redeploy after editing them.

## Technical notes

- Next.js and TypeScript
- OpenAI Responses API with image input
- Structured Outputs for predictable report rendering
- Image-generation tool for an optional critique-led hero concept
- Three.js via React Three Fiber for supporting mascot moments
- Original interactive SVG judge cast with lightweight CSS character animation
- Client-side screenshot resizing before upload
- Native share-sheet support plus a locally rendered 1200×630 verdict card
- No database, accounts, URL scraping, or intentional image storage

## How Codex helped

Codex helped reduce the hackathon idea to one complete journey, translated the design reference into reusable CSS tokens, built the original animated SVG judge cast, extended the image-input response into three reliable critique lenses, added guarded critique and image-generation routes, built a no-key demo fallback, and tested the responsive interface.

## Safety and privacy

- Screenshot text is treated as untrusted content, not as instructions.
- Roasts target the page, never the person who created it.
- Scores are subjective clarity signals, not conversion predictions.
- Requests are schema-validated and text plus screenshots are checked with `omni-moderation-latest`.
- The API opts out of response storage and passes a one-way, salted safety identifier.
- Basic per-instance rate limits allow 8 critiques and 3 generated concepts per 10 minutes.
- Generated concepts are checked again before being returned.
- Avoid uploading secrets or personal information.
- Screenshots are sent for the requested analysis and are not intentionally persisted by this app.

The included limiter is deliberately lightweight for a hackathon. Replace it with a durable shared rate limiter before running multiple production instances.

## Credits

Built during the DevDay Exchange Community Hackathon in London on 1 November 2026.

- Visual direction inspired by the [Slush style reference on Refero](https://styles.refero.design/style/8b6b547f-a357-4f1b-9842-4579c62dd42b). No proprietary fonts or source assets were copied.
- Display typography uses Anton; interface typography uses Inter through `next/font`.
- Judge characters are original SVG illustrations generated in code for this project.
- OpenAI implementation follows the current official [API quickstart](https://developers.openai.com/api/docs/quickstart), [image-input guide](https://developers.openai.com/api/docs/guides/images-vision?api-mode=responses), [Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs), [image-generation tool guide](https://developers.openai.com/api/docs/guides/tools-image-generation), and [moderation guide](https://developers.openai.com/api/docs/guides/moderation).

## Submission checklist

- [ ] Add a real API key to the deployment environment
- [ ] Test the public URL in a private browser window
- [ ] Record a demo video of no more than 90 seconds
- [ ] Add the final deployed URL and demo video to this README
- [ ] Confirm the repository contains no secrets or personal data
