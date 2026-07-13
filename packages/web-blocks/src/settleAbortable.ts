/**
 * Settles a promise into a setter while respecting AbortSignal cancellation.
 * On rejection or abort-safe failure, writes null.
 */
export function settleAbortable<T>(
  signal: AbortSignal,
  promise: Promise<T>,
  onValue: (value: T | null) => void,
): void {
  promise
    .then((value) => {
      if (!signal.aborted) {
        onValue(value)
      }
    })
    .catch(() => {
      if (!signal.aborted) {
        onValue(null)
      }
    })
}
