import OpenAI from "openai";

// Lazy initialization to avoid build-time errors
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing OPENAI_API_KEY environment variable. Please set it in your .env file."
      );
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// For backward compatibility
export const openai = {
  get chat() {
    return getOpenAIClient().chat;
  },
};

// Default model for CV grading
export const DEFAULT_MODEL = "gpt-4-turbo-preview";

// Token limits
export const MAX_TOKENS = 2000;
