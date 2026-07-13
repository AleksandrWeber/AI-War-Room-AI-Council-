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

  it('returns scaffolding guidance for future adapters', () => {
    expect(getDevelopmentPromptToolGuidance('claude_code').join(' ')).toMatch(
      /scaffolding/i,
    )
    expect(getDevelopmentPromptToolGuidance('bolt').join(' ')).toMatch(/Bolt/)
    expect(getDevelopmentPromptToolGuidance('lovable').join(' ')).toMatch(
      /Lovable/,
    )
  })
})
