import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react'
import type {
  AuthCapabilitiesResponse,
  AuthSessionResponse,
  BillingCapabilitiesResponse,
  BillingInvoiceRecord,
  BillingMeterUsageReport,
  BillingWebhookEventRecord,
  BillingWorkspaceAlertsResponse,
  BillingWorkspaceStatusResponse,
  BillingWorkspaceUsageResponse,
  CheckoutPaidTier,
  RunCapabilitiesResponse,
  TemporalRuntimeHealthResponse,
} from '@ai-war-room/schemas'
import './App.css'
import {
  buildBootstrapAuthHeaders,
  buildWorkspaceAuthHeaders,
  loadStoredAuthSession,
  saveStoredAuthSession,
} from './auth-headers'
import {
  clearBillingReturnHint,
  completeMockBillingCheckout,
  createBillingCheckoutSession,
  createCustomerPortalSession,
  cancelMockCustomerPortalSubscription,
  canOpenCustomerPortal,
  defaultWorkspaceId,
  describeBillingCapabilities,
  fetchBillingCapabilities,
  fetchBillingAlerts,
  fetchBillingInvoices,
  fetchBillingMeterUsageReports,
  fetchBillingUsageSummary,
  fetchBillingWebhookEvents,
  fetchBillingWorkspaceStatus,
  downloadBillingInvoiceExport,
  formatInvoiceAmount,
  formatInvoiceStatus,
  formatUsageCostLabel,
  formatUsageMeterLabel,
  formatUsagePercent,
  fetchMockCustomerPortal,
  formatBillingStatus,
  formatBillingAlertSeverity,
  formatMeterUsageReportStatus,
  formatPaidTier,
  formatTierLimits,
  readBillingReturnHint,
  type MockCustomerPortalResponse,
} from './billing-ui'
import {
  type TemporalRunStartResponse,
  type TemporalWorkflowRecoveryResponse,
  type TemporalWorkflowStatus,
  canResumeTemporalWorkflow,
  createTemporalObservationTimeoutMessage,
  describeApprovedRunRuntime,
  formatTemporalFailureMessage,
  isTemporalTerminalStatus,
  loadPersistedTemporalWorkflow,
  savePersistedTemporalWorkflow,
  shouldUseTemporalRuntime,
  sleep,
  temporalInitialPollDelayMs,
  temporalObservationTimeoutMs,
  temporalPollIntervalMs,
  toTemporalRunStartResponse,
} from './temporal-runtime'

type ApiHealthState = 'checking' | 'online' | 'offline'
type SubmitState = 'idle' | 'submitting' | 'success' | 'error'
type PipelineState = 'idle' | 'running' | 'completed' | 'error'

type ShieldFinding = {
  findingId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  span?: {
    start: number
    end: number
    quote: string
  }
  explanation: string
  recommendedAction: string
}

type DraftRun = {
  runId: string
  status: 'draft'
  idea: {
    rawIdea: string
    targetAudience?: string
    strategicGoals: string[]
    technicalPreferences: string[]
    constraints: string[]
    references: string[]
  }
  shieldScan: {
    status: 'clear' | 'warning' | 'blocked'
    maxSeverity: string
    findings: ShieldFinding[]
  }
  triage: {
    domain: string
    subdomain: string
    complexity: 'low' | 'medium' | 'high'
    marketConfidence: 'low' | 'medium' | 'high'
    securitySensitivity: 'low' | 'medium' | 'high'
    recommendedRunMode: 'standard' | 'deep'
    recommendedAgents: string[]
    estimatedDurationSeconds: number
    estimatedMaxCostUsd: number
    reasoningSummary: string
  }
  selectedAgents: string[]
  estimatedDurationSeconds: number
  estimatedMaxCostUsd: number
}

type ReviewDraft = {
  triage: DraftRun['triage']
  selectedAgents: string[]
}

type PipelineStep = {
  stepId: string
  label: string
  status: 'draft' | 'pending' | 'running' | 'completed' | 'failed' | 'blocked'
}

type PipelineStreamEvent =
  | {
      eventId: string
      type: 'status'
      stepId: string
      label: string
      status: 'running' | 'completed'
      timestamp: string
    }
  | {
      eventId: string
      type: 'artifact'
      artifactType: ArtifactResult['metadata']['artifactType']
      artifact: ArtifactResult
      timestamp: string
    }
  | {
      eventId: string
      type: 'completed'
      result: MockPipelineResult
      timestamp: string
    }
  | {
      eventId: string
      type: 'error'
      message: string
      timestamp: string
    }
  | {
      eventId: string
      type: 'workflow_status'
      runId: string
      workflowId: string
      temporalRunId?: string
      taskQueue: string
      status: TemporalWorkflowStatus
      timestamp: string
    }

type AgentExecution = {
  agentRole: string
  promptVersion: string
  modelProvider: string
  modelName: string
  validationStatus: 'valid' | 'repaired' | 'fallback'
  inputTokens: number
  outputTokens: number
  output: {
    summary: string
    strengths: string[]
    weaknesses: string[]
    risks: string[]
    recommendations: string[]
  }
}

type ArtifactResult = {
  metadata: {
    artifactId: string
    runId: string
    artifactType: 'executive_summary' | 'prd' | 'development_prompt'
    artifactVersion: string
    promptVersion: string
    modelProvider: string
    modelName: string
    validationStatus: 'valid' | 'repaired' | 'fallback'
    shieldStatus: 'clear' | 'warning' | 'blocked'
    tokenUsage: {
      inputTokens: number
      outputTokens: number
    }
    createdAt: string
  }
  artifact: {
    artifactType: 'executive_summary' | 'prd' | 'development_prompt'
    content: Record<string, unknown>
  }
}

type ArtifactHistoryItem = {
  artifactId: string
  runId: string
  workspaceId: string
  artifactType: ArtifactResult['metadata']['artifactType']
  artifactVersion: string
  createdAt: string
  metadata: ArtifactResult['metadata']
  artifact: ArtifactResult['artifact']
}

type ArtifactHistoryResponse = {
  workspaceId: string
  artifacts: ArtifactHistoryItem[]
}

type ProviderCredential = {
  credentialId: string
  workspaceId: string
  providerId: 'anthropic' | 'openai'
  label: string
  maskedKey: string
  createdByUserId: string
  createdAt: string
  updatedAt: string
  lastTestedAt?: string
  lastTestStatus: 'untested' | 'passed' | 'failed'
  lastTestError?: string
}

type ProviderCredentialInstructions = Record<
  'anthropic' | 'openai',
  {
    label: string
    url: string
    steps: string[]
  }
>

type ProviderCredentialListResponse = {
  workspaceId: string
  credentials: ProviderCredential[]
  needsProviderKey: boolean
  instructions: ProviderCredentialInstructions
}

type ProviderCredentialForm = {
  credentialId?: string
  providerId: 'anthropic' | 'openai'
  label: string
  apiKey: string
}

type MockPipelineResult = {
  status: 'completed'
  steps: PipelineStep[]
  agentOutputs: AgentExecution[]
  artifacts: ArtifactResult[]
}

type TemporalRunStatusResponse = {
  runId: string
  workspaceId: string
  workflowId: string
  temporalRunId?: string
  taskQueue: string
  status: TemporalWorkflowStatus
  temporalEnabled: true
  checkedAt: string
}

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000/api'
const reviewStorageKey = 'ai-war-room.review-draft'
const ideaStorageKey = 'ai-war-room.idea-draft'
const pipelineResultStorageKey = 'ai-war-room.pipeline-result'
const defaultProviderCredentialForm: ProviderCredentialForm = {
  providerId: 'anthropic',
  label: 'Anthropic workspace key',
  apiKey: '',
}

const pipelineSteps = [
  'Idea',
  'Shield scan',
  'Triage',
  'Human review',
  'Agent pool',
  'Moderator',
  'PRD',
  'Dev prompt',
]

const agentCards = [
  {
    title: 'Product Manager',
    text: 'Frames the user, problem, MVP scope, and product tradeoffs.',
  },
  {
    title: 'Critic',
    text: 'Stress-tests assumptions, weak points, risks, and unclear value.',
  },
  {
    title: 'Security Expert',
    text: 'Receives only sanitized Shield signals when risk is meaningful.',
  },
]

const agentOptions = [
  'product_manager',
  'critic',
  'moderator',
  'security_expert',
  'software_architect',
  'market_researcher',
  'mobile_ux_expert',
]

