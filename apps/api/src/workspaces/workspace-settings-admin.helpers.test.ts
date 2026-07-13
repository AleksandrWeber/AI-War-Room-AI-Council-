import { describe, expect, it } from 'vitest'
import {
  getDefaultWorkspaceName,
  resolveWorkspaceSettingsAdminActions,
} from './workspace-settings-admin.helpers.js'

describe('resolveWorkspaceSettingsAdminActions', () => {
  it('includes reset action outside production', () => {
    expect(
      resolveWorkspaceSettingsAdminActions({ nodeEnv: 'development' }),
    ).toEqual([
      'update_workspace_name',
      'update_shield_display_sensitivity',
      'reset_workspace_name',
    ])
  })

  it('hides reset action in production', () => {
    expect(
      resolveWorkspaceSettingsAdminActions({ nodeEnv: 'production' }),
    ).toEqual([
      'update_workspace_name',
      'update_shield_display_sensitivity',
    ])
  })
})

describe('getDefaultWorkspaceName', () => {
  it('builds a default workspace label from the id', () => {
    expect(getDefaultWorkspaceName('workspace_1')).toBe('Workspace workspace_1')
  })
})
