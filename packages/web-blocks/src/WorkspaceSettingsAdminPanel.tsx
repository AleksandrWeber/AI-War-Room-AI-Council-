import type {
  ShieldDisplaySensitivity,
  WorkspaceSettingsAdminSummaryResponse,
} from '@ai-war-room/schemas'
import { BillingAdminPanel } from './BillingAdminPanel.js'
import { AdminRefreshButton } from './AdminRefreshButton.js'

export type WorkspaceSettingsAdminPanelProps = {
  summary: WorkspaceSettingsAdminSummaryResponse
  workspaceNameDraft: string
  settingsAdminAction: 'idle' | 'running'
  onWorkspaceNameDraftChange: (value: string) => void
  onUpdateWorkspaceName: (name: string) => void
  onResetWorkspaceName: () => void
  onUpdateShieldDisplaySensitivity: (
    sensitivity: ShieldDisplaySensitivity,
  ) => void
}

export function WorkspaceSettingsAdminPanel({
  summary,
  workspaceNameDraft,
  settingsAdminAction,
  onWorkspaceNameDraftChange,
  onUpdateWorkspaceName,
  onResetWorkspaceName,
  onUpdateShieldDisplaySensitivity,
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
          label: 'Shield display',
          value: summary.settings.shieldDisplaySensitivity,
          detail: 'Human Review finding filter',
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
      {summary.availableActions.includes('update_shield_display_sensitivity') ? (
        <label>
          Shield display sensitivity
          <select
            value={summary.settings.shieldDisplaySensitivity}
            disabled={settingsAdminAction !== 'idle'}
            onChange={(event) =>
              onUpdateShieldDisplaySensitivity(
                event.target.value as ShieldDisplaySensitivity,
              )
            }
          >
            <option value="high_only">High and critical only</option>
            <option value="medium_and_up">Medium and above (default)</option>
            <option value="all">Show all findings</option>
          </select>
        </label>
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
