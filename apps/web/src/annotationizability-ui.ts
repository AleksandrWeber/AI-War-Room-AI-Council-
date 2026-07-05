import {
  annotationizabilityAdminActionResponseSchema,
  annotationizabilityAdminSummaryResponseSchema,
  annotationizabilityCapabilitiesResponseSchema,
  annotationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAnnotationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/annotationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return annotationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAnnotationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/annotationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return annotationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAnnotationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_annotationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/annotationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceId,
        ...input,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return annotationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAnnotationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAnnotationizabilityRolloutCheckStatus(
  status: 'pass' | 'fail' | 'skip',
) {
  switch (status) {
    case 'pass':
      return 'Pass'
    case 'fail':
      return 'Fail'
    case 'skip':
      return 'Skip'
  }
}

export function formatAnnotationizabilityAdminAction(action: 'refresh_annotationizability_summary') {
  switch (action) {
    case 'refresh_annotationizability_summary':
      return 'Refresh annotationizability summary'
  }
}

export function formatAnnotationizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_invoices' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_invoices':
      return 'Billing invoices'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchAnnotationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/annotationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return annotationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
