import type {
  ProviderKeyAdminAction,
  ProviderKeyAdminRecord,
  ProviderKeyAdminStats,
} from '@ai-war-room/schemas'

export function buildProviderKeyAdminStats(
  credentials: ProviderKeyAdminRecord[],
): ProviderKeyAdminStats {
  return {
    totalCredentials: credentials.length,
    passedCredentials: credentials.filter(
      (credential) => credential.lastTestStatus === 'passed',
    ).length,
    failedCredentials: credentials.filter(
      (credential) => credential.lastTestStatus === 'failed',
    ).length,
    untestedCredentials: credentials.filter(
      (credential) => credential.lastTestStatus === 'untested',
    ).length,
    anthropicCredentials: credentials.filter(
      (credential) => credential.providerId === 'anthropic',
    ).length,
    openaiCredentials: credentials.filter(
      (credential) => credential.providerId === 'openai',
    ).length,
  }
}

export function resolveProviderKeyAdminActions(input: {
  stats: ProviderKeyAdminStats
}) {
  const actions: ProviderKeyAdminAction[] = []

  if (input.stats.totalCredentials > 0) {
    actions.push('test_all_credentials')
  }

  if (input.stats.failedCredentials > 0) {
    actions.push('retest_failed_credentials')
  }

  return actions
}

export function getProviderKeyAdminGuidance(input: {
  stats: ProviderKeyAdminStats
}) {
  if (input.stats.totalCredentials === 0) {
    return 'Workspace owners and admins can inspect provider key readiness once workspace BYOK keys are saved.'
  }

  if (input.stats.failedCredentials > 0) {
    return 'Workspace owners and admins can inspect failed provider keys and rerun connection tests.'
  }

  if (input.stats.untestedCredentials > 0) {
    return 'Workspace owners and admins can inspect untested provider keys and run connection tests.'
  }

  return 'Workspace owners and admins can inspect workspace provider key health and rerun connection tests.'
}
