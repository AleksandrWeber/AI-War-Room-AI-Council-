import type { WorkspaceMemberAdminSummaryResponse } from '@ai-war-room/schemas'
import { formatWorkspaceRole } from './admin.js'
import { AdminExportActions } from './AdminExportActions.js'
import { BillingAdminPanel } from './BillingAdminPanel.js'

type MemberRole = 'owner' | 'admin' | 'member' | 'viewer'

export type WorkspaceMemberFormState = {
  userId: string
  role: MemberRole
  email: string
}

export type WorkspaceMemberAdminPanelProps = {
  summary: WorkspaceMemberAdminSummaryResponse
  newMemberForm: WorkspaceMemberFormState
  memberAdminAction: 'idle' | 'running'
  billingAction: 'idle' | 'loading' | 'upgrading' | 'portal' | 'canceling'
  onNewMemberFormChange: (value: WorkspaceMemberFormState) => void
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
  onNewMemberFormChange,
  onMemberAdminAction,
  onExportAudit,
}: WorkspaceMemberAdminPanelProps) {
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
