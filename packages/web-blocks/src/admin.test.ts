import { describe, expect, it } from 'vitest'
import { formatWorkspaceRole } from './admin.js'

describe('admin shared block', () => {
  it('formats workspace roles', () => {
    expect(formatWorkspaceRole('admin')).toBe('Admin')
    expect(formatWorkspaceRole('viewer')).toBe('Viewer')
  })
})
