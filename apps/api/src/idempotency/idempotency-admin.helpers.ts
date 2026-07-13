import type {
  IdempotencyAdminAction,
  IdempotencyAdminRecord,
  IdempotencyAdminStats,
  IdempotencyRecord,
} from '@ai-war-room/schemas'

export function buildIdempotencyAdminRecords(input: {
  persistedRecords: IdempotencyRecord[]
  activeReservations: Array<{ idempotencyKey: string }>
}): IdempotencyAdminRecord[] {
  const activeReservationKeys = new Set(
    input.activeReservations.map((reservation) => reservation.idempotencyKey),
  )
  const recordsByKey = new Map<string, IdempotencyAdminRecord>()

  for (const record of input.persistedRecords) {
    recordsByKey.set(record.idempotencyKey, {
      idempotencyKey: record.idempotencyKey,
      runId: record.runId,
      expiresAt: record.expiresAt,
      reservationActive: activeReservationKeys.has(record.idempotencyKey),
      expired: record.expired,
    })
  }

  for (const reservation of input.activeReservations) {
    if (recordsByKey.has(reservation.idempotencyKey)) {
      continue
    }

    recordsByKey.set(reservation.idempotencyKey, {
      idempotencyKey: reservation.idempotencyKey,
      reservationActive: true,
      expired: false,
    })
  }

  return [...recordsByKey.values()]
    .sort((left, right) =>
      (right.expiresAt ?? '').localeCompare(left.expiresAt ?? ''),
    )
    .slice(0, 20)
}

export function buildIdempotencyAdminStats(
  records: IdempotencyAdminRecord[],
): IdempotencyAdminStats {
  const linkedRunIds = new Set(
    records.flatMap((record) => (record.runId ? [record.runId] : [])),
  )

  return {
    totalKeys: records.length,
    activeReservations: records.filter((record) => record.reservationActive)
      .length,
    expiredKeys: records.filter((record) => record.expired).length,
    linkedRunCount: linkedRunIds.size,
  }
}

export function getIdempotencyAdminGuidance(input: {
  stats: IdempotencyAdminStats
}) {
  if (input.stats.totalKeys === 0 && input.stats.activeReservations === 0) {
    return 'Workspace owners and admins can inspect idempotency metrics once draft runs reserve keys.'
  }

  if (input.stats.expiredKeys > 0) {
    return 'Workspace owners and admins can purge expired idempotency keys that are no longer eligible for draft replay.'
  }

  if (input.stats.activeReservations > 0) {
    return 'Workspace owners and admins can inspect active idempotency reservations and refresh the summary.'
  }

  return 'Workspace owners and admins can inspect persisted idempotency keys and clear stale reservations when needed.'
}

export function resolveIdempotencyAdminActions(input: {
  stats: IdempotencyAdminStats
}): IdempotencyAdminAction[] {
  const actions: IdempotencyAdminAction[] = ['refresh_idempotency_summary']

  if (input.stats.activeReservations > 0) {
    actions.push('clear_workspace_idempotency_reservations')
  }

  if (input.stats.expiredKeys > 0) {
    actions.push('purge_expired_idempotency_keys')
  }

  return actions
}
