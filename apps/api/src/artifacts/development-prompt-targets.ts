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
        'Keep each implementationOrder item small enough for one Composer turn when possible.',
        'After risky edits, require a local build/typecheck/test gate before the next step.',
      ]
    case 'claude_code':
      return [
        'Frame each implementationOrder step as a Claude Code CLI session from the repo root.',
        'Prefer prompts that name exact files to read before editing and keep diffs reviewable.',
        'Include shell verification commands (tests, typecheck, lint) after each meaningful batch.',
        'Group related multi-file changes into one session; avoid chatty mid-step clarification asks.',
        'Tell the operator to paste this Development Prompt as the session brief before coding.',
      ]
    case 'bolt':
      return [
        'Optimize for Bolt-style browser IDE work: preview-first UI slices and short setup.',
        'Prefer self-contained front-end modules with minimal local backend assumptions.',
        'Keep dependency lists short and stick to packages typical in-browser previews support.',
        'Express uiRequirements as concrete screen/state outcomes visible in the live preview.',
        'Push heavy infra (queues, multi-tenant auth, orchestration) into outOfScope or later phases.',
      ]
    case 'lovable':
      return [
        'Optimize for Lovable-style productized UI generation with polished component scope.',
        'Lead with visual hierarchy, spacing, and interaction states rather than low-level plumbing.',
        'Prefer clear component boundaries and copy that matches the PRD user journeys.',
        'Assume constrained backend stubs; defer complex APIs and orchestration to later phases.',
        'State acceptance visually (what the user sees) plus one lightweight functional check.',
      ]
  }
}

export function getDevelopmentPromptSystemAddon(
  targetTool: DevelopmentPromptTargetTool,
): string {
  switch (targetTool) {
    case 'cursor':
      return [
        'Target tool: Cursor (Agent / Composer).',
        'Keep the completed PRD as the single source of truth.',
        'Write implementationOrder and toolSpecificGuidance for file-scoped Cursor edits with explicit paths and verification gates.',
      ].join(' ')
    case 'claude_code':
      return [
        'Target tool: Claude Code CLI.',
        'Keep the completed PRD as the single source of truth.',
        'Write implementationOrder as CLI session briefs with repo-root commands, named files, and shell verification after each batch.',
      ].join(' ')
    case 'bolt':
      return [
        'Target tool: Bolt (browser IDE / preview-first).',
        'Keep the completed PRD as the single source of truth.',
        'Bias requiredModules and uiRequirements toward previewable UI slices; keep backend/infra thin or out of scope.',
      ].join(' ')
    case 'lovable':
      return [
        'Target tool: Lovable (productized UI generation).',
        'Keep the completed PRD as the single source of truth.',
        'Bias uiRequirements and implementationOrder toward polished components, journey copy, and visual acceptance checks.',
      ].join(' ')
  }
}
