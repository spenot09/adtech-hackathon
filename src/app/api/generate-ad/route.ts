import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function loadGuidelines(brandId: string): string {
  const slugMap: Record<string, string> = {
    nike: "nike",
    nb: "new-balance",
  };
  const slug = slugMap[brandId];
  if (!slug) return "";
  try {
    return readFileSync(join(process.cwd(), "brand-guidelines", `${slug}.md`), "utf-8");
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { agentId, brandName, query, intent } = await req.json();

    if (!agentId || !brandName || !query) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const guidelines = loadGuidelines(agentId);
    const imageStyleSection =
      guidelines.match(/## Photography[^\n]*\n([\s\S]*?)(?=\n##|$)/)?.[1]?.trim() ?? "";
    const colorSection =
      guidelines.match(/## Color Palette[^\n]*\n([\s\S]*?)(?=\n##|$)/)?.[1]?.trim() ?? "";

    // Run copy and image generation in parallel
    const [copyResponse, imageResponse] = await Promise.all([
      // 1. Ad copy
      anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `You are a senior copywriter for ${brandName}. Using the brand guidelines below, write a display ad for the following user query context.

BRAND GUIDELINES:
${guidelines}

USER QUERY CONTEXT:
"${query}"
Intent category: ${intent}

Write ad copy that feels native to this brand. Return ONLY valid JSON with these exact fields:
{
  "headline": "Short punchy headline (max 6 words)",
  "body": "One sentence connecting brand to this specific user need",
  "cta": "Short action CTA (2-4 words)"
}`,
          },
        ],
      }),

      // 2. SVG banner image
      anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `Generate a high-quality SVG advertisement banner (1792×1024) for ${brandName}.

BRAND VISUAL DIRECTION:
${imageStyleSection}

COLOR PALETTE:
${colorSection}

CONTEXT: User searched for "${query}" (intent: ${intent})

Requirements:
- 1792×1024 viewBox, no text, no logos, no emojis, no faces
- Abstract/atmospheric composition that evokes the brand mood and context
- Use gradients, geometric shapes, light effects, textures via SVG filters
- Should feel like a premium cinematic backdrop — space for text overlay at the bottom third
- Bottom third should be darker/shadowed so white text overlaid there is legible
- High production quality: layered shapes, subtle noise/grain via feTurbulence, realistic lighting via feGaussianBlur and feBlend
- Return ONLY the raw SVG markup starting with <svg and ending with </svg>, no explanation, no code fences`,
          },
        ],
      }),
    ]);

    // Parse copy
    let copy = { headline: brandName, body: query, cta: "Learn more" };
    try {
      const raw = copyResponse.content[0].type === "text" ? copyResponse.content[0].text : "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) copy = JSON.parse(jsonMatch[0]);
    } catch { /* use defaults */ }

    // Parse SVG → data URL
    let imageUrl = "";
    try {
      const svgRaw = imageResponse.content[0].type === "text" ? imageResponse.content[0].text : "";
      const svgMatch = svgRaw.match(/<svg[\s\S]*<\/svg>/i);
      if (svgMatch) {
        const b64 = Buffer.from(svgMatch[0]).toString("base64");
        imageUrl = `data:image/svg+xml;base64,${b64}`;
      }
    } catch { /* imageUrl stays empty */ }

    return NextResponse.json({ headline: copy.headline, body: copy.body, cta: copy.cta, imageUrl });
  } catch (err: unknown) {
    console.error("generate-ad error:", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
