import type {
  WorkspaceInviteRecord,
  WorkspaceMemberAdminSummaryResponse,
} from '@ai-war-room/schemas'
import { formatWorkspaceRole } from './admin.js'
import { AdminExportActions } from './AdminExportActions.js'
import { BillingAdminPanel } from './BillingAdminPanel.js'

type MemberRole = 'owner' | 'admin' | 'member' | 'viewer'
type InviteRole = 'admin' | 'member' | 'viewer'

export type WorkspaceMemberFormState = {
  userId: string
  role: MemberRole
  email: string
}

export type WorkspaceInviteFormState = {
  email: string
  role: InviteRole
  expiresInHours: number
}

export type WorkspaceMemberAdminPanelProps = {
  summary: WorkspaceMemberAdminSummaryResponse
  newMemberForm: WorkspaceMemberFormState
  memberAdminAction: 'idle' | 'running'
  billingAction: 'idle' | 'loading' | 'upgrading' | 'portal' | 'canceling'
  inviteForm: WorkspaceInviteFormState
  inviteAction: 'idle' | 'running'
  invites: WorkspaceInviteRecord[]
  latestInviteUrl: string | null
  inviteUrlsById: Record<string, string>
  canLeaveWorkspace: boolean
  onNewMemberFormChange: (value: WorkspaceMemberFormState) => void
  onInviteFormChange: (value: WorkspaceInviteFormState) => void
  onCreateInvite: () => void
  onRevokeInvite: (inviteId: string) => void
  onResendInvite: (inviteId: string) => void
  onCopyInviteLink: (inviteUrl?: string) => void
  onLeaveWorkspace: () => void
  onMemberAdminAction: (input: {
    action: 'update_member_role' | 'remove_member' | 'add_member'
    userId: string
    role?: MemberRole
    email?: string
  }) => void
  onExportAudit: (format: 'csv' | 'json') => void
}

