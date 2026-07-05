import { describe, expect, it } from 'vitest'
import { evaluateDeploymentRollout } from './deployment-rollout.helpers.js'

describe('evaluateDeploymentRollout', () => {
  it('passes when readiness and dependencies are healthy', () => {
    const rollout = evaluateDeploymentRollout({
      nodeEnv: 'test',
      readinessStatus: 'ready',
      dependencies: [
        { name: 'postgres', status: 'up' },
        { name: 'redis', status: 'up' },
      ],
      webOrigin: 'http://127.0.0.1:5173',
      supportsApiHealthEndpoint: true,
      supportsApiReadinessProbe: true,
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production with local web origin', () => {
    const rollout = evaluateDeploymentRollout({
      nodeEnv: 'production',
      readinessStatus: 'ready',
      dependencies: [
        { name: 'postgres', status: 'up' },
        { name: 'redis', status: 'up' },
      ],
      webOrigin: 'http://127.0.0.1:5173',
      supportsApiHealthEndpoint: true,
      supportsApiReadinessProbe: true,
    })

    expect(rollout.status).toBe('not_ready')
  })
})
