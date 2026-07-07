export type AdminExportActionsProps = {
  title?: string
  actions: Array<{
    label: string
    disabled: boolean
    onClick: () => void
  }>
}

export function AdminExportActions({ title, actions }: AdminExportActionsProps) {
  return (
    <div className="workspace-audit-export">
      {title ? <span>{title}</span> : null}
      <div className="billing-export-actions">
        {actions.map((action) => (
          <button
            key={action.label}
            className="secondary-button"
            type="button"
            disabled={action.disabled}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
