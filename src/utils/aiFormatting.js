export const AI_FORMATTING_DIRECTIVE = `

FORMATTING REQUIREMENTS — MANDATORY:
- ALWAYS structure responses with markdown: use ## headings for sections, **bold** for key terms, and bullet (-) or numbered (1.) lists for details
- NEVER write long monolithic text blocks — break every response into scannable, well-organized sections
- Start with a brief 1-2 sentence summary, then list details below
- Use bullet lists (-) for metrics, features, or parallel items
- Use numbered lists (1. 2. 3.) for steps, rankings, or sequential reasoning
- Format all data points as: **Label:** value (e.g., **Users:** 12,000)
- Bold ALL key metrics, names, percentages, and important terms
- When referencing data from the internet or web search, format it into clean bullet lists with bold labels
- Write in a natural, confident, human tone — never robotic, never templated
- Each list item must be complete and meaningful (no fragments)
- Keep paragraphs short (2-3 sentences), then use lists for specifics`;

export function cleanMarkdownForTTS(text) {
  if (!text) return '';
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^[\s]*[-•*]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    .replace(/```[\s\S]*?```/g, ' code block ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^---+$/gm, '')
    .replace(/\|/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}