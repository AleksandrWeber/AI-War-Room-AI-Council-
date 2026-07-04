export type HealthStatus = {
  service: 'ai-war-room-api'
  status: 'ok'
  version: string
}

export function getHealthStatus(): HealthStatus {
  return {
    service: 'ai-war-room-api',
    status: 'ok',
    version: '0.0.0',
  }
}

if (process.env.NODE_ENV !== 'test') {
  console.log(getHealthStatus())
}
