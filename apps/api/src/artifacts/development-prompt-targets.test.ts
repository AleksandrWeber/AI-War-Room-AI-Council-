import { describe, expect, it } from 'vitest'
import {
  getDevelopmentPromptSystemAddon,
  getDevelopmentPromptToolGuidance,
} from './development-prompt-targets.js'

describe('development prompt target tools', () => {
  it('returns Cursor-first guidance for the MVP default', () => {
    expect(getDevelopmentPromptToolGuidance('cursor')[0]).toMatch(/Cursor/)
    expect(getDevelopmentPromptSystemAddon('cursor')).toMatch(/Cursor/)
  })

  it('returns concrete adapter guidance for Claude Code, Bolt, and Lovable', () => {
    const claude = getDevelopmentPromptToolGuidance('claude_code').join(' ')
    const bolt = getDevelopmentPromptToolGuidance('bolt').join(' ')
    const lovable = getDevelopmentPromptToolGuidance('lovable').join(' ')

    expect(claude).toMatch(/Claude Code CLI/)
    expect(claude).not.toMatch(/scaffolding/i)
    expect(getDevelopmentPromptSystemAddon('claude_code')).toMatch(/CLI session/)

    expect(bolt).toMatch(/preview/i)
    expect(bolt).not.toMatch(/scaffolding/i)
    expect(getDevelopmentPromptSystemAddon('bolt')).toMatch(/previewable/)

    expect(lovable).toMatch(/visual/i)
    expect(lovable).not.toMatch(/scaffolding/i)
    expect(getDevelopmentPromptSystemAddon('lovable')).toMatch(/polished/)
  })
})
