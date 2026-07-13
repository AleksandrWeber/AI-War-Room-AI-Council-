import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  applyZodTooBigTruncation,
  truncateText,
} from './llm.utils.js'

describe('llm.utils truncation helpers', () => {
  it('truncates long strings with an ellipsis', () => {
    expect(truncateText('abcdefghij', 5)).toBe('abcd…')
    expect(truncateText('short', 20)).toBe('short')
  })

  it('soft-fixes Zod too_big string issues', () => {
    const schema = z.object({
      summary: z.string().max(10),
      risks: z.array(z.string().max(5)).max(2),
    })
    const value = {
      summary: 'x'.repeat(40),
      risks: ['toolongvalue', 'ok'],
    }
    const first = schema.safeParse(value)
    expect(first.success).toBe(false)

    const truncated = applyZodTooBigTruncation(value, first.error!.issues)
    expect(truncated).not.toBeNull()

    const second = schema.safeParse(truncated)
    expect(second.success).toBe(true)
    if (second.success) {
      expect(second.data.summary.length).toBe(10)
      expect(second.data.risks[0]?.length).toBe(5)
    }
  })
})
