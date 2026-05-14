// The Gemini adapter reads GEMINI_API_KEY when its route module first loads.
// Google AI Studio often documents GOOGLE_GENERATIVE_AI_API_KEY — mirror it here so one env var works.
if (!process.env.GEMINI_API_KEY && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  process.env.GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY
}
