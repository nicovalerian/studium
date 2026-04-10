const FLASHCARD_GENERATION_PROMPT = `Based on the following study material, generate exactly 10 flashcards to help a student learn the key concepts.

STUDY MATERIAL:
{content}

OUTPUT FORMAT:
Return a JSON array of flashcards. Each flashcard should have:
- "front": A clear question or prompt (max 100 characters)
- "back": A concise answer (max 300 characters)

Focus on:
- Key definitions and concepts
- Important formulas or procedures
- Common exam-style questions
- Relationships between concepts

IMPORTANT: Return ONLY the JSON array, no markdown code blocks or other text.`;

const FLASHCARD_RETRY_SUFFIX =
  '\n\nCRITICAL: Return ONLY a valid JSON array with no additional text.';

export function buildFlashcardPrompt(content: string, isRetry: boolean = false): string {
  const prompt = FLASHCARD_GENERATION_PROMPT.replace('{content}', content);
  return isRetry ? prompt + FLASHCARD_RETRY_SUFFIX : prompt;
}
