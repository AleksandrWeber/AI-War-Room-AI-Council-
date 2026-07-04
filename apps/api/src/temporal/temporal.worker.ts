import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { NativeConnection, Worker } from '@temporalio/worker'
import { AppModule } from '../app.module.js'
import type { ApiEnv } from '../config/env.js'
import { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import { RunsService } from '../runs/runs.service.js'
import { createRunWorkflowActivities } from './run-workflow.activities.js'
import { getTemporalWorkerConfig } from './temporal-worker.config.js'
import { TemporalWorkerHeartbeatService } from './temporal-worker-heartbeat.service.js'

export async function startTemporalWorker() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const configService = app.get(ConfigService<ApiEnv, true>)
  const runsService = app.get(RunsService)
  const streamEventBufferService = app.get(StreamEventBufferService)
  const temporalWorkerHeartbeatService = app.get(TemporalWorkerHeartbeatService)
  const workerConfig = getTemporalWorkerConfig(configService)
  const connection = await NativeConnection.connect({
    address: workerConfig.address,
  })

  const worker = await Worker.create({
    connection,
    namespace: workerConfig.namespace,
    taskQueue: workerConfig.taskQueue,
    workflowsPath: workerConfig.workflowsPath,
    activities: createRunWorkflowActivities({
      runsService,
      streamEventBufferService,
    }),
  })

  console.log(
    `AI War Room Temporal worker listening on ${workerConfig.taskQueue} (${workerConfig.namespace})`,
  )

  await temporalWorkerHeartbeatService.recordHeartbeat(workerConfig.taskQueue)
  const heartbeatInterval = setInterval(() => {
    void temporalWorkerHeartbeatService.recordHeartbeat(workerConfig.taskQueue)
  }, 30_000)

  try {
    await worker.run()
  } finally {
    clearInterval(heartbeatInterval)
  }
  await connection.close()
  await app.close()
}

if (process.env.NODE_ENV !== 'test') {
  void startTemporalWorker()
}
