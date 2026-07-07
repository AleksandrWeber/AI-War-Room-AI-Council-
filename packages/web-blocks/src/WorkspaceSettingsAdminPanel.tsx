import type { WorkspaceSettingsAdminSummaryResponse } from '@ai-war-room/schemas'
import { BillingAdminPanel } from './BillingAdminPanel.js'
import { AdminRefreshButton } from './AdminRefreshButton.js'

export type WorkspaceSettingsAdminPanelProps = {
  summary: WorkspaceSettingsAdminSummaryResponse
  workspaceNameDraft: string
  settingsAdminAction: 'idle' | 'running'
  onWorkspaceNameDraftChange: (value: string) => void
  onUpdateWorkspaceName: (name: string) => void
  onResetWorkspaceName: () => void
}

export function WorkspaceSettingsAdminPanel({
  summary,
  workspaceNameDraft,
  settingsAdminAction,
  onWorkspaceNameDraftChange,
  onUpdateWorkspaceName,
  onResetWorkspaceName,
}: WorkspaceSettingsAdminPanelProps) {
  return (
    <BillingAdminPanel
      title="Workspace settings admin"
      panelClassName="workspace-settings-admin"
      role={summary.role}
      guidance={summary.guidance}
      stats={[
        {
          label: 'Workspace name',
          value: summary.settings.name,
          detail: summary.settings.workspaceId,
        },
        {
          label: 'Created',
          value: summary.settings.createdAt.slice(0, 10),
          detail: 'UTC timestamp',
        },
      ]}
    >
      {summary.availableActions.includes('update_workspace_name') ? (
        <form
          className="workspace-settings-form"
          onSubmit={(event) => {
            event.preventDefault()
            if (!workspaceNameDraft.trim()) {
              return
            }
            onUpdateWorkspaceName(workspaceNameDraft.trim())
          }}
        >
          <label>
            Workspace name
            <input
              value={workspaceNameDraft}
              onChange={(event) => onWorkspaceNameDraftChange(event.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={
              settingsAdminAction !== 'idle' ||
              !workspaceNameDraft.trim() ||
              workspaceNameDraft.trim() === summary.settings.name
            }
          >
            Save workspace name
          </button>
        </form>
      ) : null}
      <AdminRefreshButton
        visible={summary.availableActions.includes('reset_workspace_name')}
        disabled={settingsAdminAction !== 'idle'}
        label="Reset workspace name"
        onClick={onResetWorkspaceName}
      />
    </BillingAdminPanel>
  )
}
