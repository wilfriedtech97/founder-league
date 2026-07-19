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
    // Remove code blocks entirely (they don't read well)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    // Strip markdown heading markers
    .replace(/^#{1,6}\s+/gm, '')
    // Strip bold/italic markers, keep the text inside
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove list bullet markers and numbered list markers
    .replace(/^[\s]*[-•*]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove blockquote markers
    .replace(/^>\s+/gm, '')
    // Convert markdown links to just the link text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove horizontal rules
    .replace(/^---+$/gm, ' ')
    // Remove table rows and pipes
    .replace(/^\|.+\|$/gm, ' ')
    .replace(/\|/g, ' ')
    // Expand common symbols to spoken words for natural reading
    .replace(/&/g, ' and ')
    .replace(/%/g, ' percent')
    .replace(/\$/g, ' ')
    .replace(/@/g, ' at ')
    .replace(/→/g, ' to ')
    .replace(/✅/g, ' approved ')
    .replace(/❌/g, ' not recommended ')
    .replace(/⚠️/g, ' warning ')
    .replace(/[🔥⭐🚀💡⚡]/g, ' ')
    .replace(/\+/g, ' plus ')
    .replace(/=/g, ' equals ')
    .replace(/\//g, ' ')
    // Replace colons and semicolons at line ends with periods for natural sentence breaks
    .replace(/:\s*\n/g, '. ')
    .replace(/;\s*/g, ', ')
    // Turn newlines into natural sentence spacing
    .replace(/([.!?])\s*\n/g, '$1 ')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    // Collapse multiple spaces into a single space — prevents word-by-word robotic reading
    .replace(/[ \t]{2,}/g, ' ')
    // Attach punctuation to preceding word (no space before commas, periods, etc.)
    .replace(/\s+([.,!?;:])/g, '$1')
    // Ensure a single space after punctuation
    .replace(/([.,!?;:])(?=[A-Za-z])/g, '$1 ')
    // Remove any remaining isolated punctuation clusters
    .replace(/\s{2,}/g, ' ')
    .replace(/\(\s*\)/g, ' ')
    .replace(/\[\s*\]/g, ' ')
    .replace(/\{\s*\}/g, ' ')
    .replace(/[{}[\]()]/g, ' ')
    .trim();
}