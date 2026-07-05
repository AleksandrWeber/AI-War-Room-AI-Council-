import { describe, expect, it } from 'vitest'
import { buildDeploymentAdminStats } from './deployment-admin.helpers.js'

describe('deployment admin helpers', () => {
  it('builds deployment admin stats', () => {
    expect(
      buildDeploymentAdminStats({
        readiness: {
          service: 'ai-war-room-api',
          status: 'ready',
          dependencies: [
            { name: 'postgres', status: 'up' },
            { name: 'redis', status: 'up' },
          ],
          checkedAt: '2026-01-01T00:00:00.000Z',
        },
        apiVersion: '0.0.0',
      }),
    ).toMatchObject({
      readinessStatus: 'ready',
      healthyDependencyCount: 2,
      totalDependencies: 2,
      apiVersion: '0.0.0',
    })
  })
})
