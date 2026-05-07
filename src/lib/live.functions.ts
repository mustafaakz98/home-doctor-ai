import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  userText: z.string().min(1).max(2000),
  imageBase64: z.string().max(2_500_000).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      })
    )
    .max(20)
    .default([]),
});

export const askLiveAssistant = createServerFn({ method: "POST" })
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Du bist FixScan Live, ein deutschsprachiger KI-Assistent für Hausreparaturen (Sanitär, Heizung, Klima, Elektro).
Der User zeigt dir per Live-Kamera ein Problem und spricht mit dir.
Antworte SEHR knapp (max. 2 kurze Sätze), klar, in Du-Form, wie ein freundlicher Profi am Telefon.
Wenn etwas gefährlich ist (Strom, Gas, Wasser unter Druck), warne sofort und rate zum Profi.
Stelle bei Bedarf eine Rückfrage. Keine Aufzählungen, kein Markdown.`;

    const imageDataUrl = data.imageBase64
      ? data.imageBase64.startsWith("data:")
        ? data.imageBase64
        : `data:image/jpeg;base64,${data.imageBase64}`
      : null;

    const userContent: Array<Record<string, unknown>> = [{ type: "text", text: data.userText }];
    if (imageDataUrl) {
      userContent.push({ type: "image_url", image_url: { url: imageDataUrl } });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...data.history.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(`AI gateway ${res.status}: ${txt.slice(0, 200)}`);
      return { reply: "Entschuldige, der KI-Dienst ist gerade nicht erreichbar." };
    }
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const reply = json?.choices?.[0]?.message?.content ?? "";
    return { reply };
  });
