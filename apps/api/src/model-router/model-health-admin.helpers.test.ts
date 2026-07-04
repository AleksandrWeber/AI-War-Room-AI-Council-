import { describe, expect, it } from 'vitest'
import {
  buildModelHealthAdminStats,
  resolveModelHealthAdminActions,
} from './model-health-admin.helpers.js'

describe('resolveModelHealthAdminActions', () => {
  it('offers recover when degraded models exist', () => {
    expect(
      resolveModelHealthAdminActions({
        models: [
          {
            modelId: 'mock-json-v1-primary',
            providerId: 'mock',
            modelName: 'mock-json-v1',
            lifecycleStatus: 'active',
            healthStatus: 'degraded',
            consecutiveFailures: 1,
            updatedAt: '2026-07-04T12:00:00.000Z',
          },
        ],
      }),
    ).toEqual(['recover_model'])
  })

  it('builds model health stats', () => {
    expect(
      buildModelHealthAdminStats([
        {
          modelId: 'mock-json-v1-primary',
          providerId: 'mock',
          modelName: 'mock-json-v1',
          lifecycleStatus: 'active',
          healthStatus: 'healthy',
          consecutiveFailures: 0,
          updatedAt: '2026-07-04T12:00:00.000Z',
        },
        {
          modelId: 'mock-json-v2-candidate',
          providerId: 'mock',
          modelName: 'mock-json-v2-candidate',
          lifecycleStatus: 'candidate',
          healthStatus: 'healthy',
          consecutiveFailures: 0,
          updatedAt: '2026-07-04T12:00:00.000Z',
        },
      ]),
    ).toEqual({
      totalModels: 2,
      activeModels: 1,
      degradedModels: 0,
      candidateModels: 1,
    })
  })
})
