const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export interface LiveAssistMessage {
  role: "user" | "assistant";
  content: string;
}

export async function liveAssistAsk(opts: {
  history: LiveAssistMessage[];
  userText: string;
  imageBase64?: string; // data URL or raw base64 (jpeg)
}) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const systemPrompt = `Du bist FixScan Live, ein deutschsprachiger KI-Assistent für Hausreparaturen (Sanitär, Heizung, Klima, Elektro).
Der User zeigt dir per Live-Kamera ein Problem und spricht mit dir.
Antworte SEHR knapp (max. 2 kurze Sätze), klar, in Du-Form, wie ein freundlicher Profi am Telefon.
Wenn etwas gefährlich ist (Strom, Gas, Wasser unter Druck), warne sofort und rate zum Profi.
Stelle bei Bedarf eine Rückfrage. Keine Aufzählungen, kein Markdown.`;

  const imageDataUrl = opts.imageBase64
    ? opts.imageBase64.startsWith("data:")
      ? opts.imageBase64
      : `data:image/jpeg;base64,${opts.imageBase64}`
    : null;

  const userContent: any[] = [{ type: "text", text: opts.userText }];
  if (imageDataUrl) {
    userContent.push({ type: "image_url", image_url: { url: imageDataUrl } });
  }

  const body = {
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: systemPrompt },
      ...opts.history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userContent },
    ],
  };

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI gateway ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data: any = await res.json();
  const reply: string = data?.choices?.[0]?.message?.content ?? "";
  return { reply };
}
