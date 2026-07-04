import { Fragment, useEffect, useState, type FormEvent } from 'react'
import './App.css'

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
    artifactType: 'executive_summary' | 'prd' | 'development_prompt'
    promptVersion: string
    modelProvider: string
    modelName: string
    validationStatus: 'valid' | 'repaired' | 'fallback'
    shieldStatus: 'clear' | 'warning' | 'blocked'
    tokenUsage: {
      inputTokens: number
      outputTokens: number
    }
  }
  artifact: {
    artifactType: 'executive_summary' | 'prd' | 'development_prompt'
    content: Record<string, unknown>
  }
}

type MockPipelineResult = {
  status: 'completed'
  steps: PipelineStep[]
  agentOutputs: AgentExecution[]
  artifacts: ArtifactResult[]
}

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000/api'
const reviewStorageKey = 'ai-war-room.review-draft'
const ideaStorageKey = 'ai-war-room.idea-draft'
const pipelineResultStorageKey = 'ai-war-room.pipeline-result'

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
  const [activeFindingId, setActiveFindingId] = useState<string | null>(null)
  const [activeArtifactType, setActiveArtifactType] =
    useState<ArtifactResult['metadata']['artifactType']>('executive_summary')

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

    return () => {
      controller.abort()
    }
  }, [])

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

  async function handleExecuteMockPipeline() {
    if (!draftRun || !reviewDraft) {
      return
    }

    setPipelineState('running')
    setPipelineError(null)
    setPipelineResult(null)
    setStreamEvents([])
    setStreamedArtifacts([])

    try {
      const response = await fetch(`${apiBaseUrl}/runs/mock-pipeline/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draftRun,
          approvedTriage: reviewDraft.triage,
          selectedAgents: reviewDraft.selectedAgents,
        }),
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

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
          handlePipelineStreamEvent(event)
        }

        if (done) {
          break
        }
      }

      for (const event of parseSseEvents(buffer)) {
        handlePipelineStreamEvent(event)
      }
    } catch (error) {
      setPipelineState('error')
      setPipelineError(
        error instanceof Error
          ? error.message
          : 'Failed to execute prompt-driven pipeline.',
      )
    }
  }

  function handlePipelineStreamEvent(event: PipelineStreamEvent) {
    setStreamEvents((current) => [...current, event])

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
  const selectedAgentCount = reviewDraft?.selectedAgents.length ?? 0
  const selectedSpecialistCount =
    reviewDraft?.selectedAgents.filter((agent) => agent !== 'moderator').length ?? 0

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
              onClick={handleExecuteMockPipeline}
            >
              {pipelineState === 'running'
                ? 'Executing prompt-driven pipeline...'
                : 'Execute prompt-driven pipeline'}
            </button>
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
                ? 'Streaming run status...'
                : 'Artifacts generated from isolated prompt-driven agents.'}
            </h2>
          </div>

          <div className="step-list">
            {(pipelineResult?.steps ?? statusEvents).map((step) => (
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
