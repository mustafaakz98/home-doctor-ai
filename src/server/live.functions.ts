import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { liveAssistAsk } from "./live.server";

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
    return liveAssistAsk({
      history: data.history,
      userText: data.userText,
      imageBase64: data.imageBase64,
    });
  });
