export type AdminRefreshButtonProps = {
  visible: boolean
  disabled: boolean
  label: string
  onClick: () => void
}

export function AdminRefreshButton({
  visible,
  disabled,
  label,
  onClick,
}: AdminRefreshButtonProps) {
  if (!visible) {
    return null
  }

  return (
    <button
      className="secondary-button"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