const agentCatalog: Record<string, { label: string; rationale: string }> = {
  product_manager: {
    label: 'Product Manager',
    rationale: 'Selected to frame users, value proposition, MVP scope, and product tradeoffs.',
  },
  critic: {
    label: 'Critic',
    rationale: 'Selected to challenge assumptions, weak points, and hidden execution risks.',
  },
  moderator: {
    label: 'Moderator',
    rationale: 'Required to synthesize isolated specialist output into one artifact brief.',
  },
  security_expert: {
    label: 'Security Expert',
    rationale: 'Selected when Shield or triage detects security-sensitive context.',
  },
  software_architect: {
    label: 'Software Architect',
    rationale: 'Selected for high-complexity ideas that need architecture and sequencing guidance.',
  },
  market_researcher: {
    label: 'Market Researcher',
    rationale: 'Selected when positioning, competition, pricing, or market validation is important.',
  },
  mobile_ux_expert: {
    label: 'Mobile UX Expert',
    rationale: 'Selected when the idea mentions mobile, iOS, Android, or compact review UX.',
  },
}

const domainOptions = [
  'software',
  'mobile',
  'saas',
  'ecommerce',
  'fintech',
  'healthcare',
  'education',
  'security',
  'other',
]

function formatAgent(agent: string) {
  return (agentCatalog[agent]?.label ?? agent)
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function formatArtifactTitle(artifactType: ArtifactResult['metadata']['artifactType']) {
  if (artifactType === 'prd') {
    return 'PRD'
  }

  return formatAgent(artifactType)
}

function getSeverityLabel(severity: string) {
  return severity === 'none' ? 'No risk' : severity
}

function getHighlightedIdea(rawIdea: string, findings: ShieldFinding[]) {
  const spans = findings
    .filter((finding) => finding.span)
    .map((finding) => ({
      findingId: finding.findingId,
      start: finding.span!.start,
      end: finding.span!.end,
    }))
    .sort((left, right) => left.start - right.start)

  if (spans.length === 0) {
    return rawIdea
  }

  let cursor = 0

  return (
    <>
      {spans.map((span) => {
        const before = rawIdea.slice(cursor, span.start)
        const highlighted = rawIdea.slice(span.start, span.end)
        cursor = span.end

        return (
          <Fragment key={span.findingId}>
            {before}
            <mark>{highlighted}</mark>
          </Fragment>
        )
      })}
      {rawIdea.slice(cursor)}
    </>
  )
}

function renderArtifactValue(value: unknown) {
  if (Array.isArray(value)) {
    return (
      <ul>
        {value.map((item, index) => (
          <li key={`${String(item)}-${index}`}>{String(item)}</li>
        ))}
      </ul>
    )
  }

  return <p>{String(value)}</p>
}

function parseSseEvents(chunk: string): PipelineStreamEvent[] {
  return chunk
    .split('\n\n')
    .map((eventBlock) => {
      const dataLine = eventBlock
        .split('\n')
        .find((line) => line.startsWith('data: '))

      if (!dataLine) {
        return null
      }

      return JSON.parse(dataLine.slice(6)) as PipelineStreamEvent
    })
    .filter((event): event is PipelineStreamEvent => Boolean(event))
}

function mapTemporalStatusToStepStatus(
  status: TemporalWorkflowStatus,
): PipelineStep['status'] {
  if (status === 'completed') {
    return 'completed'
  }

  if (status === 'running' || status === 'unknown') {
    return 'running'
  }

  return 'failed'
}

async function readSseStream(
  response: Response,
  onEvent: (event: PipelineStreamEvent) => void,
) {
  if (!response.body) {
    throw new Error('Streaming response body is not available.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })
    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() ?? ''

    for (const event of parseSseEvents(chunks.join('\n\n'))) {
      onEvent(event)
    }

    if (done) {
      break
    }
  }

  for (const event of parseSseEvents(buffer)) {
    onEvent(event)
  }
}

function App() {
  const [apiHealth, setApiHealth] = useState<ApiHealthState>('checking')
  const [rawIdea, setRawIdea] = useState(() => {
    return (
      localStorage.getItem(ideaStorageKey) ??
      "AI tool that turns a founder's rough concept into a validated PRD and Cursor-ready implementation prompt."
    )
  })
  const [targetAudience, setTargetAudience] = useState('Founders')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [draftRun, setDraftRun] = useState<DraftRun | null>(null)
  const [reviewDraft, setReviewDraft] = useState<ReviewDraft | null>(() => {
    const saved = localStorage.getItem(reviewStorageKey)

    return saved ? (JSON.parse(saved) as ReviewDraft) : null
  })
  const [pipelineState, setPipelineState] = useState<PipelineState>('idle')
  const [pipelineError, setPipelineError] = useState<string | null>(null)
  const [pipelineResult, setPipelineResult] = useState<MockPipelineResult | null>(
    () => {
      const saved = localStorage.getItem(pipelineResultStorageKey)

      return saved ? (JSON.parse(saved) as MockPipelineResult) : null
    },
  )
  const [streamEvents, setStreamEvents] = useState<PipelineStreamEvent[]>([])
  const [streamedArtifacts, setStreamedArtifacts] = useState<ArtifactResult[]>([])
  const [lastStreamEventId, setLastStreamEventId] = useState<string | null>(null)
  const lastStreamEventIdRef = useRef<string | null>(null)
  const [lastStreamRunId, setLastStreamRunId] = useState<string | null>(null)
  const [runCapabilities, setRunCapabilities] =
    useState<RunCapabilitiesResponse | null>(null)
  const [authCapabilities, setAuthCapabilities] =
    useState<AuthCapabilitiesResponse | null>(null)
  const [authSession, setAuthSession] = useState<AuthSessionResponse | null>(
    () => loadStoredAuthSession(),
  )
  const workspaceAuthHeaders = buildWorkspaceAuthHeaders(
    authCapabilities,
    authSession,
  )
  const [temporalRuntimeHealth, setTemporalRuntimeHealth] =
    useState<TemporalRuntimeHealthResponse | null>(null)
  const useTemporalWorkflowRuntime = shouldUseTemporalRuntime(
    runCapabilities?.runtime ?? null,
  )
  const approvedRunRuntimeLabel = describeApprovedRunRuntime(
    runCapabilities?.runtime ?? null,
  )
  const [activeTemporalWorkflow, setActiveTemporalWorkflow] =
    useState<TemporalRunStartResponse | null>(null)
  const [temporalRecoveryHint, setTemporalRecoveryHint] = useState<string | null>(
    null,
  )
  const [artifactHistory, setArtifactHistory] = useState<ArtifactHistoryItem[]>([])
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [providerCredentials, setProviderCredentials] =
    useState<ProviderCredentialListResponse | null>(null)
  const [providerCredentialForm, setProviderCredentialForm] =
    useState<ProviderCredentialForm>(defaultProviderCredentialForm)
  const [providerCredentialError, setProviderCredentialError] = useState<
    string | null
  >(null)
  const [providerCredentialStatus, setProviderCredentialStatus] = useState<
    'idle' | 'loading' | 'saving' | 'testing'
  >('idle')
  const [billingCapabilities, setBillingCapabilities] =
    useState<BillingCapabilitiesResponse | null>(null)
  const [billingStatus, setBillingStatus] =
    useState<BillingWorkspaceStatusResponse | null>(null)
  const [billingError, setBillingError] = useState<string | null>(null)
  const [billingMessage, setBillingMessage] = useState<string | null>(null)
  const [billingAction, setBillingAction] = useState<
    'idle' | 'loading' | 'upgrading' | 'portal' | 'canceling'
  >('idle')
  const [mockCustomerPortal, setMockCustomerPortal] =
    useState<MockCustomerPortalResponse | null>(null)
  const [billingWebhookEvents, setBillingWebhookEvents] = useState<
    BillingWebhookEventRecord[]
  >([])
  const [billingInvoices, setBillingInvoices] = useState<BillingInvoiceRecord[]>(
    [],
  )
  const [billingUsageSummary, setBillingUsageSummary] =
    useState<BillingWorkspaceUsageResponse | null>(null)
  const [billingAlerts, setBillingAlerts] = useState<
    BillingWorkspaceAlertsResponse['alerts']
  >([])
  const [billingMeterUsageReports, setBillingMeterUsageReports] = useState<
    BillingMeterUsageReport[]
  >([])
  const [activeFindingId, setActiveFindingId] = useState<string | null>(null)
  const [activeArtifactType, setActiveArtifactType] =
    useState<ArtifactResult['metadata']['artifactType']>('executive_summary')

  useEffect(() => {
    if (!useTemporalWorkflowRuntime) {
      return
    }

    const persisted = loadPersistedTemporalWorkflow()

    if (!persisted) {
      return
    }

    setActiveTemporalWorkflow(toTemporalRunStartResponse(persisted))

    if (persisted.lastStreamEventId) {
      lastStreamEventIdRef.current = persisted.lastStreamEventId
      setLastStreamEventId(persisted.lastStreamEventId)
      setLastStreamRunId(persisted.runId)
    }
  }, [useTemporalWorkflowRuntime])

  useEffect(() => {
    if (!useTemporalWorkflowRuntime || !activeTemporalWorkflow) {
      return
    }

    if (isTemporalTerminalStatus(activeTemporalWorkflow.status)) {
      if (activeTemporalWorkflow.status === 'completed') {
        savePersistedTemporalWorkflow(null)
      }

      return
    }

    savePersistedTemporalWorkflow({
      ...activeTemporalWorkflow,
      lastStreamEventId,
      persistedAt: new Date().toISOString(),
    })
  }, [activeTemporalWorkflow, lastStreamEventId, useTemporalWorkflowRuntime])

  useEffect(() => {
    const controller = new AbortController()

    fetch(`${apiBaseUrl}/health`, {
      signal: controller.signal,
    })
      .then((response) => {
        setApiHealth(response.ok ? 'online' : 'offline')
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setApiHealth('offline')
        }
      })

    fetch(`${apiBaseUrl}/auth/capabilities`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((capabilities) => {
        if (capabilities && !controller.signal.aborted) {
          setAuthCapabilities(capabilities as AuthCapabilitiesResponse)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAuthCapabilities(null)
        }
      })

    fetch(`${apiBaseUrl}/runs/capabilities`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((capabilities) => {
        if (capabilities && !controller.signal.aborted) {
          setRunCapabilities(capabilities as RunCapabilitiesResponse)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRunCapabilities(null)
        }
      })

    fetchBillingCapabilities(apiBaseUrl)
      .then((capabilities) => {
        if (!controller.signal.aborted) {
          setBillingCapabilities(capabilities)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setBillingCapabilities(null)
        }
      })

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (authCapabilities?.provider !== 'session') {
      return
    }

    const storedSession = loadStoredAuthSession()

    if (storedSession) {
      setAuthSession(storedSession)
      return
    }

    const controller = new AbortController()

    fetch(`${apiBaseUrl}/auth/session`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...buildBootstrapAuthHeaders(authCapabilities),
      },
      body: JSON.stringify({
        workspaceId: 'local_workspace',
      }),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((session) => {
        if (session && !controller.signal.aborted) {
          const nextSession = session as AuthSessionResponse
          saveStoredAuthSession(nextSession)
          setAuthSession(nextSession)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAuthSession(null)
        }
      })

    return () => {
      controller.abort()
    }
  }, [authCapabilities])

  useEffect(() => {
    if (!useTemporalWorkflowRuntime) {
      setTemporalRuntimeHealth(null)
      return
    }

    const controller = new AbortController()

    fetch(`${apiBaseUrl}/runs/temporal/health`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((health) => {
        if (health && !controller.signal.aborted) {
          setTemporalRuntimeHealth(health as TemporalRuntimeHealthResponse)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setTemporalRuntimeHealth(null)
        }
      })

    return () => {
      controller.abort()
    }
  }, [useTemporalWorkflowRuntime])

  useEffect(() => {
    localStorage.setItem(ideaStorageKey, rawIdea)
  }, [rawIdea])

  useEffect(() => {
    if (reviewDraft) {
      localStorage.setItem(reviewStorageKey, JSON.stringify(reviewDraft))
    }
  }, [reviewDraft])

  useEffect(() => {
    if (pipelineResult) {
      localStorage.setItem(
        pipelineResultStorageKey,
        JSON.stringify(pipelineResult),
      )
    }
  }, [pipelineResult])

  useEffect(() => {
    setActiveFindingId(draftRun?.shieldScan.findings[0]?.findingId ?? null)
  }, [draftRun])

  useEffect(() => {
    void handleLoadProviderCredentials()
  }, [])

  useEffect(() => {
    void handleLoadBillingStatus()
  }, [authCapabilities, authSession])

  useEffect(() => {
    const returnHint = readBillingReturnHint()

    if (!returnHint) {
      return
    }

    if (returnHint === 'success') {
      setBillingMessage('Checkout completed. Workspace billing status refreshed.')
    } else if (returnHint === 'portal') {
      setBillingMessage('Returned from customer portal. Billing status refreshed.')
    } else {
      setBillingMessage('Checkout canceled. No billing changes were applied.')
    }

    clearBillingReturnHint()
    setMockCustomerPortal(null)
    void handleLoadBillingStatus()
  }, [])

  useEffect(() => {
    if (pipelineResult?.artifacts[0]) {
      setActiveArtifactType(pipelineResult.artifacts[0].metadata.artifactType)
    }
  }, [pipelineResult])

  async function handleCreateDraftRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitState('submitting')
    setSubmitError(null)

    try {
      const response = await fetch(`${apiBaseUrl}/runs/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...workspaceAuthHeaders,
        },
        body: JSON.stringify({
          workspaceId: 'local_workspace',
          idempotencyKey: globalThis.crypto.randomUUID(),
          idea: {
            rawIdea,
            targetAudience,
            strategicGoals: ['Create build-ready planning artifacts'],
            technicalPreferences: ['TypeScript', 'Vite', 'NestJS'],
            constraints: ['MVP first', 'No chat loops'],
            references: [],
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const nextDraftRun = (await response.json()) as DraftRun
      setDraftRun(nextDraftRun)
      setReviewDraft({
        triage: nextDraftRun.triage,
        selectedAgents: nextDraftRun.selectedAgents,
      })
      setPipelineResult(null)
      localStorage.removeItem(pipelineResultStorageKey)
      setStreamEvents([])
      setStreamedArtifacts([])
      setPipelineState('idle')
      setSubmitState('success')
    } catch (error) {
      setSubmitState('error')
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to create draft run.',
      )
    }
  }

  function updateReviewTriage<Key extends keyof DraftRun['triage']>(
    key: Key,
    value: DraftRun['triage'][Key],
  ) {
    setReviewDraft((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        triage: {
          ...current.triage,
          [key]: value,
        },
      }
    })
  }

  function toggleAgent(agent: string) {
    setReviewDraft((current) => {
      if (!current) {
        return current
      }

      const selectedAgents = current.selectedAgents.includes(agent)
        ? current.selectedAgents.filter((selectedAgent) => selectedAgent !== agent)
        : [...current.selectedAgents, agent]

      return {
        ...current,
        selectedAgents,
      }
    })
  }

  function createApprovedRunPayload() {
    if (!draftRun || !reviewDraft) {
      return null
    }

    return {
      draftRun,
      approvedTriage: reviewDraft.triage,
      selectedAgents: reviewDraft.selectedAgents,
    }
  }

  async function handleExecuteApprovedRun() {
    if (useTemporalWorkflowRuntime) {
      await handleExecuteTemporalWorkflow()
      return
    }

    await handleExecuteStreamedPipeline()
  }

  async function handleExecuteStreamedPipeline() {
    if (!draftRun || !reviewDraft) {
      return
    }

    const canReplayStream =
      pipelineState === 'error' &&
      lastStreamRunId === draftRun.runId &&
      lastStreamEventId

    setPipelineState('running')
    setPipelineError(null)
    setPipelineResult(null)
    setLastStreamRunId(draftRun.runId)

    if (!canReplayStream) {
      setStreamEvents([])
      setStreamedArtifacts([])
      lastStreamEventIdRef.current = null
      setLastStreamEventId(null)
      setActiveTemporalWorkflow(null)
    }

    try {
      const payload = createApprovedRunPayload()

      if (!payload) {
        return
      }

      const response = await fetch(`${apiBaseUrl}/runs/mock-pipeline/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...workspaceAuthHeaders,
          ...(canReplayStream ? { 'Last-Event-ID': lastStreamEventId } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      await readSseStream(response, handlePipelineStreamEvent)
    } catch (error) {
      setPipelineState('error')
      setPipelineError(
        error instanceof Error
          ? error.message
          : 'Failed to execute prompt-driven pipeline.',
      )
    }
  }

  async function handleExecuteTemporalWorkflow() {
    if (!draftRun) {
      return
    }

    const recoverableWorkflow =
      activeTemporalWorkflow ??
      (() => {
        const persisted = loadPersistedTemporalWorkflow()

        return persisted?.runId === draftRun.runId
          ? toTemporalRunStartResponse(persisted)
          : null
      })()

    if (
      canResumeTemporalWorkflow({
        runId: draftRun.runId,
        workflow: recoverableWorkflow,
      }) &&
      recoverableWorkflow
    ) {
      await handleResumeTemporalWorkflow(recoverableWorkflow)
      return
    }

    setPipelineState('running')
    setPipelineError(null)
    setPipelineResult(null)
    setTemporalRecoveryHint(null)
    setActiveTemporalWorkflow(null)
    setLastStreamRunId(draftRun.runId)
    setStreamEvents([])
    setStreamedArtifacts([])
    lastStreamEventIdRef.current = null
    setLastStreamEventId(null)
    savePersistedTemporalWorkflow(null)

    try {
      const payload = createApprovedRunPayload()

      if (!payload) {
        return
      }

      const startResponse = await fetch(`${apiBaseUrl}/runs/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...workspaceAuthHeaders,
        },
        body: JSON.stringify(payload),
      })

      if (!startResponse.ok) {
        throw new Error(`API returned ${startResponse.status}`)
      }

      const workflow = (await startResponse.json()) as TemporalRunStartResponse
      setActiveTemporalWorkflow(workflow)

      await Promise.all([
        observeTemporalWorkflow(workflow.workflowId),
        pollTemporalWorkflowStatus(workflow),
      ])
    } catch (error) {
      setPipelineState('error')
      setPipelineError(
        error instanceof Error
          ? error.message
          : 'Failed to start Temporal workflow.',
      )
    }
  }

  async function handleResumeTemporalWorkflow(workflow: TemporalRunStartResponse) {
    setPipelineState('running')
    setPipelineError(null)
    setTemporalRecoveryHint(null)
    setLastStreamRunId(workflow.runId)
    setActiveTemporalWorkflow(workflow)

    try {
      const recoverResponse = await fetch(
        `${apiBaseUrl}/runs/workflows/${workflow.workflowId}/recover`,
        {
          method: 'POST',
          headers: workspaceAuthHeaders,
        },
      )

      if (!recoverResponse.ok) {
        throw new Error(`API returned ${recoverResponse.status}`)
      }

      const recovery =
        (await recoverResponse.json()) as TemporalWorkflowRecoveryResponse
      const resumedWorkflow = toTemporalRunStartResponse(recovery.workflow)

      setTemporalRecoveryHint(recovery.recoveryHint)
      setActiveTemporalWorkflow(resumedWorkflow)

      const persistedWorkflow = loadPersistedTemporalWorkflow()
      const replayEventId =
        persistedWorkflow?.runId === workflow.runId
          ? persistedWorkflow.lastStreamEventId ?? lastStreamEventId
          : lastStreamEventId

      await Promise.all([
        observeTemporalWorkflow(resumedWorkflow.workflowId, {
          afterEventId: replayEventId,
        }),
        pollTemporalWorkflowStatus(resumedWorkflow),
      ])
    } catch (error) {
      setPipelineState('error')
      setPipelineError(
        error instanceof Error
          ? error.message
          : 'Failed to resume Temporal workflow observation.',
      )
    }
  }

  async function observeTemporalWorkflow(
    workflowId: string,
    options?: { afterEventId?: string | null },
  ) {
    const headers: Record<string, string> = {
      ...workspaceAuthHeaders,
    }
    const afterEventId = options?.afterEventId ?? lastStreamEventIdRef.current

    if (afterEventId) {
      headers['Last-Event-ID'] = afterEventId
    }

    const response = await fetch(`${apiBaseUrl}/runs/workflows/${workflowId}/stream`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    await readSseStream(response, handlePipelineStreamEvent)
  }

  async function pollTemporalWorkflowStatus(workflow: TemporalRunStartResponse) {
    let latestStatus: TemporalWorkflowStatus = workflow.status
    const deadline = Date.now() + temporalObservationTimeoutMs
    let attempt = 0

    while (!isTemporalTerminalStatus(latestStatus) && Date.now() < deadline) {
      await sleep(attempt === 0 ? temporalInitialPollDelayMs : temporalPollIntervalMs)
      attempt += 1

      const statusResponse = await fetch(
        `${apiBaseUrl}/runs/workflows/${workflow.workflowId}/status`,
        {
          headers: workspaceAuthHeaders,
        },
      )

      if (!statusResponse.ok) {
        throw new Error(`API returned ${statusResponse.status}`)
      }

      const status = (await statusResponse.json()) as TemporalRunStatusResponse
      latestStatus = status.status
      setActiveTemporalWorkflow((current) =>
        current
          ? {
              ...current,
              temporalRunId: status.temporalRunId ?? current.temporalRunId,
              status: status.status,
            }
          : current,
      )
    }

    if (latestStatus === 'completed') {
      savePersistedTemporalWorkflow(null)
      const history = await handleLoadArtifactHistory()
      const runArtifacts = history
        .filter((artifact) => artifact.runId === workflow.runId)
        .map((artifact) => ({
          metadata: artifact.metadata,
          artifact: artifact.artifact,
        }))

      setStreamedArtifacts(runArtifacts)
      if (runArtifacts[0]) {
        setActiveArtifactType(runArtifacts[0].metadata.artifactType)
      }
      setPipelineState('completed')
      return
    }

    if (isTemporalTerminalStatus(latestStatus)) {
      throw new Error(formatTemporalFailureMessage(latestStatus))
    }

    setPipelineState('error')
    setPipelineError(createTemporalObservationTimeoutMessage(temporalObservationTimeoutMs))
  }

  async function handleLoadArtifactHistory() {
    setHistoryError(null)

    try {
      const response = await fetch(`${apiBaseUrl}/runs/artifacts/history`, {
        headers: workspaceAuthHeaders,
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const history = (await response.json()) as ArtifactHistoryResponse
      setArtifactHistory(history.artifacts)

      return history.artifacts
    } catch (error) {
      setHistoryError(
        error instanceof Error ? error.message : 'Failed to load artifact history.',
      )

      return []
    }
  }

  async function handleExportMarkdown(artifactId: string) {
    setHistoryError(null)

    try {
      const response = await fetch(
        `${apiBaseUrl}/runs/artifacts/${artifactId}/export/markdown`,
        {
          headers: workspaceAuthHeaders,
        },
      )

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const markdown = await response.text()
      const blob = new Blob([markdown], {
        type: 'text/markdown;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${artifactId}.md`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setHistoryError(
        error instanceof Error ? error.message : 'Failed to export Markdown.',
      )
    }
  }

  async function handleLoadBillingStatus() {
    setBillingAction('loading')
    setBillingError(null)

    try {
      const status = await fetchBillingWorkspaceStatus(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingStatus(status)

      const events = await fetchBillingWebhookEvents(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingWebhookEvents(events.events)

      const invoices = await fetchBillingInvoices(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingInvoices(invoices.invoices)

      const usage = await fetchBillingUsageSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingUsageSummary(usage)

      const alerts = await fetchBillingAlerts(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingAlerts(alerts.alerts)

      const meterUsage = await fetchBillingMeterUsageReports(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingMeterUsageReports(meterUsage.reports)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to load workspace billing status.',
      )
    } finally {
      setBillingAction('idle')
    }
  }

  async function handleExportBillingInvoices(format: 'csv' | 'json') {
    setBillingError(null)

    try {
      await downloadBillingInvoiceExport(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        format,
      )
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to export billing invoices.',
      )
    }
  }

  async function handleUpgradeBillingTier(paidTier: CheckoutPaidTier) {
    setBillingAction('upgrading')
    setBillingError(null)
    setBillingMessage(null)
    setMockCustomerPortal(null)

    try {
      const session = await createBillingCheckoutSession(
        apiBaseUrl,
        defaultWorkspaceId,
        paidTier,
        workspaceAuthHeaders,
      )

      if (billingCapabilities?.adapter === 'mock') {
        const completed = await completeMockBillingCheckout(session.checkoutUrl)
        setBillingStatus(completed)
        setBillingMessage(
          `Mock checkout completed. Workspace upgraded to ${formatPaidTier(paidTier)}.`,
        )
        return
      }

      window.location.assign(session.checkoutUrl)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to start billing checkout.',
      )
    } finally {
      setBillingAction('idle')
    }
  }

  async function handleOpenCustomerPortal() {
    setBillingAction('portal')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const session = await createCustomerPortalSession(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )

      if (billingCapabilities?.adapter === 'mock') {
        const portal = await fetchMockCustomerPortal(session.portalUrl)
        setMockCustomerPortal(portal)
        return
      }

      window.location.assign(session.portalUrl)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to open customer portal.',
      )
    } finally {
      setBillingAction('idle')
    }
  }

  async function handleCancelMockSubscription() {
    setBillingAction('canceling')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const status = await cancelMockCustomerPortalSubscription(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingStatus(status)
      setMockCustomerPortal(null)
      setBillingMessage('Subscription canceled. Workspace returned to the Free tier.')
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to cancel subscription.',
      )
    } finally {
      setBillingAction('idle')
    }
  }

  async function handleLoadProviderCredentials() {
    setProviderCredentialStatus('loading')
    setProviderCredentialError(null)

    try {
      const response = await fetch(`${apiBaseUrl}/provider-credentials`, {
        headers: workspaceAuthHeaders,
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      setProviderCredentials(
        (await response.json()) as ProviderCredentialListResponse,
      )
    } catch (error) {
      setProviderCredentialError(
        error instanceof Error
          ? error.message
          : 'Failed to load provider credentials.',
      )
    } finally {
      setProviderCredentialStatus('idle')
    }
  }

  async function handleSaveProviderCredential(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProviderCredentialStatus('saving')
    setProviderCredentialError(null)

    try {
      const response = await fetch(
        `${apiBaseUrl}/provider-credentials${
          providerCredentialForm.credentialId
            ? `/${providerCredentialForm.credentialId}`
            : ''
        }`,
        {
          method: providerCredentialForm.credentialId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...workspaceAuthHeaders,
          },
          body: JSON.stringify({
            providerId: providerCredentialForm.providerId,
            label: providerCredentialForm.label,
            apiKey: providerCredentialForm.apiKey,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      setProviderCredentialForm(defaultProviderCredentialForm)
      await handleLoadProviderCredentials()
    } catch (error) {
      setProviderCredentialError(
        error instanceof Error
          ? error.message
          : 'Failed to save provider credential.',
      )
    } finally {
      setProviderCredentialStatus('idle')
    }
  }

  function handleEditProviderCredential(credential: ProviderCredential) {
    setProviderCredentialForm({
      credentialId: credential.credentialId,
      providerId: credential.providerId,
      label: credential.label,
      apiKey: '',
    })
  }

  async function handleDeleteProviderCredential(credentialId: string) {
    setProviderCredentialStatus('saving')
    setProviderCredentialError(null)

    try {
      const response = await fetch(
        `${apiBaseUrl}/provider-credentials/${credentialId}`,
        {
          method: 'DELETE',
          headers: workspaceAuthHeaders,
        },
      )

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      await handleLoadProviderCredentials()
    } catch (error) {
      setProviderCredentialError(
        error instanceof Error
          ? error.message
          : 'Failed to delete provider credential.',
      )
    } finally {
      setProviderCredentialStatus('idle')
    }
  }

  async function handleTestProviderCredential(credentialId: string) {
    setProviderCredentialStatus('testing')
    setProviderCredentialError(null)

    try {
      const response = await fetch(
        `${apiBaseUrl}/provider-credentials/${credentialId}/test`,
        {
          method: 'POST',
          headers: workspaceAuthHeaders,
        },
      )

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      await handleLoadProviderCredentials()
    } catch (error) {
      setProviderCredentialError(
        error instanceof Error
          ? error.message
          : 'Failed to test provider credential.',
      )
    } finally {
      setProviderCredentialStatus('idle')
    }
  }

  function handlePipelineStreamEvent(event: PipelineStreamEvent) {
    setStreamEvents((current) => [...current, event])
    lastStreamEventIdRef.current = event.eventId
    setLastStreamEventId(event.eventId)

    if (event.type === 'artifact') {
      setStreamedArtifacts((current) => {
        if (current.length === 0) {
          setActiveArtifactType(event.artifactType)
        }

        return [...current, event.artifact]
      })
    }

    if (event.type === 'completed') {
      setPipelineResult(event.result)
      setPipelineState('completed')
    }

    if (event.type === 'workflow_status') {
      setActiveTemporalWorkflow((current) =>
        current
          ? {
              ...current,
              temporalRunId: event.temporalRunId ?? current.temporalRunId,
              status: event.status,
            }
          : current,
      )

      if (event.status === 'completed') {
        setPipelineState('completed')
      }

      if (isTemporalTerminalStatus(event.status) && event.status !== 'completed') {
        setPipelineState('error')
        setPipelineError(formatTemporalFailureMessage(event.status))
      }
    }

    if (event.type === 'error') {
      setPipelineState('error')
      setPipelineError(event.message)
    }
  }

  const activeFinding =
    draftRun?.shieldScan.findings.find(
      (finding) => finding.findingId === activeFindingId,
    ) ?? draftRun?.shieldScan.findings[0]
  const selectedArtifact =
    (pipelineResult?.artifacts ?? streamedArtifacts).find(
      (artifact) => artifact.metadata.artifactType === activeArtifactType,
    ) ?? (pipelineResult?.artifacts ?? streamedArtifacts)[0]
  const visibleArtifacts = pipelineResult?.artifacts ?? streamedArtifacts
  const statusEvents = streamEvents.filter((event) => event.type === 'status')
  const workflowStatusEvents = streamEvents.filter(
    (event) => event.type === 'workflow_status',
  )
  const displayedSteps: PipelineStep[] =
    pipelineResult?.steps ??
    (workflowStatusEvents.length > 0
      ? workflowStatusEvents.map((event) => ({
          stepId: event.workflowId,
          label: `Temporal workflow (${event.taskQueue})`,
          status: mapTemporalStatusToStepStatus(event.status),
        }))
      : statusEvents)
  const selectedAgentCount = reviewDraft?.selectedAgents.length ?? 0
  const selectedSpecialistCount =
    reviewDraft?.selectedAgents.filter((agent) => agent !== 'moderator').length ?? 0
  const showResumeTemporalObservation =
    useTemporalWorkflowRuntime &&
    canResumeTemporalWorkflow({
      runId: draftRun?.runId,
      workflow: activeTemporalWorkflow,
    })

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">AI Council / AI War Room</p>
          <h1>Turn a raw idea into build-ready product artifacts.</h1>
          <p className="hero-text">
            A structured planning engine that runs isolated AI specialists,
            validates their output, and produces an executive summary, PRD, and
            development prompt without becoming another chat app.
          </p>
          <div className="hero-actions">
            <a href="#idea" className="primary-action">
              Draft first idea
            </a>
            <a href="#pipeline" className="secondary-action">
              View pipeline
            </a>
          </div>
        </div>

        <div className="war-room-card" aria-label="Run preview">
          <div className="card-header">
            <span>Standard run</span>
            <strong>Under 5 min</strong>
          </div>
          <form className="idea-form" id="idea" onSubmit={handleCreateDraftRun}>
            <label htmlFor="rawIdea">Raw idea</label>
            <textarea
              id="rawIdea"
              value={rawIdea}
              onChange={(event) => setRawIdea(event.target.value)}
              rows={7}
            />
            <label htmlFor="targetAudience">Target audience</label>
            <input
              id="targetAudience"
              value={targetAudience}
              onChange={(event) => setTargetAudience(event.target.value)}
            />
            <button type="submit" disabled={submitState === 'submitting'}>
              {submitState === 'submitting' ? 'Creating draft...' : 'Create draft run'}
            </button>
            {submitError ? <p className="form-error">{submitError}</p> : null}
          </form>
          <div className="shield-status">
            <span className="status-dot"></span>
            Shield:{' '}
            {draftRun
              ? `${draftRun.shieldScan.status} (${draftRun.shieldScan.findings.length} findings)`
              : 'clear by default, visible only when risk is meaningful.'}
          </div>
          <div className={`api-status api-status--${apiHealth}`}>
            API status: {apiHealth}
          </div>
        </div>
      </section>

      <section className="panel provider-panel">
        <div className="section-heading">
          <p className="eyebrow">Provider Keys</p>
          <h2>Connect workspace AI providers.</h2>
          <p>
            Add Anthropic or OpenAI keys from the client UI. Keys are sent
            directly to the backend, encrypted before PostgreSQL storage, and
            never returned to the browser.
          </p>
        </div>

        {providerCredentials?.needsProviderKey ? (
          <div className="provider-alert">
            <strong>No backend provider keys found.</strong>
            <p>
              Local mock mode still works, but real provider runs need a
              workspace key or a server-side environment key.
            </p>
          </div>
        ) : null}

        <div className="provider-grid">
          <form className="provider-form" onSubmit={handleSaveProviderCredential}>
            <span>
              {providerCredentialForm.credentialId ? 'Edit key' : 'Add key'}
            </span>
            <label>
              Provider
              <select
                value={providerCredentialForm.providerId}
                disabled={Boolean(providerCredentialForm.credentialId)}
                onChange={(event) =>
                  setProviderCredentialForm((current) => ({
                    ...current,
                    providerId: event.target.value as ProviderCredentialForm['providerId'],
                    label:
                      event.target.value === 'anthropic'
                        ? 'Anthropic workspace key'
                        : 'OpenAI workspace key',
                  }))
                }
              >
                <option value="anthropic">Anthropic</option>
                <option value="openai">OpenAI</option>
              </select>
            </label>
            <label>
              Label
              <input
                value={providerCredentialForm.label}
                onChange={(event) =>
                  setProviderCredentialForm((current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              API key
              <input
                value={providerCredentialForm.apiKey}
                placeholder="sk-..."
                type="password"
                onChange={(event) =>
                  setProviderCredentialForm((current) => ({
                    ...current,
                    apiKey: event.target.value,
                  }))
                }
              />
            </label>
            <div className="provider-actions">
              <button
                type="submit"
                disabled={
                  providerCredentialStatus === 'saving' ||
                  providerCredentialForm.apiKey.length < 12
                }
              >
                {providerCredentialStatus === 'saving'
                  ? 'Saving...'
                  : providerCredentialForm.credentialId
                    ? 'Update encrypted key'
                    : 'Save encrypted key'}
              </button>
              {providerCredentialForm.credentialId ? (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() =>
                    setProviderCredentialForm(defaultProviderCredentialForm)
                  }
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
            {providerCredentialError ? (
              <p className="form-error">{providerCredentialError}</p>
            ) : null}
          </form>

          <div className="provider-list">
            <span>Saved keys</span>
            {providerCredentialStatus === 'loading' ? (
              <p className="clear-copy">Loading provider keys...</p>
            ) : null}
            {providerCredentials?.credentials.length ? (
              providerCredentials.credentials.map((credential) => (
                <article className="provider-key-card" key={credential.credentialId}>
                  <div>
                    <strong>{credential.label}</strong>
                    <p>
                      {credential.providerId} - {credential.maskedKey}
                    </p>
                    <small>
                      Test status: {credential.lastTestStatus}
                      {credential.lastTestError
                        ? ` (${credential.lastTestError})`
                        : ''}
                    </small>
                  </div>
                  <div className="provider-card-actions">
                    <button
                      type="button"
                      onClick={() => handleTestProviderCredential(credential.credentialId)}
                    >
                      Test connection
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => handleEditProviderCredential(credential)}
                    >
                      Edit
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => handleDeleteProviderCredential(credential.credentialId)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="clear-copy">No workspace provider keys saved yet.</p>
            )}
          </div>
        </div>

        {providerCredentials ? (
          <div className="provider-instructions">
            {Object.entries(providerCredentials.instructions).map(
              ([providerId, instruction]) => (
                <article key={providerId}>
                  <strong>Where to get {instruction.label} keys</strong>
                  <a href={instruction.url} target="_blank" rel="noreferrer">
                    Open provider console
                  </a>
                  <ol>
                    {instruction.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </article>
              ),
            )}
          </div>
        ) : null}
      </section>

      <section className="panel billing-panel" id="billing">
        <div className="section-heading">
          <p className="eyebrow">Workspace Billing</p>
          <h2>Upgrade tiers and unlock paid features.</h2>
          <p>
            Market Research and higher daily usage limits require a paid
            workspace tier. Checkout uses mock billing locally or Stripe in
            production.
          </p>
        </div>

        {billingCapabilities?.supportsBillingAlerts && billingAlerts.length ? (
          <div className="billing-alerts">
            <span>Billing alerts</span>
            {billingAlerts.map((alert) => (
              <article
                className={`billing-alert-card billing-alert-card--${alert.severity}`}
                key={alert.billingAlertId}
              >
                <strong>{formatBillingAlertSeverity(alert.severity)}</strong>
                <p>{alert.message}</p>
                <small>{alert.type.replaceAll('_', ' ')}</small>
              </article>
            ))}
          </div>
        ) : null}

        <div className="billing-summary">
          <article className="billing-status-card">
            <span>Current workspace</span>
            <strong>{defaultWorkspaceId}</strong>
            <p>
              Tier:{' '}
              {billingStatus?.billingRecord
                ? formatPaidTier(billingStatus.billingRecord.paidTier)
                : 'Unknown'}
            </p>
            <p>
              Status:{' '}
              {billingStatus?.billingRecord
                ? formatBillingStatus(billingStatus.billingRecord.status)
                : billingAction === 'loading'
                  ? 'Loading...'
                  : 'Unavailable'}
            </p>
            {billingStatus?.billingRecord?.externalCustomerId ? (
              <small>
                Customer: {billingStatus.billingRecord.externalCustomerId}
              </small>
            ) : null}
          </article>

          <article className="billing-guidance-card">
            <span>Billing mode</span>
            <strong>
              {billingCapabilities?.enabled
                ? billingCapabilities.adapter === 'mock'
                  ? 'Mock checkout'
                  : 'Stripe checkout'
                : 'Disabled'}
            </strong>
            <p>{describeBillingCapabilities(billingCapabilities)}</p>
            <div className="billing-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={billingAction !== 'idle'}
                onClick={() => void handleLoadBillingStatus()}
              >
                Refresh billing status
              </button>
              {canOpenCustomerPortal(
                billingCapabilities,
                billingStatus?.billingRecord?.externalCustomerId,
              ) ? (
                <button
                  type="button"
                  disabled={billingAction !== 'idle'}
                  onClick={() => void handleOpenCustomerPortal()}
                >
                  {billingAction === 'portal'
                    ? 'Opening portal...'
                    : 'Manage subscription'}
                </button>
              ) : null}
            </div>
          </article>
        </div>

        {mockCustomerPortal ? (
          <div className="billing-portal-card">
            <span>Mock customer portal</span>
            <strong>
              {formatPaidTier(mockCustomerPortal.paidTier)} ·{' '}
              {formatBillingStatus(mockCustomerPortal.status)}
            </strong>
            <p>
              Customer {mockCustomerPortal.externalCustomerId} can manage the
              workspace subscription here during local development.
            </p>
            <ul className="billing-portal-actions">
              {mockCustomerPortal.availableActions.includes(
                'update_payment_method',
              ) ? (
                <li>Update payment method (Stripe only in production)</li>
              ) : null}
              {mockCustomerPortal.availableActions.includes(
                'cancel_subscription',
              ) ? (
                <li>
                  <button
                    className="danger-button"
                    type="button"
                    disabled={billingAction !== 'idle'}
                    onClick={() => void handleCancelMockSubscription()}
                  >
                    {billingAction === 'canceling'
                      ? 'Canceling...'
                      : 'Cancel subscription'}
                  </button>
                </li>
              ) : null}
            </ul>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setMockCustomerPortal(null)}
            >
              Close portal
            </button>
          </div>
        ) : null}

        {billingMessage ? (
          <div className="billing-alert billing-alert--success">
            <strong>{billingMessage}</strong>
          </div>
        ) : null}

        {billingError ? (
          <p className="form-error">{billingError}</p>
        ) : null}

        <div className="billing-grid">
          {(['free', 'pro', 'business'] as const).map((tier) => {
            const currentTier = billingStatus?.billingRecord?.paidTier ?? 'free'
            const isCurrent = currentTier === tier
            const isUpgradeTarget =
              billingCapabilities?.checkoutTiers.includes(
                tier as CheckoutPaidTier,
              ) ?? false

            return (
              <article
                className={`billing-tier-card${isCurrent ? ' billing-tier-card--current' : ''}`}
                key={tier}
              >
                <span>{formatPaidTier(tier)}</span>
                <strong>{formatTierLimits(tier)}</strong>
                <p>
                  {tier === 'free'
                    ? 'Default local tier with core planning flow.'
                    : tier === 'pro'
                      ? 'Unlocks Market Research and higher daily limits.'
                      : 'Highest limits for teams running frequent deep runs.'}
                </p>
                {isCurrent ? (
                  <p className="billing-tier-badge">Current tier</p>
                ) : tier !== 'free' &&
                  isUpgradeTarget &&
                  billingCapabilities?.supportsCheckout ? (
                  <button
                    type="button"
                    disabled={billingAction === 'upgrading'}
                    onClick={() => void handleUpgradeBillingTier(tier)}
                  >
                    {billingAction === 'upgrading'
                      ? 'Starting checkout...'
                      : `Upgrade to ${formatPaidTier(tier)}`}
                  </button>
                ) : (
                  <p className="clear-copy">
                    {billingCapabilities?.enabled
                      ? 'Checkout unavailable for this tier.'
                      : 'Enable STRIPE_ENABLED=true on the API to start checkout.'}
                  </p>
                )}
              </article>
            )
          })}
        </div>

        {billingCapabilities?.supportsUsageSummary && billingUsageSummary ? (
          <div className="billing-usage-summary">
            <span>Daily usage</span>
            <p className="clear-copy">
              UTC period ending{' '}
              {new Date(billingUsageSummary.usagePeriodEnd).toLocaleString()}
            </p>
            <div className="billing-usage-meters">
              <article className="billing-usage-meter">
                <div className="billing-usage-meter__header">
                  <strong>Tokens</strong>
                  <small>
                    {formatUsageMeterLabel(
                      billingUsageSummary.dailyUsage.totalTokens,
                      billingUsageSummary.dailyTokenLimit,
                      'tokens',
                    )}
                  </small>
                </div>
                <div
                  className="billing-usage-meter__track"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={billingUsageSummary.dailyTokenLimit}
                  aria-valuenow={billingUsageSummary.dailyUsage.totalTokens}
                  aria-label="Daily token usage"
                >
                  <div
                    className="billing-usage-meter__fill"
                    style={{
                      width: `${formatUsagePercent(
                        billingUsageSummary.dailyUsage.totalTokens,
                        billingUsageSummary.dailyTokenLimit,
                      )}%`,
                    }}
                  />
                </div>
              </article>
              <article className="billing-usage-meter">
                <div className="billing-usage-meter__header">
                  <strong>Estimated cost</strong>
                  <small>
                    {formatUsageCostLabel(
                      billingUsageSummary.dailyUsage.estimatedCostUsd,
                      billingUsageSummary.dailyCostLimitUsd,
                    )}
                  </small>
                </div>
                <div
                  className="billing-usage-meter__track"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={billingUsageSummary.dailyCostLimitUsd}
                  aria-valuenow={billingUsageSummary.dailyUsage.estimatedCostUsd}
                  aria-label="Daily estimated cost usage"
                >
                  <div
                    className="billing-usage-meter__fill billing-usage-meter__fill--cost"
                    style={{
                      width: `${formatUsagePercent(
                        billingUsageSummary.dailyUsage.estimatedCostUsd,
                        billingUsageSummary.dailyCostLimitUsd,
                      )}%`,
                    }}
                  />
                </div>
              </article>
            </div>
          </div>
        ) : null}

        {billingCapabilities?.supportsMeteredUsage ? (
          <div className="billing-meter-usage">
            <span>Metered usage reports</span>
            {billingMeterUsageReports.length ? (
              billingMeterUsageReports.map((report) => (
                <article
                  className="billing-meter-usage-card"
                  key={report.billingMeterUsageReportId}
                >
                  <strong>
                    {report.quantity.toLocaleString()} {report.metric}
                  </strong>
                  <p>{formatMeterUsageReportStatus(report.status)}</p>
                  <small>
                    {report.runId ? `Run ${report.runId}` : 'Manual report'}
                    {report.externalUsageRecordId
                      ? ` · ${report.externalUsageRecordId}`
                      : ''}
                  </small>
                </article>
              ))
            ) : (
              <p className="clear-copy">
                No metered usage reports recorded for this workspace yet.
              </p>
            )}
          </div>
        ) : null}

        {billingCapabilities?.supportsWebhookAudit ? (
          <div className="billing-webhook-events">
            <span>Recent webhook events</span>
            {billingWebhookEvents.length ? (
              billingWebhookEvents.map((event) => (
                <article className="billing-webhook-event" key={event.billingWebhookEventId}>
                  <strong>{event.eventType}</strong>
                  <p>
                    {event.status} · {event.externalEventId}
                  </p>
                  <small>{new Date(event.receivedAt).toLocaleString()}</small>
                </article>
              ))
            ) : (
              <p className="clear-copy">No webhook events recorded for this workspace yet.</p>
            )}
          </div>
        ) : null}

        {billingCapabilities?.supportsInvoiceHistory ? (
          <div className="billing-invoice-history">
            <div className="billing-invoice-history__header">
              <span>Invoice history</span>
              {billingCapabilities.supportsBillingExport ? (
                <div className="billing-export-actions">
                  <button
                    type="button"
                    onClick={() => handleExportBillingInvoices('csv')}
                    disabled={billingAction !== 'idle'}
                  >
                    Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportBillingInvoices('json')}
                    disabled={billingAction !== 'idle'}
                  >
                    Export JSON
                  </button>
                </div>
              ) : null}
            </div>
            {billingInvoices.length ? (
              billingInvoices.map((invoice) => (
                <article className="billing-invoice-card" key={invoice.billingInvoiceId}>
                  <div>
                    <strong>
                      {formatInvoiceAmount(invoice.amountTotalUsd, invoice.currency)}
                    </strong>
                    <p>
                      {formatInvoiceStatus(invoice.status)}
                      {invoice.paidTier
                        ? ` · ${formatPaidTier(invoice.paidTier)}`
                        : ''}
                    </p>
                    <small>{invoice.externalInvoiceId}</small>
                  </div>
                  <div className="billing-invoice-meta">
                    <small>{new Date(invoice.createdAt).toLocaleString()}</small>
                    {invoice.hostedInvoiceUrl ? (
                      <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer">
                        View invoice
                      </a>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <p className="clear-copy">No invoices recorded for this workspace yet.</p>
            )}
          </div>
        ) : null}
      </section>

      {draftRun && reviewDraft ? (
        <section className="panel review-panel">
          <div className="section-heading">
            <p className="eyebrow">Human Review</p>
            <h2>Approve the plan before execution.</h2>
            <p>
              Draft state is autosaved locally. Review Shield context, triage,
              selected agents, and estimated run cost before execution.
            </p>
          </div>

          <div className="review-grid">
            <div className="review-card">
              <span>Input with Shield context</span>
              <div
                className={`shield-warning-card shield-warning-card--${draftRun.shieldScan.status}`}
              >
                <strong>
                  Shield {draftRun.shieldScan.status}:{' '}
                  {getSeverityLabel(draftRun.shieldScan.maxSeverity)}
                </strong>
                <p>
                  {draftRun.shieldScan.findings.length > 0
                    ? `${draftRun.shieldScan.findings.length} finding(s) require review before execution.`
                    : 'No meaningful findings. Shield stays quiet and the run can proceed.'}
                </p>
              </div>
              <p className="review-idea">
                {getHighlightedIdea(draftRun.idea.rawIdea, draftRun.shieldScan.findings)}
              </p>
              {draftRun.shieldScan.findings.length > 0 ? (
                <>
                  <div className="finding-tabs" aria-label="Shield findings">
                    {draftRun.shieldScan.findings.map((finding) => (
                      <button
                        className={
                          finding.findingId === activeFinding?.findingId
                            ? 'finding-tab finding-tab--active'
                            : 'finding-tab'
                        }
                        key={finding.findingId}
                        type="button"
                        onClick={() => setActiveFindingId(finding.findingId)}
                      >
                        {finding.category}
                      </button>
                    ))}
                  </div>
                  {activeFinding ? (
                    <div className="finding-detail">
                      <strong>
                        {activeFinding.category} · {activeFinding.severity}
                      </strong>
                      <p>{activeFinding.explanation}</p>
                      <small>Recommended action: {activeFinding.recommendedAction}</small>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="clear-copy">No meaningful Shield findings.</p>
              )}
            </div>

            <div className="review-card">
              <span>Editable triage metadata</span>
              <div className="field-grid">
                <label>
                  Domain
                  <select
                    value={reviewDraft.triage.domain}
                    onChange={(event) =>
                      updateReviewTriage('domain', event.target.value)
                    }
                  >
                    {domainOptions.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Complexity
                  <select
                    value={reviewDraft.triage.complexity}
                    onChange={(event) =>
                      updateReviewTriage(
                        'complexity',
                        event.target.value as DraftRun['triage']['complexity'],
                      )
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  Market confidence
                  <select
                    value={reviewDraft.triage.marketConfidence}
                    onChange={(event) =>
                      updateReviewTriage(
                        'marketConfidence',
                        event.target
                          .value as DraftRun['triage']['marketConfidence'],
                      )
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  Security sensitivity
                  <select
                    value={reviewDraft.triage.securitySensitivity}
                    onChange={(event) =>
                      updateReviewTriage(
                        'securitySensitivity',
                        event.target
                          .value as DraftRun['triage']['securitySensitivity'],
                      )
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>
              <div className="triage-rationale">
                <strong>Why this routing?</strong>
                <p>{reviewDraft.triage.reasoningSummary}</p>
              </div>
            </div>
          </div>

          <div className="review-card">
            <span>Selected agents</span>
            <div className="agent-selection-summary">
              <strong>{selectedAgentCount} selected</strong>
              <span>{selectedSpecialistCount} specialists + Moderator</span>
              <span>{reviewDraft.triage.recommendedRunMode} run mode</span>
            </div>
            <div className="agent-toggle-list">
              {agentOptions.map((agent) => (
                <label
                  key={agent}
                  className={
                    reviewDraft.selectedAgents.includes(agent)
                      ? 'agent-toggle agent-toggle--selected'
                      : 'agent-toggle'
                  }
                >
                  <input
                    type="checkbox"
                    checked={reviewDraft.selectedAgents.includes(agent)}
                    onChange={() => toggleAgent(agent)}
                  />
                  {formatAgent(agent)}
                </label>
              ))}
            </div>
            <div className="agent-rationale-grid">
              {reviewDraft.selectedAgents.map((agent) => (
                <article className="agent-rationale-card" key={agent}>
                  <strong>{formatAgent(agent)}</strong>
                  <p>{agentCatalog[agent]?.rationale ?? 'Selected for this run.'}</p>
                  {reviewDraft.triage.recommendedAgents.includes(agent) ? (
                    <small>Recommended by triage</small>
                  ) : (
                    <small>Added during human review</small>
                  )}
                </article>
              ))}
            </div>
            <div className="estimate-row">
              <span>{reviewDraft.triage.estimatedDurationSeconds}s estimate</span>
              <span>${reviewDraft.triage.estimatedMaxCostUsd.toFixed(2)} max cost</span>
              <span>{reviewDraft.triage.complexity} complexity</span>
              <span>{reviewDraft.triage.securitySensitivity} security</span>
            </div>
            <button
              className="execute-button"
              type="button"
              disabled={
                pipelineState === 'running' || reviewDraft.selectedAgents.length < 3
              }
              onClick={handleExecuteApprovedRun}
            >
              {pipelineState === 'running'
                ? useTemporalWorkflowRuntime
                  ? 'Starting Temporal workflow...'
                  : 'Executing prompt-driven pipeline...'
                : useTemporalWorkflowRuntime
                  ? 'Execute with Temporal workflow'
                  : 'Execute prompt-driven pipeline'}
            </button>
            {showResumeTemporalObservation && activeTemporalWorkflow ? (
              <button
                className="secondary-button"
                type="button"
                disabled={pipelineState === 'running'}
                onClick={() => handleResumeTemporalWorkflow(activeTemporalWorkflow)}
              >
                Resume observation
              </button>
            ) : null}
            {useTemporalWorkflowRuntime ? (
              <p className="runtime-note">
                {approvedRunRuntimeLabel}. Make sure `TEMPORAL_ENABLED=true`
                and the worker are running.
              </p>
            ) : (
              <p className="runtime-note">{approvedRunRuntimeLabel}</p>
            )}
            {temporalRuntimeHealth && temporalRuntimeHealth.status !== 'healthy' ? (
              <p className="form-error">{temporalRuntimeHealth.guidance}</p>
            ) : null}
            {temporalRuntimeHealth?.status === 'healthy' ? (
              <p className="runtime-note">{temporalRuntimeHealth.guidance}</p>
            ) : null}
            {temporalRecoveryHint ? (
              <p className="runtime-note">{temporalRecoveryHint}</p>
            ) : null}
            {pipelineError ? <p className="form-error">{pipelineError}</p> : null}
          </div>
        </section>
      ) : null}

      {pipelineResult || streamEvents.length > 0 ? (
        <section className="panel results-panel">
          <div className="section-heading">
            <p className="eyebrow">Pipeline Result</p>
            <h2>
              {pipelineState === 'running'
                ? useTemporalWorkflowRuntime
                  ? 'Observing Temporal workflow...'
                  : 'Streaming run status...'
                : 'Artifacts generated from isolated prompt-driven agents.'}
            </h2>
            {activeTemporalWorkflow ? (
              <p>
                Workflow {activeTemporalWorkflow.workflowId} is{' '}
                {activeTemporalWorkflow.status}.
              </p>
            ) : null}
          </div>

          <div className="step-list">
            {displayedSteps.map((step) => (
              <div className="step-item" key={`${step.stepId}-${step.status}`}>
                <span>{step.label}</span>
                <strong>{step.status}</strong>
              </div>
            ))}
          </div>

          {pipelineResult ? (
            <div className="agent-result-grid">
              {pipelineResult.agentOutputs.map((agentOutput) => (
                <article className="agent-card" key={agentOutput.agentRole}>
                  <h3>{formatAgent(agentOutput.agentRole)}</h3>
                  <p>{agentOutput.output.summary}</p>
                  <div className="metadata-row">
                    <span>{agentOutput.validationStatus}</span>
                    <span>{agentOutput.modelProvider}</span>
                    <span>{agentOutput.inputTokens + agentOutput.outputTokens} tokens</span>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {visibleArtifacts.length > 0 ? (
            <div className="artifact-viewer">
              <div className="artifact-tabs" aria-label="Generated artifacts">
                {visibleArtifacts.map((artifact) => (
                  <button
                    className={
                      artifact.metadata.artifactType === activeArtifactType
                        ? 'artifact-tab artifact-tab--active'
                        : 'artifact-tab'
                    }
                    key={artifact.metadata.artifactType}
                    type="button"
                    onClick={() => setActiveArtifactType(artifact.metadata.artifactType)}
                  >
                    {formatArtifactTitle(artifact.metadata.artifactType)}
                  </button>
                ))}
              </div>

              {selectedArtifact ? (
                <article className="artifact-card">
                  <div className="artifact-card-header">
                    <span>{formatArtifactTitle(selectedArtifact.metadata.artifactType)}</span>
                    <div className="metadata-row">
                      <span>{selectedArtifact.metadata.validationStatus}</span>
                      <span>{selectedArtifact.metadata.modelProvider}</span>
                      <span>{selectedArtifact.metadata.shieldStatus} shield</span>
                      <span>
                        {selectedArtifact.metadata.tokenUsage.inputTokens +
                          selectedArtifact.metadata.tokenUsage.outputTokens}{' '}
                        tokens
                      </span>
                    </div>
                  </div>
                  <p className="prompt-version">
                    Prompt version: {selectedArtifact.metadata.promptVersion}
                  </p>
                  {Object.entries(selectedArtifact.artifact.content).map(([key, value]) => (
                    <div className="artifact-section" key={key}>
                      <strong>{formatAgent(key)}</strong>
                      {renderArtifactValue(value)}
                    </div>
                  ))}
                </article>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="panel history-panel">
        <div className="section-heading">
          <p className="eyebrow">Artifact History</p>
          <h2>Durable artifacts from previous runs.</h2>
          <p>
            History is workspace-scoped. Each artifact is immutable and can be
            exported as Markdown from its persisted content.
          </p>
        </div>
        <button
          className="execute-button"
          type="button"
          onClick={handleLoadArtifactHistory}
        >
          Load artifact history
        </button>
        {historyError ? <p className="form-error">{historyError}</p> : null}
        {artifactHistory.length > 0 ? (
          <div className="history-list">
            {artifactHistory.map((artifact) => (
              <article className="history-item" key={artifact.artifactId}>
                <div>
                  <strong>{formatArtifactTitle(artifact.artifactType)}</strong>
                  <p>
                    Run {artifact.runId} - version {artifact.artifactVersion}
                  </p>
                  <small>{new Date(artifact.createdAt).toLocaleString()}</small>
                </div>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => handleExportMarkdown(artifact.artifactId)}
                >
                  Export Markdown
                </button>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="panel" id="pipeline">
        <div className="section-heading">
          <p className="eyebrow">Pipeline</p>
          <h2>Structured, resumable, and guarded.</h2>
        </div>
        <ol className="pipeline-list">
          {pipelineSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="grid-section">
        <div className="panel">
          <p className="eyebrow">Agent model</p>
          <h2>Parallel experts, no endless debate.</h2>
          <div className="agent-list">
            {agentCards.map((agent) => (
              <article className="agent-card" key={agent.title}>
                <h3>{agent.title}</h3>
                <p>{agent.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel shield-panel">
          <p className="eyebrow">Shield layer</p>
          <h2>Security stays quiet until it matters.</h2>
          <p>
            Shield scans user input, agent output, moderator synthesis, and
            final artifacts. Findings are shown as compact warnings with exact
            text highlights, while low-risk checks stay in the background.
          </p>
          <div className="finding-preview">
            <span>Example finding</span>
            <mark>ignore previous instructions</mark>
            <p>Prompt injection pattern detected. Require confirmation.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