export function WorkspaceMemberAdminPanel({
  summary,
  newMemberForm,
  memberAdminAction,
  billingAction,
  inviteForm,
  inviteAction,
  invites,
  latestInviteUrl,
  inviteUrlsById,
  canLeaveWorkspace,
  onNewMemberFormChange,
  onInviteFormChange,
  onCreateInvite,
  onRevokeInvite,
  onResendInvite,
  onCopyInviteLink,
  onLeaveWorkspace,
  onMemberAdminAction,
  onExportAudit,
}: WorkspaceMemberAdminPanelProps) {
  const canInvite = summary.role === 'owner' || summary.role === 'admin'

  return (
    <BillingAdminPanel
      title="Member admin tools"
      panelClassName="workspace-member-admin"
      role={summary.role}
      guidance={summary.guidance}
      stats={[
        {
          label: 'Members',
          value: summary.stats.memberCount,
          detail: `${summary.stats.ownerCount} owners`,
        },
        {
          label: 'Admins',
          value: summary.stats.adminCount,
          detail: 'Role-managed access',
        },
      ]}
    >
      {canLeaveWorkspace ? (
        <div className="workspace-member-card__actions">
          <button
            type="button"
            className="danger-button"
            data-testid="leave-workspace"
            disabled={memberAdminAction !== 'idle'}
            onClick={onLeaveWorkspace}
          >
            Leave workspace
          </button>
        </div>
      ) : null}
      <div className="workspace-member-list">
        {summary.members.map((member) => (
          <article className="workspace-member-card" key={member.userId}>
            <div>
              <strong>{member.userId}</strong>
              <p>{formatWorkspaceRole(member.role)}</p>
              {member.email ? <small>{member.email}</small> : null}
            </div>
            <div className="workspace-member-card__actions">
              {summary.availableActions.includes('update_member_role') &&
              member.role !== 'owner' ? (
                <button
                  className="secondary-button"
                  type="button"
                  disabled={memberAdminAction !== 'idle'}
                  onClick={() =>
                    onMemberAdminAction({
                      action: 'update_member_role',
                      userId: member.userId,
                      role: 'admin',
                    })
                  }
                >
                  Make admin
                </button>
              ) : null}
              {summary.availableActions.includes('remove_member') ? (
                <button
                  className="danger-button"
                  type="button"
                  disabled={memberAdminAction !== 'idle'}
                  onClick={() =>
                    onMemberAdminAction({
                      action: 'remove_member',
                      userId: member.userId,
                    })
                  }
                >
                  Remove
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      {canInvite ? (
        <form
          className="workspace-member-form"
          onSubmit={(event) => {
            event.preventDefault()
            if (!inviteForm.email.trim()) {
              return
            }
            onCreateInvite()
          }}
        >
          <p className="runtime-note">
            Invite by email returns a shareable join link. No email is sent by
            the API.
          </p>
          <label>
            Invite email
            <input
              type="email"
              value={inviteForm.email}
              onChange={(event) =>
                onInviteFormChange({
                  ...inviteForm,
                  email: event.target.value,
                })
              }
            />
          </label>
          <label>
            Invite role
            <select
              value={inviteForm.role}
              onChange={(event) =>
                onInviteFormChange({
                  ...inviteForm,
                  role: event.target.value as InviteRole,
                })
              }
            >
              <option value="viewer">Viewer</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>
            Expires in hours
            <input
              type="number"
              min={1}
              max={720}
              value={inviteForm.expiresInHours}
              onChange={(event) =>
                onInviteFormChange({
                  ...inviteForm,
                  expiresInHours: Number(event.target.value) || 168,
                })
              }
            />
          </label>
          <button
            type="submit"
            disabled={inviteAction !== 'idle' || !inviteForm.email.trim()}
          >
            {inviteAction === 'running' ? 'Creating invite…' : 'Create invite link'}
          </button>
          {latestInviteUrl ? (
            <div className="workspace-member-card__actions">
              <p className="runtime-note">
                Latest invite URL: <code>{latestInviteUrl}</code>
              </p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => onCopyInviteLink(latestInviteUrl)}
              >
                Copy invite link
              </button>
            </div>
          ) : null}
          {invites.length > 0 ? (
            <div className="workspace-member-list">
              {invites.map((invite) => {
                const inviteUrl = inviteUrlsById[invite.inviteId]
                return (
                <article className="workspace-member-card" key={invite.inviteId}>
                  <div>
                    <strong>{invite.email}</strong>
                    <p>
                      {formatWorkspaceRole(invite.role)} · {invite.status}
                    </p>
                    <p className="runtime-note">
                      Expires {new Date(invite.expiresAt).toLocaleString()}
                    </p>
                  </div>
                  {invite.status === 'pending' || invite.status === 'expired' ? (
                    <div className="workspace-member-card__actions">
                      {inviteUrl ? (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => onCopyInviteLink(inviteUrl)}
                        >
                          Copy link
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={inviteAction !== 'idle'}
                        onClick={() => onResendInvite(invite.inviteId)}
                      >
                        Resend link
                      </button>
                      {invite.status === 'pending' ? (
                        <button
                          type="button"
                          className="danger-button"
                          disabled={inviteAction !== 'idle'}
                          onClick={() => onRevokeInvite(invite.inviteId)}
                        >
                          Revoke
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </article>
                )
              })}
            </div>
          ) : null}
        </form>
      ) : null}
      {summary.availableActions.includes('add_member') ? (
        <form
          className="workspace-member-form"
          onSubmit={(event) => {
            event.preventDefault()
            if (!newMemberForm.userId.trim()) {
              return
            }
            onMemberAdminAction({
              action: 'add_member',
              userId: newMemberForm.userId.trim(),
              role: newMemberForm.role,
              email: newMemberForm.email.trim() || undefined,
            })
          }}
        >
          <label>
            User id
            <input
              value={newMemberForm.userId}
              onChange={(event) =>
                onNewMemberFormChange({
                  ...newMemberForm,
                  userId: event.target.value,
                })
              }
            />
          </label>
          <label>
            Role
            <select
              value={newMemberForm.role}
              onChange={(event) =>
                onNewMemberFormChange({
                  ...newMemberForm,
                  role: event.target.value as MemberRole,
                })
              }
            >
              <option value="viewer">Viewer</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </label>
          <label>
            Email
            <input
              value={newMemberForm.email}
              onChange={(event) =>
                onNewMemberFormChange({
                  ...newMemberForm,
                  email: event.target.value,
                })
              }
            />
          </label>
          <button
            type="submit"
            disabled={memberAdminAction !== 'idle' || !newMemberForm.userId.trim()}
          >
            Add test member
          </button>
        </form>
      ) : null}
      <AdminExportActions
        title="Workspace audit export"
        actions={[
          {
            label: 'Export audit CSV',
            disabled: billingAction !== 'idle' || memberAdminAction !== 'idle',
            onClick: () => onExportAudit('csv'),
          },
          {
            label: 'Export audit JSON',
            disabled: billingAction !== 'idle' || memberAdminAction !== 'idle',
            onClick: () => onExportAudit('json'),
          },
        ]}
      />
    </BillingAdminPanel>
  )
}
