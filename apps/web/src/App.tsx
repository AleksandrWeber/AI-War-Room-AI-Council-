import { useEffect, useState, type FormEvent } from 'react'
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

type AgentExecution = {
  agentRole: string
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
  return agent
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function getHighlightedIdea(rawIdea: string, finding?: ShieldFinding) {
  if (!finding?.span) {
    return rawIdea
  }

  return (
    <>
      {rawIdea.slice(0, finding.span.start)}
      <mark>{rawIdea.slice(finding.span.start, finding.span.end)}</mark>
      {rawIdea.slice(finding.span.end)}
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
  const [pipelineResult, setPipelineResult] =
    useState<MockPipelineResult | null>(null)

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

    try {
      const response = await fetch(`${apiBaseUrl}/runs/mock-pipeline`, {
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

      setPipelineResult((await response.json()) as MockPipelineResult)
      setPipelineState('completed')
    } catch (error) {
      setPipelineState('error')
      setPipelineError(
        error instanceof Error ? error.message : 'Failed to execute mock pipeline.',
      )
    }
  }

  const firstFinding = draftRun?.shieldScan.findings[0]

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
              Draft state is autosaved locally. This MVP step does not execute
              agents yet.
            </p>
          </div>

          <div className="review-grid">
            <div className="review-card">
              <span>Input with Shield context</span>
              <p className="review-idea">
                {getHighlightedIdea(draftRun.idea.rawIdea, firstFinding)}
              </p>
              {firstFinding ? (
                <div className="finding-detail">
                  <strong>{firstFinding.category}</strong>
                  <p>{firstFinding.explanation}</p>
                </div>
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
            </div>
          </div>

          <div className="review-card">
            <span>Selected agents</span>
            <div className="agent-toggle-list">
              {agentOptions.map((agent) => (
                <label key={agent} className="agent-toggle">
                  <input
                    type="checkbox"
                    checked={reviewDraft.selectedAgents.includes(agent)}
                    onChange={() => toggleAgent(agent)}
                  />
                  {formatAgent(agent)}
                </label>
              ))}
            </div>
            <div className="estimate-row">
              <span>{reviewDraft.triage.recommendedRunMode} run</span>
              <span>{reviewDraft.triage.estimatedDurationSeconds}s estimate</span>
              <span>${reviewDraft.triage.estimatedMaxCostUsd.toFixed(2)} max</span>
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
                ? 'Executing mock pipeline...'
                : 'Execute mock pipeline'}
            </button>
            {pipelineError ? <p className="form-error">{pipelineError}</p> : null}
          </div>
        </section>
      ) : null}

      {pipelineResult ? (
        <section className="panel results-panel">
          <div className="section-heading">
            <p className="eyebrow">Mock Pipeline Result</p>
            <h2>Artifacts generated from isolated mock agents.</h2>
          </div>

          <div className="step-list">
            {pipelineResult.steps.map((step) => (
              <div className="step-item" key={step.stepId}>
                <span>{step.label}</span>
                <strong>{step.status}</strong>
              </div>
            ))}
          </div>

          <div className="agent-result-grid">
            {pipelineResult.agentOutputs.map((agentOutput) => (
              <article className="agent-card" key={agentOutput.agentRole}>
                <h3>{formatAgent(agentOutput.agentRole)}</h3>
                <p>{agentOutput.output.summary}</p>
              </article>
            ))}
          </div>

          <div className="artifact-grid">
            {pipelineResult.artifacts.map((artifact) => (
              <article
                className="artifact-card"
                key={artifact.metadata.artifactType}
              >
                <span>{formatAgent(artifact.metadata.artifactType)}</span>
                {Object.entries(artifact.artifact.content).map(([key, value]) => (
                  <div className="artifact-section" key={key}>
                    <strong>{formatAgent(key)}</strong>
                    {renderArtifactValue(value)}
                  </div>
                ))}
              </article>
            ))}
          </div>
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
