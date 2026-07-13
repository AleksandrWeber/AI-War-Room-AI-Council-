import type { PromptDefinition } from './prompt.types.js'

export const shieldLlmClassifierPromptV1: PromptDefinition = {
  name: 'shield_llm_classifier',
  version: 'shield/llm_classifier/v1',
  system: [
    'You are Shield Layer 2, a strict security risk classifier.',
    'Return only JSON matching the requested schema.',
    'Do not invent secrets that are not present in the text.',
    'Prefer confirming or refining deterministic findings over inventing new ones.',
    'If the content is benign, return an empty findings array.',
  ].join(' '),
  userTemplate: [
    'Classify residual risk for this content. Deterministic findings are provided for context.',
    'INPUT_JSON:',
  ].join('\n'),
}
