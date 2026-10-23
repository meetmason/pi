import { describe, expect, it } from "vitest";
import { transformMessages } from "../src/api/transform-messages.ts";
import type { Message, Model, ModelInputModality, UserMessage } from "../src/types.ts";

function makeModel(input: ModelInputModality[]): Model<"google-generative-ai"> {
	return {
		id: "gemini-test",
		name: "Gemini Test",
		api: "google-generative-ai",
		provider: "google",
		baseUrl: "https://example.com",
		reasoning: false,
		input,
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 128000,
		maxTokens: 8192,
	};
}

const user: UserMessage = {
	role: "user",
	content: [
		{ type: "text", text: "What is said here?" },
		{ type: "audio", data: "AAAA", mimeType: "audio/mp3" },
		{ type: "audio", data: "BBBB", mimeType: "audio/wav" },
		{ type: "image", data: "CCCC", mimeType: "image/png" },
	],
	timestamp: Date.now(),
};

function contentOf(messages: Message[]): UserMessage["content"] {
	const [message] = messages;
	if (message?.role !== "user") throw new Error("Expected a user message");
	return message.content;
}

describe("transformMessages with audio", () => {
	it("keeps audio for models with audio input", () => {
		expect(contentOf(transformMessages([user], makeModel(["text", "image", "audio"])))).toEqual(user.content);
	});

	it("replaces each run of audio with one placeholder for models without audio input", () => {
		expect(contentOf(transformMessages([user], makeModel(["text", "image"])))).toEqual([
			{ type: "text", text: "What is said here?" },
			{ type: "text", text: "(audio omitted: model does not support audio)" },
			{ type: "image", data: "CCCC", mimeType: "image/png" },
		]);
	});

	it("replaces images and audio independently", () => {
		expect(contentOf(transformMessages([user], makeModel(["text", "audio"])))).toEqual([
			{ type: "text", text: "What is said here?" },
			{ type: "audio", data: "AAAA", mimeType: "audio/mp3" },
			{ type: "audio", data: "BBBB", mimeType: "audio/wav" },
			{ type: "text", text: "(image omitted: model does not support images)" },
		]);
	});
});
