import type { DevelopmentPromptTargetTool } from '@ai-war-room/schemas'

export const developmentPromptTargetToolLabels: Record<
  DevelopmentPromptTargetTool,
  string
> = {
  cursor: 'Cursor',
  claude_code: 'Claude Code',
  bolt: 'Bolt',
  lovable: 'Lovable',
}

export function getDevelopmentPromptToolGuidance(
  targetTool: DevelopmentPromptTargetTool,
): string[] {
  switch (targetTool) {
    case 'cursor':
      return [
        'Optimize steps for Cursor Agent / Composer with small file-scoped edits.',
        'Prefer explicit file paths, acceptance checks, and iterative verification loops.',
        'Call out when the implementer should open related files as context before editing.',
      ]
    case 'claude_code':
      return [
        'Structure work as Claude Code CLI sessions with clear repo-root commands.',
        'Prefer shell-friendly verification steps and concise multi-file change plans.',
        'Adapter notes are scaffolding; deepen Claude Code-specific prompts in a follow-up.',
      ]
    case 'bolt':
      return [
        'Bias toward rapid UI scaffolding and previewable web app slices.',
        'Keep setup steps short and highlight in-browser iteration constraints.',
        'Adapter notes are scaffolding; deepen Bolt-specific prompts in a follow-up.',
      ]
    case 'lovable':
      return [
        'Bias toward productized UI generation and polish-friendly component scope.',
        'Emphasize visual outcomes and constrained backend assumptions.',
        'Adapter notes are scaffolding; deepen Lovable-specific prompts in a follow-up.',
      ]
  }
}

export function getDevelopmentPromptSystemAddon(
  targetTool: DevelopmentPromptTargetTool,
): string {
  const label = developmentPromptTargetToolLabels[targetTool]
  return `Target tool for this Development Prompt is ${label}. Keep the PRD as the single source of truth and tailor implementation instructions to ${label} workflows.`
}
