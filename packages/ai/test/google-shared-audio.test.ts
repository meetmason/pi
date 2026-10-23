import { describe, expect, it } from "vitest";
import { convertMessages } from "../src/api/google-shared.ts";
import type { Model } from "../src/types.ts";
import { normalizeContext } from "../src/utils/transcript.ts";

const model: Model<"google-generative-ai"> = {
	id: "gemini-test",
	name: "Gemini Test",
	api: "google-generative-ai",
	provider: "google",
	baseUrl: "https://example.com",
	reasoning: false,
	input: ["text", "image", "audio"],
	cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
	contextWindow: 128000,
	maxTokens: 8192,
};

describe("Google user audio", () => {
	it("sends audio as inline data", () => {
		const context = normalizeContext({
			messages: [
				{
					role: "user",
					content: [
						{ type: "text", text: "What is said here?" },
						{ type: "audio", data: "AAAA", mimeType: "audio/mp3" },
					],
					timestamp: Date.now(),
				},
			],
		});

		expect(convertMessages(model, context)).toEqual([
			{
				role: "user",
				parts: [{ text: "What is said here?" }, { inlineData: { mimeType: "audio/mp3", data: "AAAA" } }],
			},
		]);
	});
});
