import type { WorkspaceSettingsAdminSummaryResponse } from '@ai-war-room/schemas'

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
    <div className="billing-admin workspace-settings-admin">
      <div className="billing-admin__header">
        <span>Workspace settings admin</span>
        <strong>{summary.role}</strong>
      </div>
      <p>{summary.guidance}</p>
      <div className="billing-admin__stats">
        <article className="billing-admin-stat">
          <span>Workspace name</span>
          <strong>{summary.settings.name}</strong>
          <small>{summary.settings.workspaceId}</small>
        </article>
        <article className="billing-admin-stat">
          <span>Created</span>
          <strong>{summary.settings.createdAt.slice(0, 10)}</strong>
          <small>UTC timestamp</small>
        </article>
      </div>
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
      {summary.availableActions.includes('reset_workspace_name') ? (
        <button
          className="secondary-button"
          type="button"
          disabled={settingsAdminAction !== 'idle'}
          onClick={onResetWorkspaceName}
        >
          Reset workspace name
        </button>
      ) : null}
    </div>
  )
}
