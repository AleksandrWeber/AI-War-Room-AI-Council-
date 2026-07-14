/** Best-effort client IP for abuse limits (proxy-aware). */
export function extractClientIp(request: {
  ip?: string
  headers?: Record<string, string | string[] | undefined>
  socket?: { remoteAddress?: string }
  raw?: { socket?: { remoteAddress?: string } }
}): string {
  const forwarded = request.headers?.['x-forwarded-for']
  const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded
  const firstForwarded = forwardedValue?.split(',')[0]?.trim()

  if (firstForwarded) {
    return firstForwarded
  }

  if (typeof request.ip === 'string' && request.ip.trim()) {
    return request.ip.trim()
  }

  const remote =
    request.socket?.remoteAddress ?? request.raw?.socket?.remoteAddress

  if (typeof remote === 'string' && remote.trim()) {
    return remote.trim()
  }

  return 'unknown'
}
