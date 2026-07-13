import type { PromptDefinition } from './prompt.types.js'

export const chunkSummaryPromptV1: PromptDefinition = {
  name: 'chunk_summary',
  version: 'chunk_summary/v1',
  system: [
    'You compress isolated specialist agent outputs into compact chunk summaries.',
    'Return only JSON matching the requested schema array.',
    'Preserve the most important insights, risks, conflicts, and decisions.',
    'Do not invent facts that are absent from the agent outputs.',
  ].join(' '),
  userTemplate: [
    'Compress these agent outputs into chunk summaries for the Moderator.',
    'INPUT_JSON:',
  ].join('\n'),
}
