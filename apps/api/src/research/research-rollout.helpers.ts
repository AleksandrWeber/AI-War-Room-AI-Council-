import type { ApiEnv } from '../config/env.js'
import type { ResearchProviderId } from '@ai-war-room/schemas'

export type ResearchRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ResearchRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  researchProvider: ResearchProviderId
  checks: ResearchRolloutCheck[]
  guidance: string
}

export type ResearchRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  researchProvider: ApiEnv['RESEARCH_PROVIDER']
  researchSecondaryProvider: ApiEnv['RESEARCH_SECONDARY_PROVIDER']
  tavilyApiKey?: string
  tavilyMaxResults: number
  serperApiKey?: string
}

export function evaluateResearchRollout(
  input: ResearchRolloutInput,
): ResearchRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'

  const checks: ResearchRolloutCheck[] = [
    {
      name: 'research_provider',
      label: 'Research provider',
      status:
        !isProduction || input.researchProvider !== 'mock' ? 'pass' : 'fail',
      detail:
        !isProduction || input.researchProvider !== 'mock'
          ? `Research provider is ${input.researchProvider}.`
          : 'RESEARCH_PROVIDER=mock cannot be used in production.',
    },
    {
      name: 'tavily_api_key',
      label: 'Tavily API key',
      status:
        input.researchProvider !== 'tavily' || Boolean(input.tavilyApiKey)
          ? 'pass'
          : 'fail',
      detail:
        input.researchProvider !== 'tavily'
          ? 'Tavily is not configured as the research provider.'
          : input.tavilyApiKey
            ? 'Tavily API key is configured.'
            : 'TAVILY_API_KEY is required when RESEARCH_PROVIDER=tavily (workspace BYOK can override per run).',
    },
    {
      name: 'tavily_max_results',
      label: 'Tavily max results',
      status:
        input.researchProvider !== 'tavily' ||
        (input.tavilyMaxResults >= 1 && input.tavilyMaxResults <= 10)
          ? 'pass'
          : 'fail',
      detail:
        input.researchProvider !== 'tavily'
          ? 'Tavily max results is only validated when Tavily is active.'
          : `Tavily max results is ${input.tavilyMaxResults}.`,
    },
    {
      name: 'research_failover',
      label: 'Research failover',
      status: 'pass',
      detail:
        input.researchSecondaryProvider === 'none'
          ? 'Secondary research failover is disabled.'
          : input.researchProvider === 'mock'
            ? 'Failover is unused while RESEARCH_PROVIDER=mock.'
            : input.serperApiKey
              ? 'Serper failover is enabled with a platform SERPER_API_KEY (workspace BYOK can override).'
              : 'Serper failover is enabled; runtime uses workspace BYOK or SERPER_API_KEY.',
    },
  ]

  const status = checks.every((check) => check.status === 'pass')
    ? 'ready'
    : 'not_ready'

  return {
    status,
    researchProvider: input.researchProvider,
    checks,
    guidance:
      status === 'ready'
        ? 'Research rollout checks passed. External research provider config is ready for production.'
        : 'Research rollout is not ready. Resolve failed checks before enabling paid-tier research in production.',
  }
}
