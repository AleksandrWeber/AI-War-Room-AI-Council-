import type {
  WorkspaceMemberAdminRecord,
  WorkspaceMemberAdminStats,
  WorkspaceRole,
} from '@ai-war-room/schemas'

export function buildWorkspaceMemberAdminStats(
  members: WorkspaceMemberAdminRecord[],
): WorkspaceMemberAdminStats {
  return {
    memberCount: members.length,
    ownerCount: members.filter((member) => member.role === 'owner').length,
    adminCount: members.filter((member) => member.role === 'admin').length,
  }
}

export function resolveWorkspaceMemberAdminActions(input: {
  nodeEnv: 'development' | 'test' | 'production'
}) {
  const actions = ['update_member_role', 'remove_member'] as const

  if (input.nodeEnv !== 'production') {
    return [...actions, 'add_member'] as const
  }

  return [...actions] as const
}

export function getWorkspaceMemberAdminGuidance(input: {
  availableActions: readonly ('update_member_role' | 'remove_member' | 'add_member')[]
}) {
  if (input.availableActions.includes('add_member')) {
    return 'Workspace owners and admins can review members, update roles, remove members, and add local test members.'
  }

  return 'Workspace owners and admins can review members, update roles, and remove members.'
}

export function assertOwnerCountSafe(input: {
  members: WorkspaceMemberAdminRecord[]
  targetUserId: string
  nextRole?: WorkspaceRole
}) {
  const ownerCount = input.members.filter((member) => member.role === 'owner').length
  const target = input.members.find((member) => member.userId === input.targetUserId)

  if (!target) {
    return
  }

  if (target.role !== 'owner') {
    return
  }

  if (input.nextRole && input.nextRole === 'owner') {
    return
  }

  if (ownerCount <= 1) {
    throw new Error('Workspace must keep at least one owner.')
  }
}
