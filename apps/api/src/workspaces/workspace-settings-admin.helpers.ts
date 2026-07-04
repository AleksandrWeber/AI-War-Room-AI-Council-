import type { WorkspaceSettingsAdminAction } from '@ai-war-room/schemas'

export function resolveWorkspaceSettingsAdminActions(input: {
  nodeEnv: 'development' | 'test' | 'production'
}) {
  const actions: WorkspaceSettingsAdminAction[] = ['update_workspace_name']

  if (input.nodeEnv !== 'production') {
    actions.push('reset_workspace_name')
  }

  return actions
}

export function getWorkspaceSettingsAdminGuidance(input: {
  availableActions: readonly WorkspaceSettingsAdminAction[]
}) {
  if (input.availableActions.includes('reset_workspace_name')) {
    return 'Workspace owners and admins can review workspace settings, rename the workspace, and reset the local workspace name for testing.'
  }

  return 'Workspace owners and admins can review and update workspace settings.'
}

export function getDefaultWorkspaceName(workspaceId: string) {
  return `Workspace ${workspaceId}`
}
