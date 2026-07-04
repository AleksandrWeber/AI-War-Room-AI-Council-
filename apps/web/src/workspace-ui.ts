import {
  workspaceMemberAdminActionResponseSchema,
  workspaceMemberAdminSummaryResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchWorkspaceMemberAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/workspaces/${encodeURIComponent(workspaceId)}/admin/members`,
    {
      headers,
    },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return workspaceMemberAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeWorkspaceMemberAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: {
    action: 'update_member_role' | 'remove_member' | 'add_member'
    userId: string
    role?: 'owner' | 'admin' | 'member' | 'viewer'
    email?: string
    displayName?: string
  },
) {
  const response = await fetch(
    `${apiBaseUrl}/workspaces/${encodeURIComponent(workspaceId)}/admin/members/actions`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceId,
        ...input,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return workspaceMemberAdminActionResponseSchema.parse(await response.json())
}

export function formatWorkspaceRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}
