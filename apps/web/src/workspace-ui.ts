import {
  acceptWorkspaceInviteResponseSchema,
  createWorkspaceInviteResponseSchema,
  listMyWorkspacesResponseSchema,
  listWorkspaceInvitesResponseSchema,
  resendWorkspaceInviteResponseSchema,
  revokeWorkspaceInviteResponseSchema,
  workspaceMemberAdminActionResponseSchema,
  workspaceMemberAdminSummaryResponseSchema,
  workspaceSettingsAdminActionResponseSchema,
  workspaceSettingsAdminSummaryResponseSchema,
} from '@ai-war-room/schemas'
import { formatWorkspaceRole } from '@ai-war-room/web-blocks'

export { formatWorkspaceRole }

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

export async function fetchWorkspaceSettingsAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/workspaces/${encodeURIComponent(workspaceId)}/admin/settings`,
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

  return workspaceSettingsAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeWorkspaceSettingsAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: {
    action:
      | 'update_workspace_name'
      | 'reset_workspace_name'
      | 'update_shield_display_sensitivity'
    name?: string
    shieldDisplaySensitivity?: 'high_only' | 'medium_and_up' | 'all'
  },
) {
  const response = await fetch(
    `${apiBaseUrl}/workspaces/${encodeURIComponent(workspaceId)}/admin/settings/actions`,
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

  return workspaceSettingsAdminActionResponseSchema.parse(await response.json())
}

function readContentDispositionFilename(contentDisposition: string | null) {
  if (!contentDisposition) {
    return null
  }

  const match = contentDisposition.match(/filename="([^"]+)"/)

  return match?.[1] ?? null
}

export async function downloadWorkspaceAuditExport(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  format: 'csv' | 'json',
) {
  const response = await fetch(
    `${apiBaseUrl}/workspaces/${encodeURIComponent(workspaceId)}/admin/audit/export?format=${format}`,
    {
      headers,
    },
  )

  if (response.status === 403) {
    throw new Error('Only workspace owners and admins can export audit data.')
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  const blob = await response.blob()
  const filename =
    readContentDispositionFilename(response.headers.get('content-disposition')) ??
    `${workspaceId}-audit.${format}`
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function createWorkspaceInvite(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: {
    email: string
    role?: 'admin' | 'member' | 'viewer'
    expiresInHours?: number
  },
) {
  const response = await fetch(
    `${apiBaseUrl}/workspaces/${encodeURIComponent(workspaceId)}/invites`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return createWorkspaceInviteResponseSchema.parse(await response.json())
}

export async function listMyWorkspaces(
  apiBaseUrl: string,
  headers: Record<string, string>,
) {
  const response = await fetch(`${apiBaseUrl}/workspaces/mine`, {
    headers,
  })

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return listMyWorkspacesResponseSchema.parse(await response.json())
}

export async function listWorkspaceInvites(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/workspaces/${encodeURIComponent(workspaceId)}/invites`,
    {
      headers,
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return listWorkspaceInvitesResponseSchema.parse(await response.json())
}

export async function acceptWorkspaceInvite(
  apiBaseUrl: string,
  headers: Record<string, string>,
  token: string,
) {
  const response = await fetch(`${apiBaseUrl}/workspaces/invites/accept`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    let detail = `API returned ${response.status}`
    try {
      const payload = (await response.json()) as {
        message?: string | { message?: string }
      }
      if (typeof payload.message === 'string' && payload.message.trim()) {
        detail = payload.message
      } else if (
        payload.message &&
        typeof payload.message === 'object' &&
        typeof payload.message.message === 'string'
      ) {
        detail = payload.message.message
      }
    } catch {
      // keep status fallback
    }
    throw new Error(detail)
  }

  return acceptWorkspaceInviteResponseSchema.parse(await response.json())
}

export async function revokeWorkspaceInvite(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  inviteId: string,
) {
  const response = await fetch(
    `${apiBaseUrl}/workspaces/${encodeURIComponent(workspaceId)}/invites/${encodeURIComponent(inviteId)}/revoke`,
    {
      method: 'POST',
      headers,
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return revokeWorkspaceInviteResponseSchema.parse(await response.json())
}

export async function resendWorkspaceInvite(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  inviteId: string,
  input?: { expiresInHours?: number },
) {
  const response = await fetch(
    `${apiBaseUrl}/workspaces/${encodeURIComponent(workspaceId)}/invites/${encodeURIComponent(inviteId)}/resend`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input ?? {}),
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return resendWorkspaceInviteResponseSchema.parse(await response.json())
}

